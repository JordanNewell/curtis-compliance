# Security Policy

## Supported versions

Only the latest minor release receives security updates. Pin to the most
recent tag for production use.

| Version | Supported |
| ------- | --------- |
| 1.2.x   | ✅        |
| < 1.2   | ❌        |

## Reporting a vulnerability

Email **security@jordannewell.com** with:

- A description of the issue and its impact
- Reproduction steps (a minimal example is ideal)
- Affected version — run `curtis-compliance --version`

**Do not open a public GitHub issue** for security reports.

## Response timeline

- **Acknowledgment:** within 72 hours
- **Initial assessment:** within 5 business days
- **Fix or mitigation:** target 30 days for high-severity issues

Please refrain from public disclosure until a fix has been published, to
protect downstream users. Reporters will be credited in the release notes
unless they prefer otherwise.

## Scope

**In scope:**

- The CLI itself (`curtis-compliance` and its subcommands)
- The hash-chained audit-trail implementation
- The rule engine and bundled rule packs
- The PR-review GitHub integration

**Out of scope:**

- Findings in dependencies — report upstream
- Findings in code that curtis-compliance scans — it is a static analyzer,
  not a runtime guard, and is not expected to catch every issue
- Social engineering, physical attacks, or Denial of Service