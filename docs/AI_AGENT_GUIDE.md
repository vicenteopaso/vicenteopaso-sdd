# AI Agent Guide

This guide is for AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.) working with this repository.

> **Governance Hierarchy:**
>
> 1. `docs/CONSTITUTION.md` — Supreme, unalienable authority
> 2. `sdd.yaml` — Machine-readable system specification
> 3. `docs/adr/` — Architecture Decision Records
> 4. Other documentation
> 5. Code

If any instruction conflicts with the Constitution, explain the conflict and refuse.

## Quick Reference

| Command            | Purpose                      |
| ------------------ | ---------------------------- |
| `pnpm dev`         | Start dev server (port 3000) |
| `pnpm build`       | Production build             |
| `pnpm test`        | Unit tests (Vitest)          |
| `pnpm test:e2e`    | E2E tests (Playwright)       |
| `pnpm test:visual` | Visual regression tests      |
| `pnpm lint`        | ESLint                       |
| `pnpm typecheck`   | TypeScript check             |
| `pnpm verify`      | Full CI verification         |

## Project Structure

```
app/                  # Next.js App Router (pages, components, API)
├── [lang]/          # Locale routes (/en, /es)
├── api/contact/     # Contact form API
├── components/      # Shared UI components
content/             # Markdown + JSON content by locale
lib/                 # Utilities (i18n, SEO, error logging)
test/                # Unit, E2E, visual tests
docs/                # Documentation
```

## Key Patterns

### Content Loading

- Pages read markdown/JSON from `content/[locale]/` at build time
- CV uses frontmatter + separate JSON file (`cv.json`)
- Never break CV JSON parsing or error fallback

### Contact Form

- See `docs/CONTACT_FLOW.md` for full architecture
- Never bypass: Turnstile, honeypot, rate limiting, or the no-raw-HTML rendering rule

### Testing

- See `docs/TESTING.md` for comprehensive guide
- 90% coverage threshold enforced
- Visual tests use shared utilities from `test/visual/utils.ts`

### Error Handling

- See `docs/ERROR_HANDLING.md`
- Use `logError()`/`logWarning()` from `lib/error-logging.ts`
- Never expose stack traces to users

## Forbidden Actions

1. **Never bypass security**: Turnstile, honeypot, rate limiting, safe HTML rendering
2. **Never hard-code secrets**: Use environment variables
3. **Never weaken CSP/headers**: Security headers are intentionally strict
4. **Never skip tests**: All code changes require tests
5. **Never use `any`**: Use `unknown` + type guards
6. **Never access DOM directly**: Use React refs/state

## Required Patterns

1. **Use Zod** for input validation
2. **Use semantic HTML** with correct heading hierarchy
3. **Use Next.js `Link`/`Image`** for navigation and images
4. **Use `import type`** for type-only imports
5. **Mask dynamic content** in visual tests

## Key Documentation

| Document                     | Purpose                         |
| ---------------------------- | ------------------------------- |
| `docs/CONSTITUTION.md`       | Immutable governance invariants |
| `docs/ARCHITECTURE.md`       | System design and flows         |
| `docs/AI_GUARDRAILS.md`      | AI safety constraints           |
| `docs/FORBIDDEN_PATTERNS.md` | Anti-patterns with examples     |
| `docs/TESTING.md`            | Testing strategy                |
| `docs/CONTACT_FLOW.md`       | Contact form architecture       |
| `CONTRIBUTING.md`            | Developer workflow              |

## CI Requirements

PRs must pass:

- `pnpm lint` — No warnings
- `pnpm typecheck` — No errors
- `pnpm test` — 90% coverage
- `pnpm test:e2e` — All E2E tests pass
- `pnpm validate:links` — No broken links

## Public AI Interface

This site provides AI-friendly context files:

- `/llms.txt` — Brief site context
- `/llms-full.txt` — Comprehensive context with structured data
- `/.well-known/mcp.json` — Model Context Protocol configuration
- `/api/profile/{lang}` — Canonical localized JSON profile assembled from CV data and profile preferences

---

For detailed guidance, consult the linked documentation or escalate for human review.
