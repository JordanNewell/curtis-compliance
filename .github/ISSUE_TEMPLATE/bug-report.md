---
name: Bug Report
about: Report a bug in curtis-compliance to help us improve
title: "[BUG] "
labels: ["bug", "triage"]
assignees: []
---

## Bug description

A clear description of what's broken.

## Steps to reproduce

1.
2.
3.

## Expected behavior

What you thought would happen.

## Actual behavior

What actually happened.

## Offending rule / code snippet

For false positives or compliance-check failures, paste the **sanitized** rule or code that triggered the finding. Strip any real PII, secrets, or customer data first.

```yaml
# sanitized rule or code here
```

## Environment

- **curtis-compliance version:** output of `curtis-compliance --version`
- **Node version:** output of `node --version`
- **OS:** (Ubuntu 24.04 / macOS 14 / Windows 11)
- **Fintech framework in use:** (HIPAA / SOC2 / PCI-DSS / combination / other)

## Logs / screenshots

Paste relevant CLI output and any screenshots.

```
paste output here
```

## Self-check

- [ ] I have searched existing issues for duplicates.
- [ ] I have sanitized any sensitive data (PII, secrets, customer identifiers).
- [ ] This is not a security issue (those go through [SECURITY.md](../blob/master/SECURITY.md) privately).