---
name: Technical Governance
title: Technical Governance
slug: technical-governance
description: How Spec-Driven Development (SDD) and documentation-first engineering shaped this project, enabling AI-assisted development with governance-driven architecture.
---

## Documentation-First Engineering

This project was built using a **Documentation-First** approach, where comprehensive governance documents, architecture specifications, and engineering standards were written before and during development. These documents served as the foundation for both human decision-making and AI-assisted implementation.

### The Philosophy

Rather than writing code first and documenting later, this project inverts the traditional workflow:

1. **Define Intent** — Engineering standards, architecture decisions, and governance principles are captured in markdown documents
2. **Establish Governance** — Clear rules, quality gates, and decision-making frameworks are documented
3. **Build with Guidance** — Code is written with these documents as the source of truth, ensuring consistency and alignment
4. **AI as Co-Pilot** — AI tools (like [Claude Code](https://claude.com/claude-code), GitHub Copilot, and [Cursor](https://cursor.com)) use these documents to understand context, make informed suggestions, and maintain architectural integrity

## Spec-Driven Development (SDD) in Practice

### Core Governance Documents

The project's technical governance is defined through several key documents:

#### Engineering Standards (`docs/ENGINEERING_STANDARDS.md`)

A comprehensive **north-star** document that captures engineering intent across:

- **Architectural Foundations** — Modular, component-based architecture principles
- **Frontend Engineering Standards** — Code quality, component engineering, and design system guidelines
- **Accessibility (A11y)** — WCAG 2.1 AA targets, testing practices, and tooling
- **Security Hardening** — Runtime security, build-time checks, and authentication patterns
- **Performance & Web Vitals** — Core Web Vitals targets, Lighthouse thresholds, and optimization strategies
- **SEO & Discoverability** — Technical SEO, structured data, and content optimization
- **Testing Standards** — Unit, integration, and E2E testing expectations with coverage thresholds
- **Design System Standards** — Design tokens, component guidelines, and documentation practices

This document serves as the **single source of truth** for what "good" looks like in this codebase.

### Solution-Agnostic Policy, Constitution, and SDD

- **Supremacy**: `docs/CONSTITUTION.md` defines the immutable invariants and conflict-resolution precedence for this repo.
- Within those constraints, the machine-readable SDD at `/sdd.yaml` is authoritative for principles, boundaries, and CI expectations.
- Governance and standards are solution-agnostic: technology choices may evolve, but the principles must remain intact.
- Any change that affects architecture or cross-cutting concerns should update the SDD and relevant documentation in the same PR.

#### Architecture Overview (`docs/ARCHITECTURE.md`)

Defines the technical architecture including:

- System components and their relationships
- Technology stack decisions (Next.js, React, Tailwind, etc.)
- Content architecture (Markdown + Zod-validated frontmatter)
- Deployment model (Vercel)
- Key data flows and integrations

#### Engineering Constitution (`docs/CONSTITUTION.md`)

Defines the repo’s **immutable invariants** and the governance **precedence order**.

- It is intentionally short and stable (MUST / MUST NOT / NEVER statements only).
- The SDD (`sdd.yaml`) and ADRs provide the changeable details and rationale.

#### Additional Governance Documents

- **Architecture Decision Records** (`docs/adr/`) — Lightweight records of architectural decisions with context, alternatives, and consequences
- **AI Guardrails** (`docs/AI_GUARDRAILS.md`) — AI coding rules, required practices, forbidden patterns, and review checklist
- **Design System** (`docs/DESIGN_SYSTEM.md`) — Visual design tokens, component patterns, usage guidelines
- **Accessibility Guidelines** (`docs/ACCESSIBILITY.md`) — Technical accessibility practices and tooling
- **SEO Guide** (`docs/SEO_GUIDE.md`) — SEO implementation patterns and best practices
- **Error Handling** (`docs/ERROR_HANDLING.md`) — Error boundaries, logging, and monitoring strategies
- **Security Policy** (`docs/SECURITY_POLICY.md`) — Security practices and vulnerability reporting
- **Testing** (`docs/TESTING.md`) — Unit, E2E, visual regression, and accessibility test suites
- **Configuration and Deployment** (`docs/CONFIGURATION.md`, `docs/DEPLOYMENT.md`) — Environment variables and the CI-driven deploy path

## Architecture Decision Records (ADRs)

To complement the comprehensive documentation, this project uses **Architecture Decision Records (ADRs)** to capture significant architectural decisions with their context and consequences.

### Purpose

ADRs provide lightweight, searchable documentation that:

- **Captures Context** — Documents why decisions were made, not just what was implemented
- **Preserves Rationale** — Prevents future contributors from undoing good decisions
- **Shows Alternatives** — Records what options were considered and why they weren't chosen
- **Tracks Consequences** — Explicitly documents trade-offs and known limitations
- **Enables AI Context** — Provides structured architectural context for AI-assisted development

### When to Write an ADR

Create an ADR for decisions about:

- **Architecture changes** — System structure, boundaries, or patterns
- **Technology choices** — Adopting new libraries, frameworks, or tools
- **Cross-cutting concerns** — Error handling, logging, security, performance
- **Breaking changes** — API changes, contract modifications
- **Design patterns** — New patterns or deprecation of existing ones

See `docs/adr/README.md` for the complete ADR process and template.

### ADR Integration

ADRs integrate with the development workflow:

1. **Propose Decision** — Draft ADR with status "Proposed" before implementation
2. **Open PR** — Link to ADR in PR description
3. **Review Together** — Review both code and ADR
4. **Accept Decision** — Update ADR status to "Accepted" after merge
5. **Reference Later** — Future PRs and AI agents reference ADRs for context

## How AI-Assisted Development Works

### Context-Aware Development

With comprehensive documentation and ADRs in place, AI tools can:

1. **Understand Intent** — By reading `ENGINEERING_STANDARDS.md`, AI understands the quality bar, architectural patterns, and coding standards
2. **Learn from Decisions** — By reading ADRs, AI understands past architectural decisions and their rationale
3. **Maintain Consistency** — When suggesting code, AI references the design system, accessibility guidelines, and testing standards
4. **Enforce Governance** — AI can flag deviations from documented standards and suggest corrections
5. **Generate Tests** — Testing expectations and coverage thresholds in the SDD/CI guide AI to generate appropriate test suites
6. **Document Decisions** — AI helps maintain documentation and write ADRs as code evolves

### Example Workflow

When implementing a new feature:

1. **Reference Standards** — AI reads `ENGINEERING_STANDARDS.md` to understand component patterns, accessibility requirements, and testing expectations
2. **Review Past Decisions** — AI consults ADRs in `docs/adr/` to understand previous architectural choices and their rationale
3. **Check Architecture** — AI consults `ARCHITECTURE.md` to ensure the implementation aligns with system design
4. **Apply Design System** — AI uses `DESIGN_SYSTEM.md` to suggest appropriate design tokens and component patterns
5. **Document Decision** — If the feature requires an architectural decision, AI helps draft an ADR
6. **Generate Tests** — AI creates tests that meet coverage thresholds enforced in the SDD/CI
7. **Maintain Documentation** — AI helps update relevant docs if the feature introduces new patterns

## Benefits of This Approach

### For Development

- **Faster Onboarding** — New contributors (human or AI) can understand the project quickly through documentation
- **Consistent Quality** — Standards are explicit, not implicit, reducing variance in code quality
- **Reduced Technical Debt** — Decisions are documented, making it easier to understand "why" and avoid regressions
- **Better AI Assistance** — AI tools have rich context to provide more accurate suggestions

### For Maintenance

- **Clear Decision History** — Architecture decisions are captured, not lost in commit messages
- **Easier Refactoring** — Understanding original intent helps make safe changes
- **Quality Gates** — CI/CD enforces documented standards automatically
- **Living Documentation** — Docs evolve with the codebase, staying current

### For Collaboration

- **Shared Understanding** — Everyone (including AI) works from the same source of truth
- **Explicit Trade-offs** — Decisions and their rationale are documented
- **Governance as Code** — Standards are version-controlled and reviewable
- **Transparency** — Project structure and quality expectations are clear

## Implementation Details

### Documentation Structure

All governance documents live in the `docs/` directory:

```
docs/
├── adr/                      # Architecture Decision Records
│   ├── README.md            # ADR process and index
│   ├── 0000-adr-template.md # Template for new ADRs
│   ├── 0001-adopt-architecture-decision-records.md
│   ├── 0002-implement-ai-guardrails.md
│   ├── 0003-high-contrast-mode-conforming-alternate.md
│   └── 0004-per-locale-root-layout.md
├── components/               # Per-component documentation
├── ENGINEERING_STANDARDS.md  # North-star engineering intent
├── ARCHITECTURE.md           # Technical architecture
├── CONSTITUTION.md           # Repository governance
├── AI_GUARDRAILS.md          # AI coding rules and quality gates
├── FORBIDDEN_PATTERNS.md     # Prohibited patterns
├── REVIEW_CHECKLIST.md       # Pre-merge checklist
├── DESIGN_SYSTEM.md          # Visual design system
├── ACCESSIBILITY.md          # A11y guidelines
├── TESTING.md                # Test suites and coverage
├── SEO_GUIDE.md              # SEO practices
├── ERROR_HANDLING.md         # Error management
├── CONFIGURATION.md          # Environment variables
├── DEPLOYMENT.md             # Deploy pipeline
└── SECURITY_POLICY.md        # Security practices
```

The machine-readable SDD (`sdd.yaml`) and its JSON Schema (`sdd.schema.json`) live at the repository root.

### CI/CD Integration

Documentation standards are enforced through:

- **Linting** — ESLint rules enforce code quality standards, and Knip flags unused code and dependencies
- **Type Checking** — TypeScript strict mode ensures type safety
- **Testing** — Coverage thresholds enforce testing standards, and code changes in `app/` or `lib/` must come with test changes
- **Accessibility** — Accessibility lint rules and an image alt-text audit in CI
- **Security** — CodeQL, dependency audits, and a secret scan
- **Performance** — Lighthouse CI audits every pull request
- **SDD Compliance** — `sdd.yaml` is validated against `sdd.schema.json`

### Version Control

All documentation is:

- **Version-Controlled** — Tracked in Git alongside code
- **Reviewable** — Changes go through PR review
- **Linked** — Documents reference each other for context
- **Living** — Updated as the project evolves

## AI Governance Model

### Principles

This project embraces **AI-first development with strong guardrails**:

1. **AI as Accelerator, Not Decision Maker** — AI tools suggest implementations, but architectural decisions remain human-driven and documented
2. **Documentation as AI Context** — Comprehensive docs enable AI to understand intent and maintain consistency
3. **Quality Gates Are Non-Negotiable** — All AI-generated code must pass the same rigorous checks as human code
4. **Security Constraints Are Mandatory** — AI cannot bypass security controls or introduce vulnerabilities
5. **Human Oversight for Critical Changes** — Security-sensitive and architectural changes require manual review

### Responsibilities

**AI Tools (Claude Code, GitHub Copilot, Cursor):**

- Reference governance docs for context (`docs/CONSTITUTION.md`, `sdd.yaml`, `ENGINEERING_STANDARDS.md`, `ARCHITECTURE.md`)
- Suggest code following documented patterns
- Generate tests meeting coverage requirements
- Update documentation when introducing new patterns
- Run validation checks before committing

**Human Reviewers:**

- Verify architectural alignment
- Assess security implications
- Validate maintainability
- Approve/reject AI suggestions
- Update governance docs as needed

**Automated CI/CD:**

- Enforce linting, type checking, test coverage
- Run security scans (CodeQL, dependency audits, secret scan)
- Check accessibility (lint rules, image alt text, Lighthouse)
- Check performance (Lighthouse budgets)
- Block merge to `main` when a required check fails

### Guardrails and Constraints

**Mandatory guardrails** prevent AI from:

- Bypassing security controls (Turnstile, rate limiting, input validation)
- Weakening accessibility (keyboard nav, ARIA, color contrast)
- Violating architecture boundaries (cross-layer imports, shared mutable state)
- Introducing forbidden patterns (hard-coded secrets, unsanitized HTML, skipped tests)

**Quality gates** that all changes must pass:

- Linting (`pnpm lint`) and formatting (Prettier)
- Type checking (`pnpm typecheck`) in strict mode
- Unit tests with 90% coverage of lines, statements, branches, and functions
- Test changes for any code change in `app/` or `lib/`
- E2E and `axe-core` accessibility suites before merge (`pnpm verify`)
- Accessibility audit
- Security scanning (CodeQL, `pnpm audit`, secret scan)
- Lighthouse SEO ≥95 (blocking); performance, accessibility, and best practices ≥90 (warnings)

See **[AI Guardrails](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/AI_GUARDRAILS.md)** for complete constraints.

### Review Process

**All PRs** (AI or human) follow the same review workflow:

1. **Self-Review** — Author validates changes against [Review Checklist](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/REVIEW_CHECKLIST.md)
2. **CI Validation** — Required checks must pass before merging to `main` (see `.github/workflows/`)
3. **Automated Review** — GitHub Copilot reviews every push to a pull request
4. **Human Review** — Code owner review, with architectural and security review for sensitive changes; all review threads must be resolved
5. **Merge Decision** — Auto-merge eligible for safe changes, manual approval otherwise

**Auto-merge eligible** (Dependabot PRs labeled `dependencies`, or owner PRs labeled `copilot-automerge`, once CI and CodeQL pass):

- Documentation-only changes
- Dependency updates (Dependabot)
- Test updates without behavior changes
- Formatting/linting fixes

**Requires manual review:**

- Security-related changes (API routes, auth, validation)
- Architecture changes (boundaries, patterns)
- Breaking changes
- New dependencies

### Escalation Path

**When things go wrong:**

1. **CI Failure** — Review logs, fix locally, re-run checks, push fixes
2. **Security Vulnerability** — Stop immediately, review [Security Policy](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/SECURITY_POLICY.md), fix vulnerability, re-scan
3. **Accessibility Regression** — Review [Accessibility Guidelines](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md), test with keyboard/screen reader, fix
4. **Architecture Violation** — Review `sdd.yaml` and `ARCHITECTURE.md`, refactor to align, get human approval

**Emergency stop conditions:**

- High/critical security vulnerabilities
- Production errors spike
- Severe accessibility breakage
- Data loss or corruption
- Secrets exposed in commits

**Escalation contacts:**

- Repository owner: @vicenteopaso
- Security issues: GitHub Security Advisories (private reporting)

### Governance Documentation

- **[AI Guardrails](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/AI_GUARDRAILS.md)** — Constraints and quality gates for AI development
- **[Forbidden Patterns](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/FORBIDDEN_PATTERNS.md)** — Anti-patterns and prohibited changes
- **[Review Checklist](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/REVIEW_CHECKLIST.md)** — Pre-merge validation checklist

## Future Considerations

This documentation-first approach scales well:

- **Team Growth** — New team members can onboard quickly
- **AI Evolution** — As AI tools improve, richer context yields better results
- **Knowledge Preservation** — Institutional knowledge is captured, not lost
- **Compliance** — Standards can be audited and verified
- **Tooling** — Documentation can drive automated tooling and checks

## Related Documentation

For developers and contributors:

- [Tech Stack](/en/tech-stack) — Complete technology stack and tooling overview
- [Engineering Standards](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md) — Comprehensive engineering intent
- [Architecture Overview](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ARCHITECTURE.md) — Technical architecture
- [Engineering Constitution](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/CONSTITUTION.md) — Repository governance
- [Design System](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md) — Visual design tokens and patterns
- [Accessibility Guidelines](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md) — Technical a11y practices

## Issue Templates and Community Feedback

The repository uses structured issue templates to facilitate bug reports, feature requests, and documentation improvements:

- **Bug Reports** — Structured form for reporting functional issues with browser/device context
- **Feature Requests** — Template for proposing enhancements with use case and priority assessment
- **Documentation Issues** — Form for reporting documentation gaps or improvements

Issue templates ensure consistency, capture necessary context, and integrate with CI/CD workflows through automatic labeling. Security vulnerabilities should be reported privately through GitHub Security Advisories rather than public issues.

See `.github/ISSUE_TEMPLATE/` for template definitions and usage guidelines.

## Last Updated

This technical governance documentation was last reviewed and updated on November 6, 2026.
