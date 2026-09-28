## Summary

<!-- What does this PR change and why? Link issues: Closes #123 -->

## Changes

-
-

## Type of change

<!-- Delete options that are not relevant. -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactor (no behavior change)
- [ ] This change requires a documentation update

## How Tested

<!-- Commands run + results. Check all that apply. -->

- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm check-types`
- [ ] `pnpm test` / `pnpm --filter <package> test`
- [ ] AI service: `ruff check`, `ruff format --check`, `mypy src`, `pytest`
- [ ] Manual verification (describe below):

```text
<paste relevant output>
```

## Screenshots (frontend only)

<!-- Before / after, if UI changed. -->

## Checklist

- [ ] Base branch is `dev`, one focused change per PR
- [ ] Follows `AGENTS.md` (ports/adapters, factories, no raw `useQuery`, mappers, `V1Response`)
- [ ] No secrets committed (`.env`, tokens, keys)
- [ ] Tests added/updated for behavior changes
- [ ] Docs updated (`README`, `AGENTS.md`, or comments) if needed
- [ ] `git status` / `git diff` reviewed — only intended files staged
