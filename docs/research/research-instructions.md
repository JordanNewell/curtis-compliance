# Research Brief — Curtis Compliance Positioning Defense

> **Who this is for:** Any agent (Miranda, Rooney, or a fresh ZCode/general
> session) tasked with verifying or strengthening Curtis Compliance's market
> positioning. You start fresh — this brief is self-contained.
>
> **What Curtis Compliance is:** An open-source (MIT) static regulatory
> scanner for fintech code. It runs as a pre-commit hook + PR reviewer, blocks
> non-compliant changes, cites the specific HIPAA/SOC2/PCI-DSS clause, and
> writes every check to a tamper-evident, hash-chained JSONL audit trail. A
> paid **Pro** tier adds a hosted GitHub App, multi-repo rollup, PDF export,
> and custom frameworks. Repo: `github.com/JordanNewell/curtis-compliance`.
>
> **The companion file:** `positioning-evidence.md` holds the current
> evidence + claims. Read it first — your job is to *verify, extend, or
> correct* it, not start from scratch.
>
> **Output:** append findings to `positioning-evidence.md` under a dated
> `## Re-verification — YYYY-MM-DD` section, or open issues for anything that
> contradicts a load-bearing claim.

---

## The 5 load-bearing claims (verify these first)

If any of these break, the positioning breaks. Prioritize them.

1. **RegTech market is large + growing.** Currently cited: $24-29B (2026),
   ~21% CAGR. → Is this still accurate? Has any major shop revised it?
2. **Compliance burden is real + quantified.** ⚠️ The README currently claims
   "40% of developer time" — this is **UNSOURCED and likely wrong.** Real
   data points to 15-20% of *operating costs*. Find the strongest defensible
   replacement number. This is the single most important correction.
3. **Vanta/Drata/Secureframe are org-level, not dev-loop.** Confirm they
   still don't ship a pre-commit / commit-time cited-evidence product. If any
   of them has launched one, that's a strategic threat — flag immediately.
4. **No direct competitor does pre-commit + hash-chained audit trail.** This
   is the defensible novelty. Search hard for a stealth startup, a YC launch,
   a GitHub project doing exactly this. Absence of evidence is the claim —
   keep looking.
5. **Auditors accept developer-generated hash-chained evidence.** Find real
   auditor voices (not vendor blogs) confirming or denying that a
   `.curtis/audit/*.jsonl` + `verify` output would satisfy SOC2/PCI-DSS
   control testing.

---

## How to search (concrete queries, not vague topics)

Bad: "research the compliance market." Good: copy-paste these, refine, log
the exact query you ran + the date + the top 3 URLs.

### Market sizing
```
"regtech market size" 2026 site:grandviewresearch.com OR site:fortunebusinessinsights.com
"compliance as code" market size forecast 2030
fintech compliance software TAM SAM 2026
```
Acceptance: ≥2 independent research firms agreeing within 30% on the 2026
figure and the CAGR.

### The "40% of developer time" claim — kill or confirm
```
"developers spend" "compliance" percentage survey
fintech developer time regulatory burden study
IDC developer productivity security time 2024 2025
SonarSource developer survey code maintenance
```
Acceptance: either find the original source of the 40% figure (cite it), or
confirm it doesn't exist (document the searches that failed). The
replacement number must come from a named, dateable source.

### Competitor watch (do this every cycle)
```
Vanta developer tools pre-commit commit-time
Drata GitHub App PR review compliance
Secureframe shift-left developer
site:news.ycombinator.com "compliance" "pre-commit"
site:news.ycombinator.com "audit trail" "hash chain"
```
Acceptance: for each of Vanta/Drata/Secureframe, a one-line verdict —
"still org-level only" or "⚠️ launched X on YYYY-MM-DD, threat level Y."

### Direct competitor hunt (the gap claim)
```
"pre-commit" "audit trail" compliance tool
"hash chain" OR "hash-chained" "git" compliance
tamper-evident compliance evidence commit-time
site:github.com compliance audit-trail pre-commit
"compliance as code" pre-commit hook cited evidence
```
Also check: Crunchbase, YC directory (ycombinator.com/companies/industry/compliance),
Product Hunt "compliance" launches in the last 12 months, arXiv
cs.CR/cs.SE for "compliance" + "commit".
Acceptance: a list of the 5 closest adjacent projects, each with a one-line
"why this isn't the same thing" rebuttal. If you find one that *is* the same
thing, that's a red alert — open an issue, don't bury it.

