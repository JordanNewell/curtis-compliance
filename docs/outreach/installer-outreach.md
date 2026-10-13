# Track A2/A3 — Installer Outreach Pack (ICP + pricing discovery)

> **Goal:** 5–10 conversations (or written answers) from people who
> actually installed Curtis — who they are, why they tried it, whether
> their org would ever pay, and at what price.
>
> **Gates this opens:** A2 → outreach copy + Pro feature priority
> (Phase 2 dashboard scope). A3 → the pricing decision blocking
> Phase 5 (current recommendation: $29/seat/mo).
>
> **Reality check:** ~1,000 downloads Jul 20–31, 52/month since. The
> July cohort is the list. We have no telemetry — this post is the
> only way to find them.

---

## Channel 1 — GitHub Discussions post (primary)

**First:** enable Discussions on the repo (Settings → General →
Features → Discussions), category "Q&A" or "Ideas". Then post —
Monday–Wednesday morning US-East tends to do best.

**Title:**
`Who's using Curtis in a real repo? 20 minutes (or 5 written answers) to shape what's next`

**Body:**

> Hey — Jordan here, the maintainer.
>
> Curtis got a burst of attention in July, and I'm now planning what
> comes next (hosted GitHub App, org-level evidence rollup, PDF export
> for auditors — the works). Before I build any of it, I want to talk to
> the people who actually use the thing, because right now I have
> download numbers and no faces.
>
> **If you've run `curtis-compliance init` anywhere — even a scratch
> repo — I'd owe you for 20 minutes on a call.** Or skip the call and
> just answer any of these inline as a comment or DM:
>
> 1. How'd you find Curtis, and what were you hoping it would do?
> 2. What's your situation — team size, role, and are you under
>    SOC 2 / PCI / HIPAA pressure (in an audit now, heading into one,
>    or between)?
> 3. Which rules did you keep enabled? Did it block anything real, or
>    mostly false positives? Did you turn `blockOnFailure` off?
> 4. Did the audit trail ever get looked at — by you, or anyone else?
> 5. Does your org use Vanta / Drata / Secureframe? Would Curtis next
>    to it feel like a complement or a duplicate?
> 6. There'll be a paid hosted tier someday (core stays MIT forever).
>    Semgrep charges $30/developer/month — at $29/seat/mo, would your
>    team ever expense this? What number is "obviously yes", what's
>    "too much"?
>
> What you get back: **founding-user status — the hosted tier free for
> your team when it ships**, and you'll see the roadmap bend based on
> what these conversations surface.
>
> If you tried it and uninstalled it, I especially want to hear from
> you — the reason you left is more useful than a compliment.

**Why this shape works:** devs avoid calls; the inline questions let
80% of respondents answer in writing at midnight. The uninstall line
isn't politeness — churn reasons are the highest-signal data in the
whole exercise.

## Channel 2 — harvest the July spike

The people most likely to respond are ones we can find directly:

1. **r/soc2, r/devops, r/fintech:** find threads from Jul 20–31 where
   Curtis was mentioned or shared (check profile history). If someone
   shared it, DM them — they're warm. Disclosure-first DM:
   > Hey — I'm the maintainer of that compliance scanner you shared in
   > [thread] back in July. I'm doing 20-min user interviews before
   > building the next chunk (hosted tier, audit rollup). Free hosted
   > tier for your team when it ships if you're up for it. Or happy to
   > just send the 6 questions if a call's a pain.
2. **npm + GitHub traffic:** repo Insights → Traffic shows referring
   sites for Jul 20–31 — that's where the cohort came from; post the
   same ask there if it's a community (HN comment follow-up, etc.).
3. **GitHub stargazers/watchers (2 stars — yes, both of them):**
   personal, high-hit-rate asks.

## Channel 3 — HN follow-up (if July was an HN launch)

If the July spike traces to a Show HN, post a comment on that thread:
new version shipped since, doing user interviews, same offer. People
who upvoted get notified and it re-surfaces the project legitimately.

---

## The A2/A3 interview script (25 min)

Warm, curious, never defensive. Their usage is data, not a grade on the
product. Record with permission.

**Context (5 min)**

1. How'd you find Curtis, and what were you hoping for when you ran init?
2. Team size, your role, industry. Who owns compliance at your company —
   is there a named person, or is it "the engineers sort of handle it"?
3. Audit status: in one now / next 6 months / between / never had one?

**Usage — the truth section (8 min)**

4. Walk me through what happened after init. Rules kept? Rules off? Why?
5. Did it block anything real? Tell me about the first block — annoying
   or useful?
6. Did anything false-positive badly enough that you reached for
   `enabled: false`? (The audit-logging rule's `export` keyword issue
   is known — ask if they hit it.)
7. The audit log: ever opened the JSONL? Ran `verify`? Exported CSV?
   Shown it to anyone outside engineering?

**Money — the A3 section (7 min)**

8. (Only if Q2–3 suggest an org that audits) Who at your company would
   sign off on a $50–150/month dev tool — is that a real purchase path
   or a fantasy?
9. Semgrep charges $30/developer/month; Vanta starts around $6K/year at
   the org level. At **$29/seat/mo** for a hosted tier — honest gut
   call: pay, bounce, or "depends what it does"?
10. What would this tool have to do to make that an obvious yes? What's
    missing today?
11. How many devs would need seats at your place, honestly?

**Positioning + referral (5 min)**

12. Do you use Vanta/Drata/Secureframe or plan to? Does Curtis next to
    them feel like a complement or a duplicate?
13. What almost stopped you from installing? What would make you tell a
    teammate about it?

## How answers map back to the roadmap

| Question | Feeds |
|----------|-------|
| 2–3, 8 | ICP definition — segment, buyer vs installer |
| 4–6 | Rule quality backlog (false-positive burn-down order) |
| 7, 11 | Whether the audit trail is a feature or THE product (A1 tie-in); seat counts for pricing model |
| 9–10 | A3 pricing decision — confirm or kill the $29 recommendation |
| 12 | §8.4 "complement vs redundant" — settles the framing question |
| 13 | Landing-page objection handling (Phase 5 copy) |

After every interview: 10-minute debrief into the tracker below, same
day. 5+ interviews in → update `docs/research/positioning-evidence.md`
with an `## A2/A3 findings — YYYY-MM-DD` section; contradictions get
recorded, not smoothed.

## Tracker

| # | Date | Channel | Person / handle | Team size | Audit status | Would pay @ $29? | Vanta user? | Kill-quote / notes |
|---|------|---------|-----------------|-----------|--------------|------------------|-------------|--------------------|
| 1 |      |         |                 |           |              |                  |             |                    |
