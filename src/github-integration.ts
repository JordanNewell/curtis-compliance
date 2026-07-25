/**
 * GitHub PR Integration for Curtis Compliance
 *
 * Automatically reviews PRs for compliance issues
 */

import { complianceEngine, ComplianceReport, ComplianceFramework } from './compliance.js';
import { Octokit } from '@octokit/rest';
import * as yaml from 'js-yaml';

/**
 * Canonical home for Curtis Compliance on the web. Overridable so the hosted
 * App / dashboard (Phase 2/3) can point status-check links at itself without
 * a code change. Defaults to the GitHub repo until curtiscompliance.com ships.
 */
const APP_URL = process.env.CURTIS_APP_URL ?? 'https://github.com/JordanNewell/curtis-compliance';

interface PRContext {
  owner: string;
  repo: string;
  prNumber: number;
  commitSha: string;
  author: string;
  framework: ComplianceFramework;
}

interface PRFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted';
  patch: string;
  blob_url?: string;
}

export class PRComplianceReview {
  private octokit: Octokit;
  private context: PRContext;

  constructor(octokit: Octokit, context: PRContext) {
    this.octokit = octokit;
    this.context = context;
  }

  async review(): Promise<void> {
    // 1. Fetch PR files
    const files = await this.getPRFiles();

    // 2. Fetch file contents for compliance checks
    const filesWithContent = await this.fetchFileContents(files);

    // 3. Run compliance checks
    const { report, shouldBlock } = await complianceEngine.checkPR({
      files: filesWithContent,
      commit: this.context.commitSha,
      author: this.context.author,
      framework: this.context.framework
    });

    // 4. Post compliance review comment
    await this.postReviewComment(report);

    // 5. Update PR status check
    await this.updateStatusCheck(report, shouldBlock);
  }

  private async getPRFiles(): Promise<PRFile[]> {
    const { data: files } = await this.octokit.pulls.listFiles({
      owner: this.context.owner,
      repo: this.context.repo,
      pull_number: this.context.prNumber
    });

    return files.map(f => ({
      filename: f.filename,
      status: f.status as PRFile['status'],
      patch: f.patch || '',
      blob_url: f.blob_url
    }));
  }

  private async fetchFileContents(files: PRFile[]): Promise<Array<{
    path: string;
    content: string;
    diff: string;
    status: 'added' | 'modified' | 'deleted';
  }>> {
    const filesWithContent: Array<{
      path: string;
      content: string;
      diff: string;
      status: 'added' | 'modified' | 'deleted';
    }> = [];

    for (const file of files) {
      if (file.status === 'deleted') {
        filesWithContent.push({
          path: file.filename,
          content: '',
          diff: file.patch,
          status: 'deleted'
        });
        continue;
      }

      try {
        // For new/modified files, fetch the content from the PR commit
        const { data: fileData } = await this.octokit.repos.getContent({
          owner: this.context.owner,
          repo: this.context.repo,
          path: file.filename,
          ref: this.context.commitSha
        });

        // getContent returns an array for directories; skip those.
        if (Array.isArray(fileData) || fileData.type !== 'file') {
          continue;
        }

        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

        filesWithContent.push({
          path: file.filename,
          content,
          diff: file.patch,
          status: file.status
        });
      } catch (error) {
        // File might be too large or binary - skip compliance check
        console.warn(`Could not fetch content for ${file.filename}:`, error);
      }
    }

    return filesWithContent;
  }

  private async postReviewComment(report: ComplianceReport): Promise<void> {
    const comment = this.formatComment(report);

    // Find existing Curtis comment
    const { data: comments } = await this.octokit.issues.listComments({
      owner: this.context.owner,
      repo: this.context.repo,
      issue_number: this.context.prNumber
    });

    const existingComment = comments.find(c =>
      c.user?.type === 'Bot' &&
      c.body?.includes('🔍 Curtis Compliance Review')
    );

    if (existingComment) {
      // Update existing comment
      await this.octokit.issues.updateComment({
        owner: this.context.owner,
        repo: this.context.repo,
        comment_id: existingComment.id,
        body: comment
      });
    } else {
      // Post new comment
      await this.octokit.issues.createComment({
        owner: this.context.owner,
        repo: this.context.repo,
        issue_number: this.context.prNumber,
        body: comment
      });
    }
  }

  private formatComment(report: ComplianceReport): string {
    const statusEmoji = {
      compliant: '✅',
      'non-compliant': '❌',
      partial: '⚠️'
    };

    const statusColor = {
      compliant: 'green',
      'non-compliant': 'red',
      partial: 'yellow'
    };

    let comment = `## 🔍 Curtis Compliance Review\n\n`;
    comment += `**Framework:** \`${report.framework.toUpperCase()}\` | `;
    comment += `**Status:** ${statusEmoji[report.overallStatus]} **${report.overallStatus.toUpperCase()}**\n\n`;

    // Summary table
    comment += `| Check | Status | Severity | Details |\n`;
    comment += `|-------|--------|----------|----------|\n`;

    for (const check of report.checks) {
      const statusEmoji = {
        pass: '✅',
        fail: '❌',
        warn: '⚠️',
        skip: '⏭️'
      };

      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      };

      let location = '';
      if (check.location) {
        location = `[\`${check.location.file}:${check.location.line}\`](https://github.com/${this.context.owner}/${this.context.repo}/blob/${this.context.commitSha}/${check.location.file}#L${check.location.line})`;
      }

      comment += `| ${check.requirement} | ${statusEmoji[check.status]} ${check.status.toUpperCase()} | ${severityEmoji[check.severity]} ${check.severity.toUpperCase()} | ${check.message}${location ? ' ' + location : ''} |\n`;
    }

