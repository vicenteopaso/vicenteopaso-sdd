# Profile API

This repository exposes a canonical, agent-friendly profile endpoint at:

- `/api/profile/en`
- `/api/profile/es`

The endpoint returns a normalized JSON document that combines:

- factual professional data from `content/{lang}/cv.json`
- preference and search-intent data from `content/{lang}/profile-preferences.json`

## Source of Truth

Use the files for different concerns:

- `content/{lang}/cv.json`
  Store factual career content that should also appear on the CV page: work history, skills, education, languages, publications, references.
- `content/{lang}/profile-preferences.json`
  Store additional canonical profile data that is not naturally part of the CV: role preferences, domain preferences, location constraints, work model preferences, company filters, and public profile links.

Avoid duplicating factual CV content inside `profile-preferences.json` unless there is a deliberate need to override a derived value.

## Assembly Model

The canonical profile is assembled by `lib/profile.ts`.

Current behavior:

- `meta.name` comes from `cv.json`
- `meta.years_experience` is derived from the earliest work `startDate`
- language names come from `cv.json`
- `hands_on` lists each position's `handsOn` line from `cv.json` (a company-level `handsOn` applies to every position at that company; a position's own value wins), with company, position and dates
- `projects` lists the side projects from `cv.json` (name, description, optional url, highlights, keywords)
- language levels come from `profile-preferences.json`
- preference-oriented sections come from `profile-preferences.json`
- links are centralized in `profile-preferences.json`

## Build Pipeline

There is no separate generated artifact checked into the repository.

The endpoint is implemented as a static Next.js route handler with `dynamic = "force-static"`, so the canonical JSON is produced by the app build/runtime pipeline from the source files above. In practice, this means:

- update `cv.json` and/or `profile-preferences.json`
- run `pnpm test`
- run `pnpm build`
- verify `/api/profile/{lang}`

If a future workflow needs a checked-in export like `public/profile.en.json`, add that as a separate build step. It is not required for the current implementation.

## Maintenance Checklist

When updating the profile:

1. Update `content/{lang}/cv.json` for factual CV changes.
2. Update `content/{lang}/profile-preferences.json` for search preferences or constraints.
3. Keep English and Spanish files aligned in structure.
4. Run `pnpm test`.
5. Run `pnpm build`.
6. Verify the endpoint output manually or via tests.

## Schema Notes

The endpoint intentionally separates:

- factual professional history
- career targeting and search preferences

This keeps the CV maintainable while still providing a richer machine-readable profile for agentic consumers, ranking pipelines, or search/matching workflows.
