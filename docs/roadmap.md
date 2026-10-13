# Curtis Compliance — Roadmap (research-informed)

> **Basis:** `docs/research/positioning-evidence.md` re-verification of
> 2026-10-06, the traction baseline, and the Phase 0–5 open-core plan
> (July 2026). This file is the durable version of that plan; the July
> plan lives on in `.zcode/plans/` as history.
>
> **Rule:** research gates build. A phase ships only when its gate
> passes. Nothing below is a timeline promise.

## Where we actually are (2026-10-06)

- **Product:** MIT core shipped (v1.3.x — pre-commit gate, hash-chained
  audit trail, CSV/JSON export, `review:pr` CLI). Pro does not exist.
- **Traction:** 52 npm downloads/last 30 days, 2 stars, 0 forks. July
  launch spike (~1,000 downloads in 10 days) proves attention is buyable
  once; the decay proves there is no repeatable discovery engine.
- **Research:** positioning claims verified and re-verified (most recent
  pass 2026-10-06). Demand-side research (auditors, buyers, conversion)
  has not started. That is the constraint on everything below.

## Track A — Validation (start now; human conversations, not code)

These are the three unknowns that decide whether Pro can sell. They are
cheap, fast, and everything expensive is gated on them.

**Copy-paste-ready scripts shipped:** [`docs/outreach/auditor-outreach.md`](outreach/auditor-outreach.md)
(r/soc2 post, assessor email/DM, A1 interview script, decision rule) and
[`docs/outreach/installer-outreach.md`](outreach/installer-outreach.md)
(GitHub Discussions post, July-cohort harvest plan, A2/A3 interview
script, answer-to-roadmap mapping).

| # | What | How | Gate it opens |
|---|------|-----|----------------|
| A1 | **Auditor acceptance** of hash-chained JSONL + `verify` output as SOC2 CC7.2 / PCI 10.2 evidence | 2–3 conversations with real auditors (r/soc2, A-Lign, Schellman, BARR) | Phase 3 (rollup + PDF). If auditors reject the format, Phase 3's value prop collapses and Pro pivots to dev-convenience features |
| A2 | **ICP + buyer discovery** — who installs, who signs, which segment hurts | 5–10 interviews with July installers (GitHub Discussions post, Reddit follow-ups); test "complement to Vanta" framing in the same calls | Phase 2 priorities + all outreach copy |
| A3 | **Pricing** — resolve $19 vs $49 | Anchor on Semgrep ($30/contributor/mo, the closest dev-loop analog); test $29 vs $39 in A2 interviews | Phase 5 landing page |

**Current recommendation (Jordan decides):** Pro at **$29/seat/mo,
$290/seat/yr** — at the Semgrep anchor, ~90% under a Vanta entry
contract, credible for a fintech buyer.

## Track B — Build (the Phase 0–5 plan, revised)

Unchanged in shape from July; changes marked.

- **Phase 0 — Foundation + honest positioning.** Status: README side
  largely done (open-core copy, sourced claims). Remaining: `license`
  subcommand, Pro repo skeleton, fix the dead `curtis.ai` links in
  `src/github-integration.ts`. *No gate — safe to proceed in parallel
  with Track A.*
- **Phase 1 — License activation + Lemon Squeezy.** *No gate — cheap,
  reversible, independent of the unknowns.*
- **Phase 2 — Hosted GitHub App.** *Unchanged as the killer B2B feature*
  — the Semgrep model says platform features (hosting, org visibility,
  workflow) are what convert free users, not the scanner itself.
  Sequence immediately after Phase 1. Prioritize the org-level dashboard
  view over breadth of integrations.
- **Phase 3 — Multi-repo rollup + PDF.** **GATED on A1.** Do not build
  the auditor-evidence product before an auditor has said they'd accept
  the evidence.
- **Phase 4 — Custom frameworks.** After Phase 3.
- **Phase 5 — Landing page + pricing.** **GATED on A3** (and inherits
  the $29 recommendation). Comparison table gains a Semgrep row — the
  buyer now compares us to per-dev security tooling, not only to Vanta.
- **Phase 6 (horizon) — Agent-run evidence.** The 2026 research frontier
  in tamper-evident logging is AI-agent audit trails (Agent Flight
  Recorder, Tracekit, NovaFabric — all 2026 academic work), and EU AI Act
  Art 12 logging obligations are live for high-risk systems (fintech ML
  is in scope). Curtis's hash-chain event schema ports directly:
  evidence for agentic coding runs under AI Act Art 12 / ISO 42001
  citations. **GATED on A1** (same primitive, same value question) and on
  Phases 2–3 shipping. Do not start before then.

## Track C — Distribution (parallel, always-on)

The July curve (1,000-download spike → 52/month) means the gap is an
engine, not a moment.

1. **Repeatable launch cadence:** quarterly Show HN / r/soc2 / r/devops
   post tied to each meaningful release (not one-time). Target: hold
   ≥300 downloads/month between spikes by end of Q1 2027.
2. **SEO / comparison content:** "SOC 2 evidence automation,"
   "PCI DSS 4.0 developer requirements," vs-pages (Curtis vs Gitleaks,
   vs Vanta, vs Semgrep). These are bottom-funnel queries with intent.
3. **Auditor co-marketing:** the A1 auditors become named proof
   ("accepted in SOC 2 engagements by —") once relationships exist.
4. **Regulatory-hooks calendar:** CRA reporting already live (Sept
   2026) → full application Dec 2027. Time content and outreach to the
   compliance-calendar moments when buyers are scrambling.

## Track D — Watch (agent-owned; cadence per research-instructions.md)

- **Monthly:** Vanta/Drata/Secureframe dev-loop check (the existential
  threat — trigger immediate re-verify if any ships commit-time
  evidence); secret-scanner moves; new pre-commit/audit-trail launches.
- **Quarterly:** full claims re-verification. Next due **~2027-01-06**.
- **Regulatory watch — corrected targets:** EU AI Act Art 11/12
  enforcement developments (live since 2026-08-02); CRA (reporting live
  2026-09-11, full application 2027-12-11); DORA is *in force since
  2025-01-17* — track RTS guidance, not a deadline.

## Gates summary

| Build item | Gate | Gate status |
|---|---|---|
| Phases 0–1 | none | clear |
| Phase 2 (GitHub App) | none (post-Phase-1) | clear |
| Phase 3 (rollup/PDF) | A1 auditor acceptance | **open — blocker** |
| Phase 5 (landing/pricing) | A3 pricing decision | **open — recommendation: $29** |
| Phase 6 (agent evidence) | A1 + Phases 2–3 shipped | **open — horizon** |
