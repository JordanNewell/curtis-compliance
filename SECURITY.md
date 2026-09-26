# Security Policy

## Reporting a Vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Report vulnerabilities privately to **<security@jordannewell.com>**.
(Placeholder address — Jordan will replace with a dedicated security inbox.)

If you have a PGP key, encrypt the report. The fingerprint of the project's
reporting key will be published here once Jordan generates it:

```
PGP fingerprint:  TBD (to be published)
PGP public key:   TBD (to be published)
```

Until the PGP key is published, plaintext email is fine — but please prefer
it over GitHub issues either way.

Please include, where possible:

- A description of the issue and its impact.
- The smallest reproducer you can manage (a failing test is ideal).
- Affected versions (or the commit SHA you tested against).
- Any mitigations you've already tried.

## Response SLA

- **Acknowledgement:** within **48 hours** (typically same business day).
- **Initial assessment + severity rating:** within **5 business days**.
- **Fix or mitigation timeline** depends on severity:
  - *Critical* (RCE, key compromise, auth bypass): patch or mitigation
    within 7 days of confirmation; coordinated disclosure afterwards.
  - *High*: patch within 30 days.
  - *Medium / Low:* next minor release.

We will keep you informed at each step and credit you in the release notes
unless you'd prefer to remain anonymous.

## Scope

**In scope:**

- The `curtis-compliance` application, its API surface, and data handling layers.
- Anything that could leak or tamper with compliance data.

**Out of scope:**

- Vulnerabilities in third-party dependencies. Report those upstream.
- Attacks requiring a compromised maintainer, a compromised signing key, or
  physical access to the reporter's machine.
- Reports from automated scanners without a working reproducer.

## Disclosure policy

We follow **coordinated disclosure**. Once a fix is available we'll publish a
GitHub Security Advisory, request a CVE if appropriate, cut a patch release,
and credit the reporter in the changelog. We will not publish details of
unpatched critical issues.
