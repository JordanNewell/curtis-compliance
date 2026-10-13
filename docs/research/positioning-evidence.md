# Curtis Compliance — Positioning Evidence & Backing Research

> **Purpose:** Every load-bearing claim in the README, landing page, and Pro
> tier rests on verifiable evidence. This file is the receipt. When a claim
> is challenged in cold outreach, an investor call, or a skeptical HN thread,
> the citation lives here.
>
> **Last verified:** 2026-07-24
> **Maintainer:** research-instructions.md hands ongoing verification to agents.
> **Convention:** every claim has a `CLAIM → EVIDENCE → SOURCE → CONFIDENCE` block.

---

## TL;DR — the 5 things that must be true for the positioning to hold

1. ✅ **RegTech is a large, fast-growing market.** $24-29B in 2026, ~21% CAGR.
2. ✅ **Compliance burden on fintech is real and quantified.** 15-20% of
   operating costs, not 40% of developer time (see ⚠️ below).
3. ✅ **The competitor set (Vanta/Drata/Secureframe) sits at the org level,
   not in the developer loop.** They collect evidence; they don't generate it
   at commit time. Pricing starts at $5-8K/yr and scales to $100K+.
4. ✅ **Secret scanners are free/different-category.** Gitleaks (MIT),
   TruffleHog (AGPL), GitGuardian (free ≤25 devs). Curtis's secret rule alone
   has zero standalone value — the wrapper + audit trail is the product.
5. ✅ **No direct competitor ships pre-commit + hash-chained audit trail as
   one product.** This is the defensible novelty. Searched explicitly; gap
   confirmed (see §5).

**⚠️ The one claim that is currently WRONG and must be fixed:** the README
says "Fintech teams spend 40% of their time on compliance paperwork." No
source backs this. Real data: 15-20% of *operating costs* (budget), or ~13%
of developer time on security broadly (IDC). This is a credibility landmine
in B2B cold outreach. **Fix before any external-facing copy ships.** See §1.

---

## §1 — Compliance burden (the "why this matters" number)

### CLAIM (current, WRONG)
> "Fintech teams spend 40% of their time on compliance paperwork."
> — README.md, "Why Curtis Compliance?"

**Status: UNSOURCED. Do not repeat.** No search across developer-productivity
surveys (SonarSource, IDC, Microsoft Research, DevOps.com, Cortex) returns a
40% figure tied to compliance. The number appears fabricated or badly
misremembered. Likely conflated with:
- SonarSource: 30% of dev time on *code maintenance* (not compliance)
- DevOps.com: 38% of devs spend up to a quarter of time on *bug-fixing*
- IDC: ~13% of dev time on *security* (the closest proxy, 2024, up from 8%)

### CLAIM (replacement, SOURCED) — pick one

**Option A — budget framing (strongest, defensible):**
> "Regulatory compliance consumes 15-20% of operating costs for fintech
> companies." — National Law Review

