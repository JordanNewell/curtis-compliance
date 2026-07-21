/**
 * Curtis Compliance Engine
 *
 * Core compliance checking system for fintech development
 */

import { z } from 'zod';

// ============================================================================
// Compliance Framework Definitions
// ============================================================================

export const ComplianceFramework = z.enum([
  'hipaa',
  'soc2',
  'pci-dss',
  'custom'
]);

export type ComplianceFramework = z.infer<typeof ComplianceFramework>;

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

export const ComplianceCheckResult = z.object({
  requirement: z.string(),
  status: z.enum(['pass', 'fail', 'warn', 'skip']),
  message: z.string(),
  location: z.object({
    file: z.string().optional(),
    line: z.number().optional(),
    column: z.number().optional()
  }).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  framework: ComplianceFramework
});

export type ComplianceCheckResult = z.infer<typeof ComplianceCheckResult>;

export const ComplianceReport = z.object({
  overallStatus: z.enum(['compliant', 'non-compliant', 'partial']),
  framework: ComplianceFramework,
  timestamp: z.string(),
  checks: z.array(ComplianceCheckResult),
  summary: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    total: z.number()
  })
});

export type ComplianceReport = z.infer<typeof ComplianceReport>;

// ============================================================================
// Compliance Rule Definitions
// ============================================================================

export interface ComplianceRule {
  id: string;
  name: string;
  frameworks: ComplianceFramework[];
  check: (context: ComplianceContext) => Promise<ComplianceCheckResult>;
  requirements: string[];
}

export interface ComplianceContext {
  files: ChangedFile[];
  commit: string;
  author: string;
  branch: string;
  framework: ComplianceFramework;
  config: ComplianceConfig;
}

export interface ChangedFile {
  path: string;
  content: string;
  diff: string;
  status: 'added' | 'modified' | 'deleted';
}

export interface ComplianceConfig {
  blockOnFailure: boolean;
  skipPatterns: string[];
  customRules?: ComplianceRule[];
  rules?: Record<string, {
    enabled: boolean;
    blockOnFail?: boolean;
  }>;
  auditTrail: boolean;
}

// ============================================================================
// Built-in Compliance Rules
// ============================================================================

/**
 * No Secrets in Code
 * Framework: HIPAA §164.312(a)(1), SOC2 CC6.1, PCI-DSS 3.4
 */
