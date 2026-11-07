## Summary

<!--
  Provide a clear, concise description of the changes in this PR.

  Governance expectations:
  - PR titles should follow: `type: short summary` where type is one of
    `feat`, `fix`, `chore`, `docs`, `refactor`, or `test`.
  - When using the GitHub CLI (including from AI tools), prefer:
    `gh pr create --fill` or `gh pr create --template PULL_REQUEST_TEMPLATE.md`
    so this template is always applied.
-->

## Related Issue

<!-- Link to the related issue if applicable: Fixes #123, Closes #456 -->

## Type of Change

- [ ] `feat` — New feature or enhancement
- [ ] `fix` — Bug fix
- [ ] `chore` — Maintenance, dependencies, or configuration
- [ ] `docs` — Documentation only
- [ ] `refactor` — Code refactoring without behavior change
- [ ] `test` — Adding or updating tests

> **Note**: Changes limited to documentation (`docs/`, `README.md`, etc.) or tests will skip Vercel builds automatically. See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for details.

## Architecture Decision Record (ADR)

<!-- If this PR includes architecture changes, link to the ADR -->
<!-- Example: See [ADR-0001: Implement AI Guardrails](../docs/adr/0001-implement-ai-guardrails.md) -->

**Architecture Change?**

- [ ] Yes (add `architecture-change` label and link ADR above)
- [ ] No

## Technical Governance Compliance

- [ ] Complies with the supreme invariants in [Constitution](../docs/CONSTITUTION.md)
- [ ] Follows [Engineering Standards](../docs/ENGINEERING_STANDARDS.md)
- [ ] Follows [Architecture](../docs/ARCHITECTURE.md) guidelines
- [ ] Follows [Technical Governance](https://vicenteopaso.com/technical-governance) principles
- [ ] Aligns with the SDD (`/sdd.yaml`) or updates it in this PR
- [ ] Documentation updated in `docs/` (if applicable)
- [ ] Component documentation added/updated (if applicable)
- [ ] README updated (if behavior changes)

## AI Governance (if applicable)

> **Note**: If this PR includes AI-generated code, ensure compliance with AI governance requirements.

- [ ] Reviewed [AI Guardrails](../docs/AI_GUARDRAILS.md) — Security constraints respected
- [ ] Reviewed [Forbidden Patterns](../docs/FORBIDDEN_PATTERNS.md) — No anti-patterns introduced
- [ ] Completed [Review Checklist](../docs/REVIEW_CHECKLIST.md) — All applicable items verified
- [ ] Security controls maintained (Turnstile, rate limiting, input validation, no raw HTML rendering)
- [ ] No secrets or credentials hard-coded
- [ ] Accessibility standards maintained (WCAG 2.1 AA)
- [ ] Architecture boundaries respected (no cross-layer imports)

## Quality Checks

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes with adequate coverage
- [ ] `pnpm test:e2e` passes (if UI/routing changes)
- [ ] Visual tests updated if UI changed (`pnpm test:visual:update`)
- [ ] Reviewed changes against [Code Review Checklist](../docs/REVIEW_CHECKLIST.md)

## CI/CD

- [x] All required checks pass (lint, typecheck, test, coverage, build, a11y, security, Lighthouse)

## AI Guardrails Compliance

> **Required for all code changes in `app/` or `lib/`**

- [ ] Tests added/updated for code changes (unit, e2e, or visual)
- [ ] Error handling verified and follows [Error Handling Guide](../docs/ERROR_HANDLING.md)
- [ ] Accessibility verified (keyboard navigation, ARIA, focus management)
- [ ] SEO impact assessed and metadata updated if needed
- [ ] Security considerations reviewed (input validation, XSS prevention)

## Additional Verification

- [ ] Cross-browser testing completed (if UI changes)
- [ ] Performance impact considered (bundle size, Core Web Vitals)
- [ ] Mobile responsiveness verified (if UI changes)

## Additional Notes

- This PR is a governance/documentation improvement only; no runtime or behavioral changes.
- See `FINAL_AI_FIRST_MISSING_PIECES.md` for context and rationale.