    // Summary section
    comment += `\n### 📊 Summary\n\n`;
    comment += `- **Total Checks:** ${report.summary.total}\n`;
    comment += `- **Passed:** ${report.checks.filter(c => c.status === 'pass').length}\n`;
    comment += `- **Failed:** ${report.checks.filter(c => c.status === 'fail').length}\n`;
    comment += `- **Warnings:** ${report.checks.filter(c => c.status === 'warn').length}\n`;
    comment += `- **Skipped:** ${report.checks.filter(c => c.status === 'skip').length}\n\n`;

    // Critical issues section
    const criticalFailures = report.checks.filter(c => c.status === 'fail' && c.severity === 'critical');
    if (criticalFailures.length > 0) {
      comment += `### 🚨 Critical Issues\n\n`;
      comment += `The following **critical** issues must be resolved before merge:\n\n`;
      for (const issue of criticalFailures) {
        comment += `- **${issue.requirement}**: ${issue.message}\n`;
        if (issue.location) {
          comment += `  - Location: \`${issue.location.file}:${issue.location.line}\`\n`;
        }
      }
      comment += `\n`;
    }

    // Action items section
    const failures = report.checks.filter(c => c.status === 'fail');
    if (failures.length > 0) {
      comment += `### 📋 Action Required\n\n`;
      comment += `This PR is **not compliant**. Please address the issues above before merging.\n\n`;
    }

    const warnings = report.checks.filter(c => c.status === 'warn');
    if (warnings.length > 0 && failures.length === 0) {
      comment += `### 💡 Recommendations\n\n`;
      comment += `Consider addressing these warnings to improve compliance:\n\n`;
      for (const warning of warnings) {
        comment += `- **${warning.requirement}**: ${warning.message}\n`;
      }
      comment += `\n`;
    }

    if (report.overallStatus === 'compliant') {
      comment += `### ✅ Ready to Merge\n\n`;
      comment += `All compliance checks passed! This PR is compliant with ${report.framework.toUpperCase()} requirements.\n\n`;
    }

    comment += `---\n`;
    comment += `*Generated by [Curtis Compliance](${APP_URL}) at ${new Date(report.timestamp).toLocaleString()}*`;

    return comment;
  }

  private async updateStatusCheck(report: ComplianceReport, shouldBlock: boolean): Promise<void> {
    const status = report.overallStatus === 'compliant' ? 'success' :
                   report.overallStatus === 'partial' ? 'neutral' :
                   'failure';

    await this.octokit.repos.createCommitStatus({
      owner: this.context.owner,
      repo: this.context.repo,
      sha: this.context.commitSha,
      state: shouldBlock ? 'failure' : report.overallStatus === 'compliant' ? 'success' : 'pending',
      description: this.getStatusDescription(report),
      context: 'curtis-compliance',
      // No hosted dashboard yet — point at the PR itself. Phase 2/3 swaps this
      // for ${APP_URL}/dashboard/{owner}/{repo}/pr/{n} once that route exists.
      target_url: `https://github.com/${this.context.owner}/${this.context.repo}/pull/${this.context.prNumber}`
    });
  }

  private getStatusDescription(report: ComplianceReport): string {
    switch (report.overallStatus) {
      case 'compliant':
        return `✅ Compliant with ${report.framework.toUpperCase()}`;
      case 'non-compliant':
        const failures = report.checks.filter(c => c.status === 'fail').length;
        return `❌ ${failures} compliance issue(s) must be resolved`;
      case 'partial':
        const warnings = report.checks.filter(c => c.status === 'warn').length;
        return `⚠️ ${warnings} warning(s) - review recommended`;
    }
  }
}

/**
 * GitHub Webhook Handler
 */
export async function handlePRWebhook(payload: any, octokit: Octokit): Promise<void> {
  const action = payload.action;

  // Only handle opened, synchronize, or reopened PRs
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return;
  }

  const pr = payload.pull_request;
  const repo = payload.repository;

  // Get compliance framework from repo config (uses authenticated Octokit → 5000 req/hr)
  const framework = await getComplianceFramework(octokit, repo.owner.login, repo.name);

  const context: PRContext = {
    owner: repo.owner.login,
    repo: repo.name,
    prNumber: pr.number,
    commitSha: pr.head.sha,
    author: pr.user.login,
    framework
  };

  const reviewer = new PRComplianceReview(octokit, context);
  await reviewer.review();
}

async function getComplianceFramework(octokit: Octokit, owner: string, repo: string): Promise<ComplianceFramework> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: '.curtis/compliance.yaml'
    });

    if (Array.isArray(data) || data.type !== 'file') {
      return 'soc2';
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const parsed = yaml.load(content) as { framework?: string } | null;

    const framework = parsed?.framework;
    if (framework && ['hipaa', 'soc2', 'pci-dss', 'custom'].includes(framework)) {
      return framework as ComplianceFramework;
    }
  } catch (error) {
    // File missing or unreadable — fall through to default
  }

  return 'soc2';
}
