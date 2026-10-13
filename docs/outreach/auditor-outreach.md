# Track A1 — Auditor Outreach Pack

> **Goal:** 2–3 conversations with real SOC 2 / PCI-DSS assessors to answer:
> would a hash-chained JSONL audit trail + `verify` output be accepted as
> control evidence — and if not, what would it take?
>
> **Gate this opens:** Phase 3 (multi-repo rollup + auditor-facing PDF) in
> `docs/roadmap.md`. Do not build Phase 3 until this resolves.
>
> **Owner:** Jordan (it's his name on the outreach). Scripts are
> copy-paste ready; edit voice as needed.

---

## Channel 1 — r/soc2 post (highest yield, do this first)

One post reaches many assessors at once AND soft-markets to our ICP.
Reddit rules: disclose you're the maintainer, ask a genuine question,
don't sell. Post Tuesday–Thursday morning US-East.

**Title:**
`Auditors of r/soc2 — would you accept a hash-chained, commit-time log as CC7.2 / PCI 10.2 evidence?`

**Body:**

> I maintain an open-source (MIT) compliance scanner for fintech code —
> it runs as a pre-commit hook, blocks non-compliant changes citing the
> specific HIPAA/SOC2/PCI clause, and writes every check to a
> tamper-evident audit log: one JSONL event per check, each carrying the
> SHA-256 of the prior event. A `verify` command walks the chain and
> fails loudly if any historical event was modified. CSV export for
> evidence packages.
>
> A sample event:
>
> ```json
> {
>   "timestamp": "2026-07-20T17:50:41.259Z",
>   "event_type": "compliance_check",
>   "framework": "pci-dss",
>   "repo": "acme/payments",
>   "commit": "abc123",
>   "overall_status": "non-compliant",
>   "checks": [
>     { "requirement": "no-secrets-in-code", "status": "fail", "severity": "critical", "file": "src/payments.ts", "line": 42 }
>   ],
>   "curtis_version": "1.3.0",
>   "prev_hash": "a7192de26a7e8c1d..."
> }
> ```
>
> I'm not selling anything — the core is MIT and there's no paid tier
> today. I'm the maintainer, and I'm trying to learn from assessors
> **before** building more around this log, whether evidence in this
> format works in a real engagement.
>
> Three questions:
>
> 1. A client includes this log + verification output in their evidence
>    package for CC7.2 (or PCI 10.2). Accept, push back, or reject — and
>    what drives that call?
> 2. What's missing that would change your answer — independent
>    time-stamping (e.g., RFC 3161), completeness controls, retention,
>    something else?
> 3. What developer-generated evidence do you see today that works well,
>    and what makes the good ones good?
>
> Repo if you want to poke at it: the `audit verify` and `audit export`
> commands are what I'm really asking about.

(Fill in the repo link when posting. Do not link the Pro repo — no paid
tier exists and the post must stay non-commercial.)

## Channel 2 — direct email to assessor firms

**Who to target, in order of expected response rate:**

1. **Boutique SOC 2 firms** (10–50 assessors): Prescient Assurance,
   BARR Assurance & Advisory — practice leads and senior assessors are
   findable on LinkedIn and actually answer.
2. **Mid-size:** A-Lign, Schellman — find a senior assessor (not sales);
   their blogs show author names, which is the contact route.
3. **PCI-focused:** Coalfire, Optiv compliance practices — relevant for
   the PCI 10.2 half of the question.

Search pattern: LinkedIn → `"SOC 2" assessor OR "senior associate" site:linkedin.com/in`
+ firm name. Expect ~1 reply per 5 sends; 10 sends ≈ the 2–3 conversations.

**Email:**

```
Subject: Question from an OSS maintainer — would hash-chained commit logs
work as CC7.2 evidence?

Hi [Name],

I maintain an open-source compliance scanner used by fintech engineering
teams. It blocks non-compliant commits and writes every check to a
tamper-evident audit log: JSONL events chained by SHA-256, with a
`verify` command that detects any modification to historical entries,
plus CSV export for evidence packages.

I'm not selling anything — the core is MIT-licensed. Before I build more
of an evidence product around this format, I want to hear from the people
who would actually receive it in an engagement.

Would you spare 15–20 minutes (call or email, your choice) on three
questions?

1. If a client handed you this log + verification output as CC7.2 /
   PCI 10.2 evidence, would you accept it, push back, or reject?
2. What would it need to change your answer — independent time-stamping,
   completeness controls, retention, other?
3. What developer-generated evidence do you see today, and what makes the
   good ones good?

Happy to share a summary of what I learn across assessors, and [firm]
gets named credit in the project's published research if you'd like.

Either way — thanks for reading.

Jordan Newell
github.com/JordanNewell/curtis-compliance
```

**LinkedIn/DM short variant:**

> Hi [Name] — I maintain an MIT-licensed compliance scanner (blocks
> non-compliant commits, writes hash-chained audit evidence). Not selling
> anything; I have three questions about whether assessors would accept
> that log format as CC7.2/PCI 10.2 evidence, and you came up as someone
> who'd know. 15 minutes, or I can email the questions — whichever is
> easier. Either way, keep up the good work.

**Cadence:** send in batches of 5. One polite bump after 5 business days
("bumping once, then I'll leave you alone — the three questions are
still open if useful"). Never a third touch.

---

## The A1 interview script (15–20 min)

Record with permission, or take verbatim notes. The goal is conditions,
not a yes/no — an "accept, if X, Y, Z" is a product backlog, a "no" is a
pivot.

1. **Walk through the artifact** (share the sample event + a `verify`
   output). First reaction — what's your gut say?
2. If a client included this for **CC7.2** — accept / push back / reject?
   What specifically drives that?
3. Same question for **PCI 10.2** — different answer?
4. What's **missing** that would firm up your answer? (Probe: trusted
   time-stamping, host integrity/completeness, retention period, who
   controls the machine it runs on, correlation to the audited systems.)
5. The log is generated **client-side on dev machines**. Does that
   origin undermine it, and what would offset that (CI-only generation?
   org-level aggregation? signed uploads)?
6. What developer-generated evidence do you accept today that looked
   weird five years ago? (Calibrates how formats become normal.)
7. If Phase 3 ships — org-wide rollup, signed PDF, per-control mapping —
   does that change your answer? What would you want on that PDF's face?

## Decision rule (feeds the roadmap gate)

- **2 of 3 say accept or accept-with-conditions** → Phase 3 GO. Log the
  conditions as Phase 3 requirements (e.g., RFC 3161 timestamping).
- **Split verdict** → ship the highest-frequency condition into core
  (cheap ones like timestamping), then re-ask.
- **Majority reject** → STOP Phase 3. Write up why in
  `positioning-evidence.md` as a POSITIONING BREAK and re-think Pro's
  value prop around the developer-side value (gate quality, cited
  blocks) instead of auditor evidence.

## Tracker

| Date | Firm / channel | Person | Sent | Bumped | Reply | Verdict | Notes |
|------|----------------|--------|------|--------|-------|---------|-------|
|      |                |        |      |        |       |         |       |
