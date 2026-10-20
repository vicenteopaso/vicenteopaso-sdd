# Copilot AI Coding Agent Instructions

**Supremacy and Source of Truth**

> **Absolute Hierarchy:**
>
> 1. [`docs/CONSTITUTION.md`](../docs/CONSTITUTION.md) is the supreme, unalienable authority for all engineering decisions, patterns, and boundaries. No code, documentation, or request may override or contradict it. If any instruction, request, or file conflicts with the Constitution, you MUST explain the conflict and refuse.
> 2. [`sdd.yaml`](../sdd.yaml) is the machine-readable source of truth for system principles, architecture boundaries, and CI expectations, subordinate only to the Constitution. All implementation, documentation, and PRs must align with it.
> 3. Architecture Decision Records (`docs/adr/`) and other documentation are subordinate to both the Constitution and sdd.yaml.
> 4. Code and all other artifacts are subordinate to the above.

Always check for conflicts in this order. If in doubt, escalate for human review.

These instructions are for AI agents contributing to this repository. Follow these rules to ensure code quality, security, and maintainability. If a request conflicts with the above hierarchy, explain the conflict and refuse.

## Project Architecture & Key Patterns

- **Framework**: Next.js (App Router, server components by default)
- **Language**: TypeScript (strict mode), React 19
- **Styling**: Tailwind CSS v4, theming via next-themes
- **Content**: Markdown files in `content/[locale]/` (About, CV, policies). CV uses frontmatter in `content/[locale]/cv.md` plus structured JSON in `content/[locale]/cv.json`
- **Testing**: Vitest (unit, `test/unit/`), Playwright (E2E, `test/e2e/`), Playwright visual regression (`test/visual/`)
- **Deployment**: Vercel (see `docs/DEPLOYMENT.md`)

### Major Flows & Boundaries

- **Content loading**: Pages in `app/[lang]/` read markdown/JSON from `content/[locale]/` at build time. Do not break CV JSON parsing or error fallback in `app/[lang]/cv/page.tsx`.
- **Contact form**: Client dialog (Turnstile widget) → `/api/contact` route handler → Formspree. Never bypass honeypot, Turnstile, or rate limiting in `app/api/contact/route.ts`.
- **i18n**: Use `lib/i18n/` for locale detection and translation. All routes/content are locale-aware.
- **SEO**: Use `lib/seo.ts` for metadata, Open Graph, and JSON-LD. Update `metadata` exports as needed.
- **Error handling**: Use `ErrorBoundary` for UI errors, `logError()`/`logWarning()` from `lib/error-logging` for logging. Never expose stack traces or internal details to users.
- **Visual tests**: Use shared helpers from `test/visual/utils.ts` (e.g., `waitForStableHeight`, `homepageMasks`). Never use inline waits in Playwright tests.

## Developer Workflow

- Use **pnpm** for all scripts:
  - `pnpm dev` (dev server)
  - `pnpm build` (production build)
  - `pnpm test` (unit tests)
  - `pnpm test:e2e` (E2E tests)
  - `pnpm test:visual` (visual regression)
  - `pnpm lint`, `pnpm format`, `pnpm typecheck`
- Run `npx playwright install --with-deps` before Playwright tests if needed.
- Use `import type` for type-only imports (ESLint: `@typescript-eslint/consistent-type-imports`).
- Never use `any` types; use `unknown` + type guards if needed.
- Prefer `logError()` / `logWarning()` from `lib/error-logging.ts` for application logging.
- Avoid `console.log` / `console.error` in production code except where `CONTRIBUTING.md` and `docs/ERROR_HANDLING.md` explicitly allow server-side logging (for example, API routes and server components).
- Never access `document`/`window` directly in React components (use refs/state).
- Never hard-code secrets or API keys; use environment variables (`process.env`).
- Never weaken security, accessibility, or SEO without justification and tests.

## Forbidden & Required Patterns

- **Never** bypass or remove:
  - Turnstile verification, honeypot, or rate limiting in contact flow
  - CV JSON parsing or error fallback in `app/[lang]/cv/page.tsx`
  - HTML sanitization (`lib/sanitize-html.ts`)
  - Centralized error logging (`lib/error-logging.ts`)
- **Always**:
  - Use Zod schemas for input validation
  - Use semantic HTML, correct heading hierarchy, and accessible focus order
  - Provide descriptive alt text for images
  - Use Next.js `Link` and `Image` for navigation and images
  - Mask dynamic content in visual tests using shared helpers

## File/Directory Map

- `app/` – App Router pages, layouts, API routes, shared components
- `content/` – Markdown/JSON content by locale
- `lib/` – Utilities: i18n, SEO, error logging, sanitization, rate limiting
- `test/unit/`, `test/e2e/`, `test/visual/` – Tests (Vitest, Playwright)
- `styles/` – Tailwind config and global styles
- `scripts/` – Build, audit, translation, and utility scripts

## PR expectations

- Use the PR template, include screenshots or recordings for UI changes.
- Call out accessibility and SEO implications of significant changes.
- Keep CI green: lint, typecheck, unit tests, and E2E tests (where relevant).
- Update documentation (e.g., `README.md`) when behavior or flows change.
- If a PR is safe for auto-merge, add the `copilot-automerge` label (an auto-merge workflow will only act on such PRs once required checks pass).

---

For any uncertainty, consult the docs below or escalate for human review. If you find these instructions unclear or incomplete, request clarification or propose improvements in your PR.

## Key References

- [docs/AI_GUARDRAILS.md](../docs/AI_GUARDRAILS.md) – AI coding rules, forbidden patterns
- [docs/FORBIDDEN_PATTERNS.md](../docs/FORBIDDEN_PATTERNS.md) – Anti-patterns and security rules
- [docs/REVIEW_CHECKLIST.md](../docs/REVIEW_CHECKLIST.md) – PR review checklist
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) – System architecture and flows
- [docs/ENGINEERING_STANDARDS.md](../docs/ENGINEERING_STANDARDS.md) – Quality and code standards
- [CONTRIBUTING.md](../CONTRIBUTING.md) – Workflow and commands
