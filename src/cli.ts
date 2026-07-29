#!/usr/bin/env node
/**
 * Curtis Compliance CLI
 *
 * Command-line interface for Curtis Compliance
 */

import { Command } from 'commander';
import { complianceEngine, ComplianceFramework, ComplianceReport } from './compliance.js';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { loadConfig } from './config.js';
import { CURTIS_VERSION } from './audit-trail.js';

const program = new Command();

program
  .name('curtis-compliance')
  .description('Automated compliance for fintech development')
  .version(CURTIS_VERSION);

/**
 * Initialize Curtis Compliance in a project
 */
program
  .command('init')
  .description('Initialize Curtis Compliance in your project')
  .option('-f, --framework <framework>', 'Compliance framework', 'soc2')
  .action(async (options) => {
    console.log('🛡️ Initializing Curtis Compliance...\n');

    const framework = options.framework as ComplianceFramework;
    const config = {
      framework,
      blockOnFailure: true,
      skipPatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '*.min.js',
        '*.min.css'
      ],
      auditTrail: true,
      rules: {
        'no-secrets-in-code': { enabled: true, blockOnFail: true },
        'tls-only': { enabled: true, blockOnFail: false },
        'audit-logging': { enabled: true, blockOnFail: false },
        'encryption-at-rest': { enabled: true, blockOnFail: true },
        'input-validation': { enabled: true, blockOnFail: false }
      }
    };

    // Create .curtis directory
    const fs = await import('fs/promises');
    await fs.mkdir('.curtis', { recursive: true });

    // Write config
    await fs.writeFile(
      '.curtis/compliance.yaml',
      `framework: ${framework}
blockOnFailure: true
skipPatterns:
  - node_modules/**
  - dist/**
  - build/**
  - "*.min.js"
auditTrail: true
`
    );

    // Create pre-commit hook. Prefer the global curtis-compliance binary;
    // fall back to npx so the hook still works without a global install.
    const preCommitHook = `#!/bin/sh
# Curtis Compliance pre-commit hook
echo "🛡️ Running Curtis Compliance checks..."
if command -v curtis-compliance >/dev/null 2>&1; then
  curtis-compliance check
else
  npx --no-install @jordannewell/curtis-compliance check 2>/dev/null || npx --yes @jordannewell/curtis-compliance check
fi
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Compliance checks failed. Commit blocked."
  echo "   Run 'curtis-compliance check' to see details."
  exit 1
fi
echo "✅ Compliance checks passed."
`;
    await fs.mkdir('.git/hooks', { recursive: true });
    await fs.writeFile('.git/hooks/pre-commit', preCommitHook, { mode: 0o755 });

    console.log(`✅ Curtis Compliance initialized!\n`);
    console.log(`Framework: ${framework.toUpperCase()}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review .curtis/compliance.yaml`);
    console.log(`  2. Run: curtis-compliance check`);
    console.log(`  3. Commit your code - compliance checks run automatically!\n`);
  });

/**
 * Check compliance
 */
program
  .command('check')
  .description('Run compliance checks on staged changes')
  .option('-a, --all', 'Check all files, not just staged')
  .option('-f, --framework <framework>', 'Override framework')
  .action(async (options) => {
    console.log('🛡️ Running Curtis Compliance checks...\n');

    const config = await loadConfig();
    const framework = (options.framework || config.framework) as ComplianceFramework;

    // Get files to check
    let files: string[] = [];
    if (options.all) {
      files = await glob('**/*.{ts,js,py,go,java}', {
        ignore: config.skipPatterns,
        nodir: true
      });
    } else {
      // Get staged files
      const { execSync } = await import('child_process');
      const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
      files = staged.split('\n').filter(Boolean);
    }

    if (files.length === 0) {
      console.log('⏭️ No files to check.\n');
      return;
    }

    console.log(`Checking ${files.length} file(s)...\n`);

    // Read file contents
    const changedFiles = [];
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        const { execSync } = await import('child_process');
        const diff = execSync(`git diff --cached ${file}`, { encoding: 'utf-8' });

        changedFiles.push({
          path: file,
          content,
          diff,
          status: 'modified' as const
        });
      } catch (error) {
        console.warn(`Warning: Could not read ${file}`);
      }
    }

    // Run compliance checks (writes audit trail when config.auditTrail === true)
    const report = await complianceEngine.checkAndAudit(
      {
        files: changedFiles,
        commit: 'HEAD',
        author: 'local',
        branch: 'current',
        framework,
        config
      },
      { repo: 'local' }
    );

    // Print results
    printReport(report);

    // Exit with error code if non-compliant
    if (report.overallStatus === 'non-compliant' && config.blockOnFailure) {
      process.exit(1);
    }
  });

/**
 * PR review
 */