export const NoSecretsRule: ComplianceRule = {
  id: 'no-secrets-in-code',
  name: 'No secrets exposed in code',
  frameworks: ['hipaa', 'soc2', 'pci-dss'],
  requirements: ['hipaa-164.312-a-1', 'soc2-cc6.1', 'pci-dss-3.4'],
  check: async (ctx: ComplianceContext) => {
    const secretPatterns = [
      // Assignment patterns (catches password = "x", apiKey = "x", etc.)
      /password\s*=\s*['"`][^'"`]+['"`]/gi,
      /api[_-]?key\s*=\s*['"`][^'"`]+['"`]/gi,
      /secret[_-]?key\s*=\s*['"`][^'"`]+['"`]/gi,
      /token\s*=\s*['"`][^'"`]+['"`]/gi,
      /private[_-]?key\s*=\s*['"`][^'"`]+['"`]/gi,
      // Cloud provider tokens
      /AKIA[0-9A-Z]{16}/g,                        // AWS access key id
      /AIza[0-9A-Za-z\-_]{35}/g,                  // Google API key
      // LLM provider tokens
      /sk-[a-zA-Z0-9]{20}T3BlbkFJ[a-zA-Z0-9]{16}/g, // OpenAI legacy (with BlbkFJ marker)
      /sk-proj-[a-zA-Z0-9_-]{40,}/g,              // OpenAI project key
      /sk-or-v1-[a-zA-Z0-9-]{40,}/g,              // OpenRouter
      /sk-ant-[a-zA-Z0-9_-]{70,}/g,               // Anthropic
      // VCS tokens
      /gh[pousr]_[A-Za-z0-9]{36,}/g,              // GitHub PAT/App/refresh/etc.
      /glpat-[A-Za-z0-9_-]{20}/g,                 // GitLab PAT
      // Payments
      /sk_live_[A-Za-z0-9]{24,}/g,                // Stripe live secret
      /rk_live_[A-Za-z0-9]{24,}/g,                // Stripe restricted live
      // Chat/automation
      /xox[baprs]-[0-9a-zA-Z-]{10,}/g,            // Slack token family
      // PEM private key blocks (any algorithm)
      /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
    ];

    const violations: Array<{file: string, line: number, match: string}> = [];

    for (const file of ctx.files) {
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        for (const pattern of secretPatterns) {
          const matches = line.match(pattern);
          if (matches) {
            violations.push({
              file: file.path,
              line: idx + 1,
              match: matches[0]
            });
          }
        }
      });
    }

    if (violations.length > 0) {
      return {
        requirement: 'no-secrets-in-code',
        status: 'fail',
        message: `Found ${violations.length} potential secret(s) in code. Use environment variables.`,
        location: {
          file: violations[0].file,
          line: violations[0].line
        },
        severity: 'critical',
        framework: ctx.framework
      };
    }

    return {
      requirement: 'no-secrets-in-code',
      status: 'pass',
      message: 'No secrets detected in code changes',
      severity: 'critical',
      framework: ctx.framework
    };
  }
};

/**
 * TLS for External Calls
 * Framework: HIPAA §164.312(e)(1), PCI-DSS 4.1
 */
export const TLSOnlyRule: ComplianceRule = {
  id: 'tls-only',
  name: 'External API calls must use HTTPS/TLS',
  frameworks: ['hipaa', 'pci-dss', 'soc2'],
  requirements: ['hipaa-164.312-e-1', 'pci-dss-4.1'],
  check: async (ctx: ComplianceContext) => {
    const insecurePatterns = [
      /http:\/\/(?!localhost)/gi,
      /axios\.get\(['"`]http:\/\//gi,
      /fetch\(['"`]http:\/\//gi,
      /requests\.get\(['"`]http:\/\//gi,
    ];

    const violations: Array<{file: string, line: number}> = [];

    for (const file of ctx.files) {
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        for (const pattern of insecurePatterns) {
          if (pattern.test(line)) {
            violations.push({ file: file.path, line: idx + 1 });
          }
        }
      });
    }

    if (violations.length > 0) {
      return {
        requirement: 'tls-only',
        status: 'fail',
        message: `Found ${violations.length} insecure HTTP call(s). Use HTTPS/TLS.`,
        location: {
          file: violations[0].file,
          line: violations[0].line
        },
        severity: 'high',
        framework: ctx.framework
      };
    }

    return {
      requirement: 'tls-only',
      status: 'pass',
      message: 'All external calls use HTTPS/TLS',
      severity: 'high',
      framework: ctx.framework
    };
  }
};

/**
 * Audit Logging Required
 * Framework: HIPAA §164.312(b), SOC2 CC7.2, PCI-DSS 10.2
 */
export const AuditLoggingRule: ComplianceRule = {
  id: 'audit-logging',
  name: 'Sensitive operations must have audit logging',
  frameworks: ['hipaa', 'soc2', 'pci-dss'],
  requirements: ['hipaa-164.312-b', 'soc2-cc7.2', 'pci-dss-10.2'],
  check: async (ctx: ComplianceContext) => {
    const sensitiveOperations = [
      /payment|charge|refund/gi,
      /auth|login|logout/gi,
      /password|credential/gi,
      /data.*delete|delete.*data/gi,
      /export|download.*data/gi,
      /admin.*user|user.*admin/gi,
    ];

    const hasSensitiveOp = ctx.files.some(f => {
      const lines = f.content.split('\n');
      return lines.some(line =>
        sensitiveOperations.some(pattern => pattern.test(line))
      );
    });

    if (!hasSensitiveOp) {
      return {
        requirement: 'audit-logging',
        status: 'skip',
        message: 'No sensitive operations detected in changes',
        severity: 'medium',
        framework: ctx.framework
      };
    }

    // Check for audit logging patterns
    const hasLogging = ctx.files.some(f => {
      const lines = f.content.split('\n');
      return lines.some(line =>
        /log|audit|track|record/i.test(line) &&
        /event|action|operation/i.test(line)
      );
    });

    if (!hasLogging) {
      return {
        requirement: 'audit-logging',
        status: 'fail',
        message: 'Sensitive operations detected but no audit logging found',
        severity: 'high',
        framework: ctx.framework
      };
    }

    return {
      requirement: 'audit-logging',
      status: 'pass',
      message: 'Audit logging present for sensitive operations',
      severity: 'medium',
      framework: ctx.framework
    };
  }
};

/**
 * Data Encryption at Rest
 * Framework: HIPAA §164.312(a)(2)(iv), PCI-DSS 3.4
 */
export const EncryptionAtRestRule: ComplianceRule = {
  id: 'encryption-at-rest',
  name: 'Sensitive data must be encrypted at rest',
  frameworks: ['hipaa', 'pci-dss'],
  requirements: ['hipaa-164.312-a-2-iv', 'pci-dss-3.4'],
  check: async (ctx: ComplianceContext) => {
    const sensitiveDataPatterns = [
      /credit[_-]?card|cc[_-]?number/gi,
      /ssn|social[_-]?security/gi,
      /password|secret|token/gi,
      /phi|protected[_-]?health[_-]?info/gi,
    ];

    const hasSensitiveData = ctx.files.some(f => {
      const lines = f.content.split('\n');
      return lines.some(line =>
        sensitiveDataPatterns.some(pattern => pattern.test(line))
      );
    });

    if (!hasSensitiveData) {
      return {
        requirement: 'encryption-at-rest',
        status: 'skip',
        message: 'No sensitive data storage detected in changes',
        severity: 'medium',
        framework: ctx.framework
      };
    }

    // Check for encryption patterns
    const hasEncryption = ctx.files.some(f => {
      const lines = f.content.split('\n');
      return lines.some(line =>
        /encrypt|cipher|aes|crypto/gi.test(line)
      );
    });

    if (!hasEncryption) {
      return {
        requirement: 'encryption-at-rest',
        status: 'fail',
        message: 'Sensitive data detected but no encryption found',
        severity: 'critical',
        framework: ctx.framework
      };
    }

    return {
      requirement: 'encryption-at-rest',
      status: 'pass',
      message: 'Encryption present for sensitive data',
      severity: 'critical',
      framework: ctx.framework
    };
  }
};

/**
 * Input Validation Required
 * Framework: HIPAA §164.312(a)(1), PCI-DSS 6.5.1
 */
export const InputValidationRule: ComplianceRule = {
  id: 'input-validation',
  name: 'User input must be validated',
  frameworks: ['hipaa', 'pci-dss', 'soc2'],
  requirements: ['hipaa-164.312-a-1', 'pci-dss-6.5.1'],
  check: async (ctx: ComplianceContext) => {
    const userInputPatterns = [
      /req\.body|request\.body|ctx\.body/gi,
      /request\.query|query\.string/gi,
      /params\[/gi,
      /form\[/gi,
    ];

    const validationPatterns = [
      /zod|joi|yup|validator/gi,
      /\.validate\(|\.check\(/gi,
      /schema|Schema/gi,
    ];

    const hasUserInput = ctx.files.some(f => {
      const lines = f.content.split('\n');
      return lines.some(line =>
        userInputPatterns.some(pattern => pattern.test(line))
      );
    });

    if (!hasUserInput) {
      return {
        requirement: 'input-validation',
        status: 'skip',
        message: 'No user input processing detected in changes',
        severity: 'medium',
        framework: ctx.framework
      };
    }

    const hasValidation = ctx.files.some(f => {
      const lines = f.content.split('\n');
      return lines.some(line =>
        validationPatterns.some(pattern => pattern.test(line))
      );
    });

    if (!hasValidation) {
      return {
        requirement: 'input-validation',
        status: 'warn',
        message: 'User input detected but validation not confirmed',
        severity: 'medium',
        framework: ctx.framework
      };
    }

    return {
      requirement: 'input-validation',
      status: 'pass',
      message: 'Input validation present',
      severity: 'medium',
      framework: ctx.framework
    };
  }
};

// ============================================================================
// Compliance Engine
// ============================================================================

export class ComplianceEngine {
  private rules: Map<string, ComplianceRule> = new Map();

  constructor() {
    // Register built-in rules
    this.registerRule(NoSecretsRule);
    this.registerRule(TLSOnlyRule);
    this.registerRule(AuditLoggingRule);
    this.registerRule(EncryptionAtRestRule);
    this.registerRule(InputValidationRule);
  }

  registerRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  async checkCompliance(context: ComplianceContext): Promise<ComplianceReport> {
    const applicableRules = Array.from(this.rules.values()).filter(rule =>
      rule.frameworks.includes(context.framework)
    );

    const checks: ComplianceCheckResult[] = [];

    for (const rule of applicableRules) {
      const ruleConfig = context.config.rules?.[rule.id];
      if (ruleConfig && ruleConfig.enabled === false) {
        checks.push({
          requirement: rule.id,
          status: 'skip',
          message: `Rule disabled in config`,
          severity: 'low',
          framework: context.framework
        });
        continue;
      }

      try {
        const result = await rule.check(context);
        checks.push(result);
      } catch (error) {
        checks.push({
          requirement: rule.id,
          status: 'skip',
          message: `Check failed: ${error}`,
          severity: 'low',
          framework: context.framework
        });
      }
    }

    // Calculate summary
    const summary = {
      critical: checks.filter(c => c.severity === 'critical' && c.status === 'fail').length,
      high: checks.filter(c => c.severity === 'high' && c.status === 'fail').length,
      medium: checks.filter(c => c.severity === 'medium' && c.status === 'fail').length,
      low: checks.filter(c => c.severity === 'low' && c.status === 'fail').length,
      total: checks.length
    };

    // Determine overall status
    const hasFailures = checks.some(c => c.status === 'fail');
    const hasWarnings = checks.some(c => c.status === 'warn');
    let overallStatus: 'compliant' | 'non-compliant' | 'partial';

    if (hasFailures) {
      overallStatus = 'non-compliant';
    } else if (hasWarnings) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'compliant';
    }

    return {
      overallStatus,
      framework: context.framework,
      timestamp: new Date().toISOString(),
      checks,
      summary
    };
  }

  /**
   * Same as checkCompliance, but also writes an audit-trail event if
   * config.auditTrail === true. Use this from CLI commands and webhook
   * handlers; use checkCompliance directly in tests / library code.
   */
  async checkAndAudit(
    context: ComplianceContext,
    meta: { repo?: string }
  ): Promise<ComplianceReport> {
    const report = await this.checkCompliance(context);
    if (context.config.auditTrail) {
      const { buildEvent, append } = await import('./audit-trail.js');
      const event = buildEvent(report, {
        repo: meta.repo,
        commit: context.commit,
        author: context.author,
        branch: context.branch
      });
      await append(event);
    }
    return report;
  }

  async checkPR(prContext: {
    files: ChangedFile[];
    commit: string;
    author: string;
    framework: ComplianceFramework;
  }): Promise<{report: ComplianceReport, shouldBlock: boolean}> {
    const context: ComplianceContext = {
      ...prContext,
      branch: 'pr',
      config: {
        blockOnFailure: true,
        skipPatterns: [],
        auditTrail: true
      }
    };

    const report = await this.checkCompliance(context);
    const shouldBlock = report.overallStatus === 'non-compliant' && context.config.blockOnFailure;

    return { report, shouldBlock };
  }
}

// ============================================================================
// Export singleton
// ============================================================================

export const complianceEngine = new ComplianceEngine();
