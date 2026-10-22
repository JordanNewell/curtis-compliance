# curtis-compliance — Design Notes

> Compliance/audit tooling (TypeScript library + CLI). No user-facing visual
> surface today: no UI, no docs site, no imagery.

## Rules

- If a docs site or report UI is added, follow the Curtis family pattern
  (see curtis-ai-chat `DESIGN.md`): plugin/tool UI inherits host theme;
  brand surfaces use NEWELL tokens verbatim (vault
  `10_PROJECTS/brand-system/tokens.json`).
- Terminal output/code: JetBrains Mono per NEWELL typography.mono.
- No logo asset exists; do not improvise one without a NEWELL-system review.
