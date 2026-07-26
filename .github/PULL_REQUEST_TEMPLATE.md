## Summary

One or two sentences. What does this PR change and why?

## Motivation

Link the issue this closes (e.g. `Closes #123`), or describe the compliance gap it addresses.

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New compliance check / rule
- [ ] Improvement to existing check
- [ ] Refactor (no behavior change)
- [ ] Documentation
- [ ] Breaking change

## Checklist

- [ ] I have read [CONTRIBUTING.md](../blob/master/CONTRIBUTING.md)
- [ ] `npm test` green
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] New check has test fixtures under `tests/`
- [ ] README updated if user-facing behavior changed
- [ ] Commits signed
- [ ] **No AI-attribution trailers** (`Co-Authored-By: Claude`, `Generated-by`, etc.)

## Test plan

How did you verify this works? Paste the CLI invocations and observed output. For new rules, include the sanitized input that triggers a pass and a fail.

```sh
$ curtis-compliance ...
```