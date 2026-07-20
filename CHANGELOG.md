# Changelog

All notable changes to Curtis Compliance are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-07-20

### Added

- **Audit trail engine.** Every `check` and `report` run writes one event to
  `.curtis/audit/YYYY/MM/YYYY-MM-DD.jsonl`. Events are SHA-256 hash-chained
  (`prev_hash` field) so any after-the-fact tampering is detectable.
- **`curtis-compliance audit export`** — emit events as JSON or CSV. CSV columns
  match what an SOC2 / PCI-DSS auditor opens in a spreadsheet. Supports
  `--since`, `--until`, `--framework`, `--repo`, `--status` filters.
- **`curtis-compliance audit verify`** — walks the hash chain end-to-end,
  exits non-zero on the first broken link.
- **`curtis-compliance audit tail`** — print the last N events.
- **`curtis-compliance review:pr`** — previously a stub; now actually fetches a
  PR via `GITHUB_TOKEN`, runs compliance checks, posts a review comment, and
  sets the commit status. Requires `--owner` and `--repo` flags.
- **Per-rule enable/disable.** Set `rules.<rule-id>.enabled: false` in
  `.curtis/compliance.yaml` to skip a rule. Disabled rules produce a `skip`
  check result with a clear message.
- **Expanded secret detection.** Now recognizes AWS access keys (`AKIA…`),
  Google API keys (`AIza…`), OpenAI legacy / project keys (`sk-…`,
  `sk-proj-…`), OpenRouter (`sk-or-v1-…`), Anthropic (`sk-ant-…`), GitHub
  tokens (`ghp_/gho_/ghs_/ghu_/ghr_`), GitLab PATs (`glpat-…`), Stripe live
  keys (`sk_live_/rk_live_`), Slack tokens (`xox[baprs]-…`), and PEM private
  key blocks of any algorithm.

### Changed

- **Severity is now constant per requirement.** Previously `no-secrets-in-code`
  reported `severity: 'critical'` on failure but `'high'` on pass. The severity
  describes the *requirement*, not the outcome, so it no longer flips.
- **`loadConfig` accepts `{ bustCache: true }`** for test isolation and
  long-running processes that need to pick up config changes without a restart.
  `clearConfigCache()` is still available.
- **`init` pre-commit hook** now resolves `curtis-compliance` from PATH, then
  `npx --no-install @jordannewell/curtis-compliance`, then
  `npx --yes @jordannewell/curtis-compliance`. Previously the hook silently
  failed if the binary wasn't installed globally.
- **`getComplianceFramework`** now uses the authenticated Octokit instance
  (was: unauthenticated `fetch()` against `api.github.com`, which rate-limited
  at 60 req/hr). It also reads `.curtis/compliance.yaml` (was: `.curtis/config.yaml`).
- **`package.json` now declares `"type": "module"`**, eliminating the
  `MODULE_TYPELESS_PACKAGE_JSON` reparsing warning on every CLI invocation.

### Fixed

- TypeScript build no longer fails on a clean checkout. The original `master`
  commit had four type errors (`cli.ts:300/306/307` index-signature issues and
  `github-integration.ts:115` widened `status` literal).
- `PRComplianceReview.fetchFileContents` no longer uses `@ts-ignore`. Directory
  responses from `getContent` are narrowed via `Array.isArray()` + `type` check.
- `printReport` is declared before its first caller instead of relying on
  function hoisting.

### Tests

- 44 unit tests across `compliance`, `config`, and `audit-trail` modules.
- Coverage thresholds enforced on engine modules: 80% statements, 70% branches,
  85% functions, 80% lines. (Current: 95 / 82 / 98 / 97.) `cli.ts` and
  `github-integration.ts` are covered by manual smoke tests, excluded from
  the threshold.
- Three fixture files under `tests/fixtures/` (`leaky.ts`, `clean.ts`,
  `partial.ts`) exercise pass / fail / warn paths for every rule.

## [1.0.0] — 2026-02-22

Initial release. CLI with `init` / `check` / `report` / `frameworks` / `selftest`
commands; five built-in compliance rules mapped to HIPAA, SOC2, and PCI-DSS;
GitHub PR integration skeleton.

[1.1.0]: https://github.com/JordanNewell/curtis-compliance/releases/tag/v1.1.0
[1.0.0]: https://github.com/JordanNewell/curtis-compliance/releases/tag/v1.0.0
