# Contributing

Thanks for your interest in curtis-compliance.

## Not accepting external pull requests (yet)

The project is early, the roadmap is fluid, and I want to keep the surface
area manageable while the core stabilizes. **External PRs are not being
accepted at this time.** That will likely change once the rule-pack API and
audit-trail format are locked.

## What is welcome right now

- **Bug reports** — open an issue with reproduction steps and the output of
  `curtis-compliance --version`.
- **Security reports** — see [SECURITY.md](SECURITY.md). Do **not** open a
  public issue.
- **Framework requests** — open an issue describing the framework (HIPAA,
  SOC2, PCI-DSS, ISO 27001, FedRAMP, etc.) and the specific code patterns
  you want flagged. Concrete regulatory citations accelerate this
  significantly.
- **Discussion** — issues are fine for design questions, edge cases, or
  "would this rule help you?" conversations.

## Why the closed PR policy

Three reasons, in order of weight:

1. The audit-trail format and rule-pack API are still settling. External
   contributions built against the current shape would carry a real cost
   when those internals shift.
2. Compliance tooling carries liability weight. Every merged rule needs
   review against the actual citation, not just the code pattern. That
   review load is not sustainable at solo-maintainer bandwidth.
3. The legal posture (see the README disclaimer and SECURITY.md) needs to
   stay coherent with what the tool actually does.

When the policy changes, it will be announced in a release note and this
file will be rewritten.