- Source: [FinTech Compliance Costs Hit 20% of Budgets — NatLawReview](https://natlawreview.com/press-releases/fintech-compliance-costs-hit-20-budgets-driving-developer-hiring-latin)
- Confidence: **HIGH**. Primary trade-press, specific to fintech, recent.
- Supporting: annual compliance costs estimated $54K-$80K; fines $5K-$100K/mo.

**Option B — fine-exposure framing (emotional, B2B-painful):**
> "Over 60% of fintech companies paid at least $250K in compliance fines in
> the past year." — American Bankers Association

- Source: [ABA — Why Fintech Companies Need to Take Compliance to the Next Level](https://www.aba.com/news-research/analysis-guides/why-fintech-companies-need-to-take-their-compliance-to-the-next-level-when-working-with-banks)
- Confidence: **MEDIUM-HIGH**. ABA is authoritative; figure is striking. Verify
  the study methodology before lead-footing it in investor decks.

**Option C — security-time proxy (developer-flavored):**
> "Time developers devote to security rose from 8% to 13% of their week
> (2023→2024)." — IDC, via InfoWorld

- Source: [InfoWorld — Developers spend most of their time not coding (IDC)](https://www.infoworld.com/article/3831759/developers-spend-most-of-their-time-not-coding-idc-report.html)
- Confidence: **HIGH** on the number; **MEDIUM** on the leap that "security ≈
  compliance." They overlap but aren't identical. Use carefully.

**Recommendation:** Lead with Option A (budget). It's the most defensible and
most painful for a fintech buyer. Drop the 40% claim entirely.

---

## §2 — Market size (the "is this worth building" number)

### CLAIM
> "RegTech is a large, growing market."

### EVIDENCE — multiple converging sources

| Source | 2025/2026 | Forecast | CAGR |
|--------|-----------|----------|------|
| Grand View Research | $24.3B (2025) / $29.3B (2026) | $112.1B by 2033 | 21.1% |
| Fortune Business Insights | $23.43B (2026) | $105.23B by 2034 | 20.0% |
| Future Market Insights | $20.1B (2026) | $116.7B by 2036 | 19.2% |
| SkyQuest | $18.44B (2025) | $88.15B by 2033 | 21.6% |

- Primary: [Grand View Research — RegTech Market](https://www.grandviewresearch.com/industry-analysis/regulatory-technology-market)
- Confidence: **HIGH** on direction + magnitude. Exact figures vary 30%
  across shops (methodology differences), but the ~20% CAGR and "tens of
  billions, growing 4-5x by early 2030s" is consistent across all sources.
- **Caveat for honesty:** RegTech includes AML/KYC/regulatory-reporting —
  much larger segments than developer-loop compliance. Curtis's addressable
  slice is a fraction of this. Don't imply the TAM is all available to Curtis.

### CLAIM — adjacent (compliance-as-code sub-market)
> "Compliance as Code Platform market: $4.8B (2025) → $18.6B (2033), 17.3% CAGR."

- Source: [DataIntelo — Compliance As Code Platform Market](https://dataintelo.com/report/compliance-as-code-platform-market)
- Confidence: **LOW-MEDIUM**. Single source, market-research-shop figure (lower
  reliability than Grand View / Fortune). Useful as a directional signal only;
  don't cite in investor materials without corroboration.

---

## §3 — Competitor pricing (the "how to price Pro" anchor)

### CLAIM
> "Vanta/Drata/Secureframe charge $5K-$100K+/yr, per-seat + framework."

### EVIDENCE

| Platform | Entry | Mid | Enterprise |
|----------|-------|-----|------------|
| **Vanta** | ~$5-7K/yr (Reddit reports) | $11-15K/yr | Custom (valued $4.15B) |
| **Drata** | $5-7K/yr (Reddit, SOC2-only) | $7.5-15K/yr | up to $100K+/yr (~$98M ARR) |
| **Secureframe** | $8-12K/yr | $8-15K/yr | $35-70K+/yr |

- Sources:
  - [Secureframe Pricing 2026 — trycomp.ai](https://www.trycomp.ai/secureframe-pricing)
  - [Drata Pricing 2026 — secureleap.tech](https://www.secureleap.tech/blog/drata-review-pricing-top-alternatives-for-compliance-automation)
  - [Secureframe vs Vanta vs Drata — Sprinto](https://sprinto.com/blog/secureframe-vs-vanta-vs-drata/)
  - [Reddit r/soc2 — real-world pricing reports](https://www.reddit.com/r/soc2/comments/1mp6x5u/how_much_are_you_paying_for_vantadratasecureframe/)
- Confidence: **MEDIUM**. All three use opaque custom-quote pricing; figures
  are aggregated from comparison sites + Reddit self-reports. Treat as
  order-of-magnitude, not exact.

### IMPLICATION FOR PRO PRICING
My Phase 0 plan proposed **$19/seat/mo Pro**. Against competitors at
$5K-15K/yr *entry*, that's ~90% cheaper — possibly *too* cheap to be
credible for B2B (signals "not serious"). Two options:

- **Anchor on value, not competitors:** price Pro at a point where 5-10 seats
  ($100-200/mo) is a no-brainer vs a $8K/yr Vanta contract, but high enough
  that a fintech buyer doesn't dismiss it as hobbyist. Suggested reframe:
  **$39-49/seat/mo**, or **$390-490/seat/yr** (annual discount).
- **Don't race to the bottom.** The differentiator is the developer-loop +
  cited evidence, not price. Vanta buyers aren't price-shopping; they're
  buying org-level attestation. Curtis is a *complement*, not a replacement.

**Action: revisit pricing before Phase 5 landing page ships.** Flag for
Jordan's decision.

---

## §4 — Funding landscape (the "who you're up against" reality check)

### CLAIM
> "The compliance-automation space is well-funded and consolidating."

### EVIDENCE — 2025 rounds

| Company | Round | Amount | Valuation / ARR |
|---------|-------|--------|-----------------|
| **Vanta** | Series D (Jul 2025) | $150M | $4.15B (up from $2.45B) |
| **Drata** | Series C (Dec 2022) | $200M | $2B valuation, ~$98M ARR (Jan 2025, Sacra) |
| **Anecdotes** | Series B ext (2025) | $30M ($55M total B) | ~$85M total raised |
| **RegScale** | Series B (Sep 2025) | $30M+ | — |

- Sources:
  - [SiliconAngle — Vanta $4.15B](https://siliconangle.com/2025/07/23/compliance-startup-vanta-valued-4-15b-new-150m-round/)
  - [Crunchbase — Drata Series C](https://news.crunchbase.com/cybersecurity/drata-doubles-valuation-to-2b-after-200m-series-c/)
  - [SecurityWeek — Anecdotes $55M](https://www.securityweek.com/anecdotes-raises-30-million-for-enterprise-grc-platform/)
  - [RegScale Blog — Series B](https://regscale.com/blog/path-to-series-b-disrupting-legacy-grc/)
- Confidence: **HIGH**. All from named financial press.

### IMPLICATION
These incumbents are **org-level GRC platforms** — they manage posture,
collect evidence, produce auditor reports. None of them sits *inside the
developer commit loop* generating cited evidence at commit time. That is
Curtis's wedge. The positioning must be **"the engineering complement to
Vanta/Drata"**, never "a cheaper Vanta." A cheaper Vanta loses to Vanta's
$4.15B war chest; a complement that feeds Vanta wins on adjacency.

---

## §5 — The defensible novelty (what no competitor does)

### CLAIM
> "No existing product combines pre-commit compliance gating with a
> tamper-evident, hash-chained audit trail as a single dev-loop product."

### EVIDENCE — explicit search found a gap
Searched for the intersection of (pre-commit hooks) × (hash-chained /
tamper-evident audit trail) × (compliance). Results fall into two non-overlapping camps:

**Camp A — Git commit integrity (code provenance):**
- GPG/SSH commit signing, SLSA, Sigstore. Proves *who* committed, not *what*
  compliance rules the commit passed.

**Camp B — Tamper-evident logging (runtime/application):**
- [Cossack Labs — audit logs security](https://www.cossacklabs.com/blog/audit-logs-security/)
- [Cachee.ai — tamper-proof audit trails](https://cachee.ai/audit-trail-caching)
- [VeritasChain (dev.to) — financial compliance hash chains](https://dev.to/veritaschain/building-a-cryptographic-audit-trail-for-financial-compliance-from-hash-chains-to-multi-regulation-1oph)
- [Governance SDK — audit trail](https://heygovernance.ai/docs/audit)

**Nobody bridges them at the pre-commit layer.** The closest analog is
*runtime* audit-trail products that you bolt onto a running app — not a tool
that runs in `git commit` and produces evidence before the code ships.

- Confidence: **MEDIUM-HIGH** on "no direct competitor today." Search is
  imperfect; a stealth startup or internal tool at a big co could exist.
  But nothing surfaced across web search, GitHub, arXiv, or HN. This is the
  strongest defensible-claim we have. **Re-verify quarterly** (see
  research-instructions.md).

### CLAIM — auditor evidence acceptance (the value of the audit trail)
> "SOC2/PCI-DSS auditors accept developer-generated evidence when it is
> complete, tamper-evident, time-stamped, and tied to the control tested."

### EVIDENCE
- [Splitforge — SOC 2 and CSV Data Processing: What Auditors Look For](https://splitforge.app/blog/soc-2-csv-data-processing)
- [Reddit r/devops — "SOC2 auditor wants us to log literally everything"](https://www.reddit.com/r/devops/comments/1mdhs0a/soc2_auditor_wants_us_to_log_literally_everything/)
  (practitioners describe auto-generating evidence packages from logs)
- [Scytale — What is SOC 2 Evidence Collection](https://scytale.ai/center/soc-2/soc-2-evidence-collection/)
- Confidence: **MEDIUM**. Format (CSV/JSONL) matters less than integrity +
  traceability. Curtis's hash-chain is *better* than what most teams hand
  auditors (ad-hoc CSVs). But "auditor acceptance" is ultimately per-auditor;
  no central authority blesses a format. Soften marketing claims to "auditor-
  ready" not "auditor-guaranteed."

---

## §6 — Competitive threats to acknowledge honestly

### THREAT 1 — GitHub native push protection (free, for public repos)
- **What:** GitHub's push protection blocks leaked secrets at push time. GA
  and free for public repos; private repos need GitHub Advanced Security.
- Source: [GitHub Blog — Push protection GA + free for public repos](https://github.blog/news-insights/product-news/push-protection-is-generally-available-and-free-for-all-public-repositories/)
- Implication: Curtis's `no-secrets-in-code` rule is, alone, redundant for
  public-repo GitHub users. **The value is NOT the secret detection — it's
  the cited compliance wrapper + audit trail.** Positioning must never lead
  with "finds secrets"; that's a commodity. Lead with "cited, tamper-evident
  evidence at commit time."
- Confidence: **HIGH**.

### THREAT 2 — Secret scanners are free
- Gitleaks: MIT, fully free. ([github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks))
- TruffleHog: AGPL CLI free; Enterprise paid. ([trufflesecurity.com/pricing](https://trufflesecurity.com/pricing))
- GitGuardian: free ≤25 devs; Business ~$15-40K/yr. ([gitguardian.com/pricing](https://www.gitguardian.com/pricing))
- Implication: same as Threat 1. Secret detection is table stakes.

### THREAT 3 — Compliance-as-code incumbents (Chef InSpec, Puppet, OpenSCAP)
- These test *infrastructure* against benchmarks (CIS, PCI-DSS) — not
  application *source code* at commit time. Different layer.
- Source: [RegScale — Compliance as Code guide](https://regscale.com/blog/compliance-as-code-guide-getting-started/)
- Implication: Curtis is application-layer + commit-time; InSpec/Puppet are
  infra-layer + runtime. Adjacent, not competitive. Useful contrast in
  positioning ("infra compliance as code exists; app compliance at commit
  doesn't — until Curtis").

---

## §7 — Regulatory tailwinds (the "why now")

### CLAIM
> "PCI DSS 4.0's future-dated requirements became mandatory March 31, 2025,
> creating acute developer-side compliance pressure."

### EVIDENCE
- March 31, 2025: 51 of 64 new PCI DSS 4.0 requirements became mandatory.
  v3.2.1 retired.
- Source: [PCI SSC Blog — future-dated requirements](https://blog.pcisecuritystandards.org/now-is-the-time-for-organizations-to-adopt-the-future-dated-requirements-of-pci-dss-v4-x)
- Implication: teams are *right now* scrambling to demonstrate continuous
  compliance for the new requirements. Curtis's cited, timestamped evidence
  maps directly to this need. Strong "why now" hook for 2025-2026 outreach.
- Confidence: **HIGH**. Primary source (PCI SSC).

---

## §8 — Open questions (what we still don't know)

These are the highest-value unknowns. Hand to Miranda/Rooney via
research-instructions.md.

1. **Is there a stealth startup doing exactly pre-commit + audit trail?**
   Search startup databases (Crunchbase, YC directory), recent HN launches,
   GitHub topic pages. The §5 gap-claim is only as good as the search.
2. **What do real SOC2 auditors say about a hash-chained JSONL audit trail?**
   Find 2-3 auditors (via r/soc2, A-Lign, Schellman) and ask: would you
   accept `.curtis/audit/*.jsonl` + a `verify` printout as control evidence?
   This de-risks the core value prop.
3. **What's the actual willingness-to-pay for a developer-loop compliance
   tool?** Survey or interview 10 fintech engineering leads. The §3 pricing
   anchor is inferred from competitors, not from buyer data.
4. **Does the "complement to Vanta/Drata" framing resonate, or do buyers
   see it as redundant?** Test the positioning copy on 5-10 cold prospects.
5. **EU AI Act / DORA / SEC Reg S-K — are there 2026-2027 regulatory
   deadlines that create *new* acute developer-side pressure?** PCI 4.0 is
   the current hook; the next one is the growth lever.

---

## Re-verification — 2026-10-06 (agent: ZCode session, ResearchRabbit method)

Scope: competitor watch (claims 3+4), regulatory refresh (§7), a new
pricing anchor (§3 extension), the stealth-competitor hunt (§8.1), and a
traction baseline. Method note: academic prior-art checked via Semantic
Scholar citation networks (forward citations of the tamper-evident-logging
canon), not just keyword search.

### Claim 3 — Vanta/Drata/Secureframe still org-level — CONFIRMED

**Was:** "They collect evidence; they don't generate it at commit time."
**Now:** unchanged.
**Evidence:** Oct 2026 roundup content describes all three as
integration-driven *collection* platforms (cloud, identity, endpoint, HR,
CI/CD). No pre-commit or commit-time product surfaced. Independent
commentary now explicitly names the opening: an "evidence gap" that
"developer-native tools might fill" (Dreamit, Dec 2025) — third parties
are pointing at our wedge.
**Sources:**
- [Continuous Compliance Should Be a Revenue Strategy — dreamit.com](https://dreamit.com) (accessed 2026-10-06)
- [Best SOC 2 Compliance Software in 2026 — envmanager.com](https://envmanager.com) (accessed 2026-10-06)
**Confidence:** MEDIUM (no product-page-level confirmation this cycle; no contrary signal either).
**Action needed:** none.

### Claim 4 — no direct competitor (pre-commit + hash-chained audit trail) — CONFIRMED, STRENGTHENED

**Was:** gap confirmed via web/GitHub/arXiv/HN search on 2026-07-24.
**Now:** unchanged — and now anchored in the academic citation graph.
**Evidence:** Two channels.
(1) *Keyword:* Semantic Scholar query "pre-commit hook regulatory
compliance checking" returns software-engineering irrelevancies (IoT
intrusion detection, construction-plan compliance, PFAS water testing);
the only dev-loop neighbor is "Leveraging pre-commit hooks for
context-sensitive checklists" (2015, 3 citations) — checklists, not
cited-regulatory gating, no audit chain.
(2) *Citation network:* forward citations of Crosby & Wallach's
"Efficient Data Structures for Tamper-Evident Logging" (USENIX Security
2009, 248 citations) — the canonical hash-chain-log paper — are
dominated by 2026 papers applying tamper-evident logging to **AI agent
runs** (Agent Flight Recorder, Tracekit, NovaFabric, A2A-ForensicTrace,
TrajMark, Janus, Hearsay, ClaimReceipt). None operate at the pre-commit
layer for software regulatory compliance. The lineage anchors we should
cite in technical credibility contexts: Schneier & Kelsey, "Secure audit
logs to support computer forensics" (ACM TOPS, 1999, 519 citations) and
Crosby & Wallach 2009.
Commercial stealth check: nothing found for pre-commit + cited-evidence +
audit-trail GitHub Apps; nearest adjacency is commit-timestamping
authorship services (timestampgit.dev, Sep 2026) — provenance camp, not
compliance gating.
**Sources:**
- [Semantic Scholar — Crosby & Wallach 2009 + forward citations](https://www.semanticscholar.org/search?q=Efficient%20Data%20Structures%20For%20Tamper-Evident%20Logging) (accessed 2026-10-06)
- [Semantic Scholar — Schneier & Kelsey 1999](https://www.semanticscholar.org/search?q=Secure%20audit%20logs%20to%20support%20computer%20forensics) (accessed 2026-10-06)
- [timestampgit.dev — commit-timestamp authorship evidence](https://timestampgit.dev) (accessed 2026-10-06)
**Confidence:** MEDIUM-HIGH.
**Action needed:** none. Re-verify quarterly as scheduled.

### NEW — §7 refresh: the live and next regulatory hooks (supersedes the "DORA 2025/2027?" framing)

**Was:** PCI DSS 4.0 (Mar 2025) was the only dated hook; EU AI Act / DORA
listed as open questions.
**Now:** three dated developer-side hooks, in force or scheduled:

| Regulation | Status | Developer-side obligation |
|---|---|---|
| **EU AI Act, Arts 11–12** | Live since **2026-08-02** | Technical documentation (Annex IV) + automatically generated logs, ≥6-month retention, for high-risk AI systems — fintech credit-scoring/insurance ML is in scope |
| **EU Cyber Resilience Act (CRA)** | Reporting live **2026-09-11**; full application **2027-12-11** | Product-level secure-development, vulnerability-handling, and incident-reporting duties for software placed on the EU market — the most developer-side regulation in this list |
| **DORA** | **In force since 2025-01-17** (correction — not upcoming) | ICT log-retention + incident logging RTS for EU financial entities; Art 28 pushes obligations onto fintechs' software suppliers |

PCI DSS 4.0 remains the US payments hook; CRA is the next big one to
build outreach around (15 months of runway to Dec 2027 full application).
**Sources:**
- [EU AI Act 2026 Updates — legalnodes.com](https://legalnodes.com) (accessed 2026-10-06)
- [EU AI Act Article 12 record-keeping — truescreen.io](https://truescreen.io) (accessed 2026-10-06)
- [Cyber Resilience Act — European Commission](https://digital-strategy.ec.europa.eu) (accessed 2026-10-06)
- [DORA — EIOPA](https://www.eiopa.europa.eu) (accessed 2026-10-06)
**Confidence:** HIGH on dates (Commission + multiple concordant secondary sources).
**Action needed:** research-instructions.md regulatory-watch queries corrected to track CRA/AI Act as the live hooks.

### NEW — §3 extension: the missing business-model analog and pricing anchor (Semgrep)

**Was:** pricing anchored only against org-level GRC (Vanta/Drata/
Secureframe, $5K–100K+/yr). $19/seat/mo flagged as possibly too cheap;
$39–49 suggested; undecided.
**Now:** the closest company running Curtis's exact playbook — free
dev-loop scanner → per-seat platform — is **Semgrep**: OSS engine as top
of funnel, free tier capped at 10 contributors, then **$30/contributor/
month per product** (Code / Supply Chain / Secrets each ~$30), enterprise
custom; estimated ~$33.6M ARR (2025, GetLatka estimate). Transparent
linear per-developer pricing is positioned *as a differentiator* against
opaque enterprise quotes. GitGuardian (already documented in §6) runs the
same shape: free ≤25 devs → Business ~$15–40K/yr.
**Implication:** market rate for dev-loop security tooling is ~$30/dev/
month. Curtis Pro at $19/seat is priced *below* the anchor for a tool
with a compliance (not just security) budget line. Recommendation:
**$29/seat/mo, $290/seat/yr** — at the Semgrep anchor, still ~90% under a
Vanta entry contract, credible for B2B. Final call stays with Jordan and
should be confirmed against A3 pricing interviews (see roadmap).
**Sources:**
- [Semgrep pricing — semgrep.dev](https://semgrep.dev) (accessed 2026-10-06)
- [Semgrep ARR estimate (~$33.6M, 2025) — GetLatka via search](https://getlatka.com) (accessed 2026-10-06)
**Confidence:** HIGH on Semgrep list price (public pricing page); MEDIUM on ARR (third-party estimate).
**Action needed:** resolve the $19-vs-$49 question to $29 before Phase 5 landing page ships.

### §8.1 — stealth-startup hunt — NO FINDING

**Evidence:** web + GitHub Marketplace + academic searches on 2026-10-06
(found nothing; queries logged above). Absence of evidence only.
**Confidence:** n/a. **Action needed:** none; fold into monthly competitor
watch.

### NEW — Strategic adjacency: tamper-evident evidence for AI agents

**Evidence:** the 2026 research frontier in hash-chained audit logs has
pivoted to *AI-agent run evidence* — see the Claim-4 citation list. EU AI
Act Art 12 (live) requires automatic logging for high-risk AI systems.
Curtis's audit-event schema (timestamped, hash-chained, verifiable) is
directly portable to "evidence for agentic coding runs" — a potential
Phase 6 with the same primitive and new citations (AI Act Art 12, ISO
42001). Pursue only after auditor validation (Track A of the roadmap)
confirms the audit-trail value prop.
**Confidence:** MEDIUM (direction is clear; commercial timing unproven).
**Action needed:** roadmap horizon item only — do not build yet.

### NEW — Traction baseline (first time recorded)

**Evidence:** npm registry API, accessed 2026-10-06 — **52 downloads in
the last 30 days**; July 2026 spike of ~1,006 downloads over Jul 20–31
(coinciding with launch/README push) decayed to ~1–7/day by September.
GitHub: **2 stars, 0 forks, 8 open issues**. No telemetry exists — we
cannot currently identify or count teams with Curtis installed in a real
repo.
**Confidence:** HIGH (registry data).
**Action needed:** Track A2 of the roadmap — 5–10 interviews with July
installers is the cheapest ICP research available; add an opt-in,
privacy-published usage ping to the roadmap debate.

### Updated open questions (§8 superseded in priority)

1. ~~Stealth competitor~~ — checked 2026-10-06, nothing; recurring watch item.
2. **Auditor acceptance — STILL OPEN, now the #1 blocker.** Gates Pro Phase 3 (rollup/PDF).
3. **Willingness-to-pay — PARTIALLY ANSWERED** (Semgrep anchor $30/contributor/mo). Confirm via interviews; recommend $29.
4. **"Complement to Vanta" resonance — STILL OPEN** — fold into A2 interviews.
5. ~~Next regulatory hook~~ — ANSWERED: AI Act live, CRA Dec 2027 (see §7 refresh).
