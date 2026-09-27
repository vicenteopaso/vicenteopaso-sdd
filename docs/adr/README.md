# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the vicenteopaso-vibecode project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences. ADRs provide:

- **Context**: Why the decision was needed
- **Decision**: What was decided
- **Consequences**: The impact of the decision (positive, negative, and neutral)
- **Alternatives**: What other options were considered and why they were not chosen

## When to Write an ADR

Create an ADR when making decisions about:

- **Architecture Changes**: Significant changes to system structure, boundaries, or patterns
- **Technology Choices**: Adopting new libraries, frameworks, or tools that affect the architecture
- **Cross-Cutting Concerns**: Decisions affecting multiple parts of the system (error handling, logging, security)
- **Performance/Security Trade-offs**: Decisions with significant performance or security implications
- **Breaking Changes**: Changes that affect existing APIs, contracts, or component interfaces
- **Design Patterns**: Introduction of new patterns or deprecation of existing ones

**Rule of thumb**: If you're considering documenting a decision in the PR description, it probably deserves an ADR.

## How to Write an ADR

1. **Copy the template**: Use `0000-adr-template.md` as a starting point
2. **Number sequentially**: Use the next available number (e.g., if last ADR is 0003, use 0004)
3. **Write clearly**: Focus on context, decision drivers, and consequences
4. **List alternatives**: Document what else was considered and why it wasn't chosen
5. **Link to the PR**: Reference the ADR in your PR description
6. **Keep it focused**: One decision per ADR; if there are multiple decisions, write multiple ADRs

### Template Structure

```markdown
# ADR-XXXX: [Title]

**Status**: Proposed | Accepted | Deprecated | Superseded
**Date**: YYYY-MM-DD
**Deciders**: [Who made this decision]
**Technical Context**: [Area of system]

## Context and Problem Statement

[What problem are we solving?]

## Decision Drivers

[What factors influenced the decision?]

## Considered Options

[What alternatives did we consider?]

## Decision Outcome

[What did we decide and why?]

### Consequences

- Positive: [Benefits]
- Negative: [Costs/limitations]
- Neutral: [Things to monitor]

## Pros and Cons of the Options

[Detailed comparison of alternatives]

## References

[Links to issues, RFCs, documentation]
```

## ADR Lifecycle

- **Proposed**: ADR is drafted but not yet accepted (use this status in the PR)
- **Accepted**: ADR is approved and in effect (change after PR merge)
- **Deprecated**: ADR is no longer relevant but kept for historical context
- **Superseded by ADR-XXXX**: ADR is replaced by a newer decision

## ADR Index

| ADR                                                       | Title                                          | Status   | Date       |
| --------------------------------------------------------- | ---------------------------------------------- | -------- | ---------- |
| [0000](./0000-adr-template.md)                            | ADR Template                                   | Template | -          |
| [0001](./0001-adopt-architecture-decision-records.md)     | Adopt Architecture Decision Records            | Accepted | 2025-12-13 |
| [0003](./0003-high-contrast-mode-conforming-alternate.md) | High Contrast Mode as the Conforming Alternate | Proposed | 2026-09-11 |

## Process Integration

### In Pull Requests

When your PR makes an architectural decision:

1. Create the ADR with status "Proposed" before or during PR creation
2. Link to the ADR in the PR description under "Architecture Decision Records (ADRs)"
3. Request review of both code and ADR
4. Update ADR status to "Accepted" after PR is merged

### In Contributing Workflow

ADRs are part of the documentation-first workflow described in `CONTRIBUTING.md`:

1. **Identify architectural decision** during planning
2. **Draft ADR** with context and alternatives
3. **Review ADR** with stakeholders
4. **Implement** code changes aligned with ADR
5. **Update ADR status** when accepted or if superseded

## Best Practices

- **Be concise**: ADRs should be quick to read (1-2 pages max)
- **Be specific**: Provide concrete context, not abstract principles
- **Document alternatives**: Show what was considered, not just what was chosen
- **Include consequences**: Be honest about trade-offs and limitations
- **Link to references**: Connect to issues, RFCs, standards, or other ADRs
- **Update when superseded**: If a decision changes, update the old ADR's status and create a new one

## Resources

- [Michael Nygard's Blog Post on ADRs](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [Project Architecture Documentation](../ARCHITECTURE.md)
- [Technical Governance](../../content/en/technical-governance.md)

## Questions?

If you're unsure whether something needs an ADR or have questions about the process:

- Check existing ADRs for examples
- Review the template for guidance
- Ask in your PR or issue
- Refer to `CONTRIBUTING.md` for the broader documentation workflow
  This directory contains Architecture Decision Records (ADRs) for this project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## When to Create an ADR

Create an ADR when:

- Making changes to the core architecture (e.g., switching frameworks, adding major dependencies)
- Introducing new patterns that affect multiple parts of the codebase
- Making decisions that have long-term implications for the project
- Implementing features that require architectural trade-offs

PRs labeled with `architecture-change` **must** link to an ADR.

## ADR Format

Use the template in `0000-adr-template.md` to create new ADRs.

ADRs should be numbered sequentially:

- `0001-choose-nextjs-app-router.md`
- `0002-adopt-tailwind-v4.md`
- `0003-migrate-to-new-database.md`

## ADR Lifecycle

1. **Proposed** - Initial draft under review
2. **Accepted** - Decision has been approved and implemented
3. **Deprecated** - Decision is no longer relevant
4. **Superseded** - Replaced by a newer ADR (reference the new ADR number)

## Resources

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard
- [ADR GitHub Organization](https://adr.github.io/)
