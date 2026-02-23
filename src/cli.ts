#!/usr/bin/env node
/**
 * Curtis Compliance CLI
 *
 * Command-line interface for Curtis Compliance
 */

import { Command } from 'commander';
import { complianceEngine, ComplianceFramework } from './compliance.js';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { loadConfig } from './config.js';

const program = new Command();

program
  .name('curtis-compliance')
  .description('Automated compliance for fintech development')
  .version('1.0.0');

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

    // Create pre-commit hook
    const preCommitHook = `#!/bin/sh
# Curtis Compliance pre-commit hook
echo "🛡️ Running Curtis Compliance checks..."
curtis-compliance check
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

    // Run compliance checks
    const report = await complianceEngine.checkCompliance({
      files: changedFiles,
      commit: 'HEAD',
      author: 'local',
      branch: 'current',
      framework,
      config
    });

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
  .description('Review a PR for compliance (for testing)')
  .action(async (prNumber) => {
    console.log(`🛡️ Reviewing PR #${prNumber} for compliance...\n`);

    // This would connect to GitHub API
    // For now, just show a message
    console.log('PR review requires GitHub integration.');
    console.log('Install the Curtis Compliance GitHub App for automatic PR reviews.');
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

    const report = await complianceEngine.checkCompliance({
      files: changedFiles,
      commit: 'HEAD',
      author: 'report',
      branch: 'current',
      framework,
      config
    });

    const fs = await import('fs/promises');
    await fs.writeFile(options.output, JSON.stringify(report, null, 2));

    console.log(`📊 Compliance report saved to ${options.output}\n`);
    printReport(report);
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
    console.log('  GDPR        - General Data Protection Regulation');
    console.log('  Custom      - Define your own compliance rules\n');
  });

/**
 * Self-test
 */
program
  .command('selftest')
  .description('Run Curtis Compliance self-test')
  .action(async () => {
    console.log('🧪 Running Curtis Compliance self-test...\n');

    const testFiles = [
      {
        path: 'test/password.js',
        content: `
const password = 'EXAMPLE_PASSWORD_PLACEHOLDER';
const apiKey = 'EXAMPLE_KEY_PLACEHOLDER';
fetch('http://example.com/api');
`,
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

function printReport(report: any): void {
  const statusEmoji = {
    compliant: '✅',
    'non-compliant': '❌',
    partial: '⚠️'
  };

  console.log(`Framework: ${report.framework.toUpperCase()}`);
  console.log(`Status: ${statusEmoji[report.overallStatus]} ${report.overallStatus.toUpperCase()}\n`);

  for (const check of report.checks) {
    const emoji = { pass: '✅', fail: '❌', warn: '⚠️', skip: '⏭️' };
    const severity = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };

    console.log(`${emoji[check.status]} ${check.requirement}`);
    console.log(`   ${severity[check.severity]} ${check.message}`);

    if (check.location) {
      console.log(`   → ${check.location.file}:${check.location.line}`);
    }
    console.log();
  }

  console.log(`Summary: ${report.checks.filter((c: any) => c.status === 'pass').length}/${report.checks.length} passed\n`);
}

program.parse();