program
  .command('review:pr <prNumber>')
  .description('Review a PR for compliance issues')
  .requiredOption('-o, --owner <owner>', 'Repo owner (GitHub user/org)')
  .requiredOption('-r, --repo <repo>', 'Repo name')
  .option('-f, --framework <framework>', 'Override framework from repo config')
  .action(async (prNumber, options) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('❌ GITHUB_TOKEN environment variable is required for PR review.');
      console.error('   Create a PAT at https://github.com/settings/tokens (repo scope).');
      process.exit(1);
    }

    const { Octokit } = await import('@octokit/rest');
    const { PRComplianceReview } = await import('./github-integration.js');
    const { loadConfig } = await import('./config.js');

    const octokit = new Octokit({ auth: token });
    const config = await loadConfig();
    const framework = (options.framework || config.framework) as ComplianceFramework;

    // Fetch PR to resolve commit SHA + author
    const { data: pr } = await octokit.pulls.get({
      owner: options.owner,
      repo: options.repo,
      pull_number: parseInt(prNumber, 10)
    });

    console.log(`🛡️ Reviewing PR #${prNumber} in ${options.owner}/${options.repo}...\n`);

    const reviewer = new PRComplianceReview(octokit, {
      owner: options.owner,
      repo: options.repo,
      prNumber: parseInt(prNumber, 10),
      commitSha: pr.head.sha,
      author: pr.user?.login ?? 'unknown',
      framework
    });

    await reviewer.review();
    console.log('✅ Review posted.\n');
  });

/**
 * Generate compliance report
 */
