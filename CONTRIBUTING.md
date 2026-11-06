# Contributing

This project uses **pnpm** for package management.

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm 12 (via corepack: `corepack enable` — the exact version is pinned by `packageManager` in `package.json`)

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3000)
pnpm verify           # Full local verification (mirrors CI)
```

## Common Commands

| Command            | Purpose              |
| ------------------ | -------------------- |
| `pnpm dev`         | Start dev server     |
| `pnpm build`       | Production build     |
| `pnpm test`        | Unit tests           |
| `pnpm test:e2e`    | E2E tests            |
| `pnpm test:visual` | Visual regression    |
| `pnpm lint`        | ESLint               |
| `pnpm typecheck`   | TypeScript check     |
| `pnpm coverage`    | Coverage report      |
| `pnpm reset`       | Full local reset     |
| `pnpm verify`      | Full CI verification |

## Documentation-First Workflow

For changes affecting architecture or workflows:

1. Update `sdd.yaml` and relevant docs in `docs/`
2. Create an ADR for architectural decisions (`docs/adr/`)
3. Open PR with issue reference
4. Implement code aligned to updated SDD
5. Ensure CI passes

## Before Opening a PR

1. **Format & lint**: `pnpm lint:fix && pnpm typecheck`
2. **Test**: `pnpm test && pnpm test:e2e && pnpm coverage`
3. **Security**: `pnpm audit:secrets && pnpm audit:security`
4. **Review**: Check against [Review Checklist](./docs/REVIEW_CHECKLIST.md)

## Testing

See [Testing Guide](./docs/TESTING.md) for comprehensive documentation.

**Requirements:**

- 90% coverage threshold
- Unit tests for new code
- E2E tests for user flows
- Visual tests for UI changes

**Commands:**

```bash
pnpm test                # Unit tests
pnpm test:e2e            # E2E (requires dev server)
pnpm test:visual         # Visual regression
pnpm test:visual:update  # Update baselines
```

## Key Documentation

| Document                                              | Purpose                  |
| ----------------------------------------------------- | ------------------------ |
| [TESTING.md](./docs/TESTING.md)                       | Testing strategy         |
| [REVIEW_CHECKLIST.md](./docs/REVIEW_CHECKLIST.md)     | PR review checklist      |
| [ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)         | Error patterns           |
| [FORBIDDEN_PATTERNS.md](./docs/FORBIDDEN_PATTERNS.md) | Anti-patterns            |
| [AI_AGENT_GUIDE.md](./docs/AI_AGENT_GUIDE.md)         | AI agent quick reference |

## AI Guardrails

PRs must satisfy automated quality checks:

1. **Test coverage**: Changes to `app/`/`lib/` require test changes
2. **PR template**: Complete all checklist items
3. **ADRs**: Architecture changes require ADR link
4. **CI gates**: lint, typecheck, test, e2e, visual

## Issues

Use issue templates for:

- Bug reports
- Feature requests
- Documentation improvements

Security vulnerabilities → GitHub Security Advisories (not public issues).

## CI & Auto-merge

- CI and CodeQL run on pushes and PRs to `main`
- Dependabot PRs auto-merge when checks pass
- Use `copilot-automerge` label for auto-merge

Always use `pnpm` (not npm/yarn) in this repository.