### Auditor acceptance (hardest, highest-value)
```
site:reddit.com/r/soc2 auditor evidence format
site:reddit.com/r/devops SOC2 evidence automated
"would accept" OR "auditor accepted" JSONL OR CSV audit trail
Schellman OR A-Lign OR BARR developer evidence continuous
```
Better than search: find 2-3 actual auditors on LinkedIn (Schellman, A-Lign,
BARR Associates, PRESF) and look for published guidance on evidence format
requirements. The gold standard is a direct quote from an auditor saying
"yes, a hash-chained log of control checks is acceptable evidence for CC7.2."

### Regulatory "why now" (refresh quarterly)
```
PCI DSS 4.0 future-dated requirements 2025 2026 developer impact
EU AI Act compliance developer requirements 2026 2027
DORA digital operational resilience developer 2025
SEC cybersecurity disclosure developer impact 2025
ISO 27001:2022 migration developer
```
Acceptance: a list of 2-3 regulatory deadlines in the next 18 months that
create *acute developer-side* compliance pressure (not just org-level).
PCI 4.0 is the current one; find the next.

---

## Output format (so findings accumulate usefully)

Append to `positioning-evidence.md`. Use this exact shape so it's grep-able:

```markdown
## Re-verification — YYYY-MM-DD (agent: <name>)

### Claim X — [CONFIRMED | REVISED | BROKEN | NEW]
**Was:** <old claim>
**Now:** <new claim, or "unchanged">
**Evidence:** <one paragraph>
**Sources:**
- [Title — domain](URL) (accessed YYYY-MM-DD)
**Confidence:** HIGH | MEDIUM | LOW
**Action needed:** <what to change in README/landing/Pro pricing, or "none">
```

Rules:
- **Every number has a source.** No unsourced statistics. If you can't source
  it, say so explicitly — don't let a fake number propagate.
- **Confidence labels mean something.** HIGH = primary source / official docs.
  MEDIUM = reputable secondary (trade press, named analyst). LOW = single
  market-research-shop figure or vendor blog.
- **Date every URL access.** Web pages change. "Accessed" matters.
- **Flag contradictions, don't smooth them.** If two sources disagree, record
  both. The reader decides.
- **Never delete prior findings.** Append. If a prior finding is now wrong,
  mark it `SUPERSEDED YYYY-MM-DD` and add the correction — don't erase the
  history.

---

## What NOT to do

- **Don't write marketing copy.** This is the evidence file, not the pitch.
  Copywriting happens in README.md and the landing page, drawing from here.
- **Don't trust vendor blogs at face value.** A Vanta blog saying "compliance
  costs are soaring" is marketing, not evidence. Find the underlying study.
- **Don't conflate "security" with "compliance."** They overlap (encryption,
  secrets) but aren't identical. A stat about security time isn't automatically
  a stat about compliance time. Note the distinction.
- **Don't pad with generic industry background.** Only findings that change a
  claim, add a citation, or surface a threat belong here.
- **Don't claim absence as proof.** "I couldn't find a competitor" ≠ "no
  competitor exists." Phrase gap-claims as "no direct competitor surfaced in
  searches across X, Y, Z on YYYY-MM-DD."

---

## Cadence

- **Full re-verification:** quarterly. The market moves fast (Vanta raised
  $150M in July 2025; a competitor could launch in any quarter).
- **Competitor watch (§3, §5):** monthly. Cheap, high-signal.
- **Regulatory watch (§7):** monthly. New deadlines are growth hooks.
- **Trigger re-verify immediately if:** a major incumbent (Vanta/Drata/
  Secureframe/GitHub) announces a developer-loop or commit-time compliance
  feature. That's the existential threat.

---

## Quick-start for a fresh agent (copy-paste)

```
1. Read docs/research/positioning-evidence.md in full.
2. Read this file in full.
3. Pick the highest-priority open question from §8 of positioning-evidence.md,
   OR re-verify one of the 5 load-bearing claims above.
4. Run the concrete searches. Log queries + dates + URLs.
5. Append findings to positioning-evidence.md under "## Re-verification —
   <today>" using the output format above.
6. If you broke a load-bearing claim, open a GitHub issue titled
   "POSITIONING BREAK: <claim>" and ping Jordan.
```