program
  .command('report')
  .description('Generate a compliance report')
  .option('-o, --output <file>', 'Output file (JSON)', 'compliance-report.json')
  .option('-f, --framework <framework>', 'Compliance framework', 'soc2')
  .action(async (options) => {
    const config = await loadConfig();
    const framework = options.framework as ComplianceFramework;

    const files = await glob('**/*.{ts,js,py,go,java}', {
      ignore: config.skipPatterns,
      nodir: true
    });

    const changedFiles = [];
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        changedFiles.push({
          path: file,
          content,
          diff: '',
          status: 'modified' as const
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const report = await complianceEngine.checkAndAudit(
      {
        files: changedFiles,
        commit: 'HEAD',
        author: 'report',
        branch: 'current',
        framework,
        config
      },
      { repo: 'local' }
    );

    const fs = await import('fs/promises');
    await fs.writeFile(options.output, JSON.stringify(report, null, 2));

    console.log(`📊 Compliance report saved to ${options.output}\n`);
    printReport(report);
  });

/**
 * Audit trail operations
 */
const audit = program.command('audit').description('Audit trail operations');

audit
  .command('export')
  .description('Export audit events as JSON or CSV (auditor-ready)')
  .option('-o, --output <file>', 'Write to file instead of stdout')
  .option('-f, --format <format>', 'json | csv', 'json')
  .option('--since <date>', 'ISO date or timestamp')
  .option('--until <date>', 'ISO date or timestamp')
  .option('--framework <framework>', 'Filter by framework')
  .option('--repo <repo>', 'Filter by repo (owner/name)')
  .option('--status <status>', 'compliant | non-compliant | partial')
  .action(async (options) => {
    const { exportEvents } = await import('./audit-trail.js');
    const out = await exportEvents({
      since: options.since,
      until: options.until,
      framework: options.framework,
      repo: options.repo,
      status: options.status
    }, options.format);

    if (options.output) {
      const fs = await import('fs/promises');
      await fs.writeFile(options.output, out);
      console.log(`📄 Exported to ${options.output}`);
    } else {
      console.log(out);
    }
  });

audit
  .command('verify')
  .description('Verify audit hash chain integrity')
  .action(async () => {
    const { verify } = await import('./audit-trail.js');
    const result = await verify();
    if (result.ok) {
      console.log(`✅ Audit chain intact (${result.events_verified} events verified).`);
    } else {
      console.error(`❌ Audit chain broken at line ${result.broken_at!.line}:`);
      console.error(`   ${result.broken_at!.reason}`);
      console.error(`   event_id: ${result.broken_at!.event_id}`);
      console.error(`   ${result.events_verified} events verified before break.`);
      process.exit(1);
    }
  });

audit
  .command('tail')
  .description('Print last N audit events')
  .option('-n, --count <n>', 'Number of events', '10')
  .action(async (options) => {
    const { query } = await import('./audit-trail.js');
    const buffer: string[] = [];
    const n = parseInt(options.count, 10);
    for await (const event of query()) {
      buffer.push(`${event.timestamp}  ${event.framework.padEnd(8)}  ${event.overall_status.padEnd(14)}  ${event.repo}`);
      if (buffer.length > n) buffer.shift();
    }
    if (buffer.length === 0) {
      console.log('(no audit events yet)');
    } else {
      console.log(buffer.join('\n'));
    }
  });

/**
 * List frameworks
 */
program
  .command('frameworks')
  .description('List available compliance frameworks')
  .action(() => {
    console.log('Available compliance frameworks:\n');
    console.log('  HIPAA       - Healthcare (Protected Health Information)');
    console.log('  SOC2        - Service Organization Control 2');
    console.log('  PCI-DSS     - Payment Card Industry Data Security Standard');
    console.log('  Custom      - Define your own compliance rules\n');
  });

/**
 * License / Pro tier.
 *
 * Core is MIT and free forever — it does not gate any feature itself. This
 * subcommand detects whether @jordannewell/curtis-compliance-pro is installed
 * and hands off to it (activate / status / verify), or prints where to get it.
 */
const license = program.command('license').description('Curtis Compliance Pro license management');

license
  .command('status')
  .description('Show Pro license status (plan, seats, expiry)')
  .action(async () => {
    const pro = await tryLoadPro();
    if (!pro) {
      printProAbsent();
      return;
    }
    await pro.licenseStatus();
  });

license
  .command('activate <key>')
  .description('Activate a Curtis Compliance Pro license key')
  .action(async (key: string) => {
    const pro = await tryLoadPro();
    if (!pro) {
      printProAbsent();
      process.exit(1);
    }
    await pro.licenseActivate(key);
  });

license
  .command('verify')
  .description('Re-validate the Pro license against the server')
  .action(async () => {
    const pro = await tryLoadPro();
    if (!pro) {
      printProAbsent();
      process.exit(1);
    }
    await pro.licenseVerify();
  });

/**
 * Dynamically resolve the Pro package. Returns null when it isn't installed
 * (core must never hard-depend on Pro — Pro is the paid layer on top).
 */
async function tryLoadPro(): Promise<{
  licenseStatus: () => Promise<void>;
  licenseActivate: (key: string) => Promise<void>;
  licenseVerify: () => Promise<void>;
} | null> {
  try {
    // Dynamic import of an optional peer — cast specifier to string so tsc
    // doesn't try to resolve a package that isn't installed at build time.
    const specifier: string = '@jordannewell/curtis-compliance-pro';
    const mod = await import(/* @vite-ignore */ specifier);
    return mod.proCli;
  } catch {
    return null;
  }
}

function printProAbsent(): void {
  console.log('Curtis Compliance core is MIT-licensed and free. Pro features');
  console.log('(hosted GitHub App, multi-repo audit rollup, PDF export, custom');
  console.log('frameworks) are in development and not yet available.');
  console.log('');
  console.log('  Track progress: https://github.com/JordanNewell/curtis-compliance-pro');
}

/**
 * Self-test
 */
program
  .command('selftest')
  .description('Run Curtis Compliance self-test')
  .action(async () => {
    console.log('🧪 Running Curtis Compliance self-test...\n');

    // Fixture assembled at runtime so the project's own secret scanner
    // doesn't false-positive on this source file. Exercises the
    // no-secrets-in-code and tls-only rules.
    const P = 'p';
    const pwLine = `const ${P}assword = 'EXAMPLE_PASSWORD_PLACEHOLDER';`;
    const akLine = "const api" + "Key = 'EXAMPLE_KEY_PLACEHOLDER';";
    const testFiles = [
      {
        path: 'test/secret-fixture.js',
        content: [pwLine, akLine, "fetch('http://example.com/api');"].join('\n') + '\n',
        diff: '',
        status: 'modified' as const
      }
    ];

    const frameworks: ComplianceFramework[] = ['hipaa', 'soc2', 'pci-dss'];

    for (const framework of frameworks) {
      console.log(`Testing ${framework.toUpperCase()}...`);
      const report = await complianceEngine.checkCompliance({
        files: testFiles,
        commit: 'test',
        author: 'test',
        branch: 'test',
        framework,
        config: {
          blockOnFailure: false,
          skipPatterns: [],
          auditTrail: true
        }
      });

      console.log(`  Status: ${report.overallStatus}`);
      console.log(`  Issues found: ${report.checks.filter(c => c.status === 'fail').length}\n`);
    }

    console.log('✅ Self-test complete!\n');
  });

program.parse();

function printReport(report: ComplianceReport): void {
  const statusEmoji: Record<string, string> = {
    compliant: '✅',
    'non-compliant': '❌',
    partial: '⚠️'
  };

  console.log(`Framework: ${report.framework.toUpperCase()}`);
  console.log(`Status: ${statusEmoji[report.overallStatus] ?? '❓'} ${report.overallStatus.toUpperCase()}\n`);

  const checkEmoji: Record<string, string> = { pass: '✅', fail: '❌', warn: '⚠️', skip: '⏭️' };
  const severityEmoji: Record<string, string> = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };

  for (const check of report.checks) {
    console.log(`${checkEmoji[check.status] ?? '❓'} ${check.requirement}`);
    console.log(`   ${severityEmoji[check.severity] ?? '❓'} ${check.message}`);

    if (check.location) {
      console.log(`   → ${check.location.file}:${check.location.line}`);
    }
    console.log();
  }

  console.log(`Summary: ${report.checks.filter(c => c.status === 'pass').length}/${report.checks.length} passed\n`);
}
