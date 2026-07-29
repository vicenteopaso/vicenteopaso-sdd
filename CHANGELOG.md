# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-07-29

### Fixed

- CV page's masthead and end-CTA email links shared identical
  "VICENTE@OPA.SO" text but pointed to different destinations (`#contact`
  anchor vs. `mailto:`); added distinct, localized `aria-label`s so screen
  reader users can tell them apart (Lighthouse `identical-links-same-purpose`)
- CV page profile image declared an oversized `sizes` attribute (340px)
  against an actual rendered width of 180px desktop / 280px mobile, causing
  Next/Image to fetch a larger srcset entry than needed
  (`image-delivery-insight`)
- WebMCP polyfill script's internal `blob:` worker was blocked by the CSP's
  `script-src` fallback (no `worker-src` was defined); added a
  narrowly-scoped `worker-src 'self' blob:` directive

## [1.4.0] - 2026-07-17

### Added

- v3 brutalist UI redesign with full EN/ES i18n
- New BrutalistNav, BrutalistFooter, V3ContactForm, CvRefCard components
- Governance & Steering Groups section on the CV page

### Changed

- Landing page and CV page rebuilt with v3 sections and getSiteData()
- Accept-Language parsing improved (whitespace-tolerant q-value handling)
- Reduced Vercel Fluid Active CPU usage: middleware short-circuits bot/probe
  paths before locale work, `/[lang]` unknown locales 404 at the framework
  level, `/opengraph-image` no longer time-revalidates (invalidation is
  handled by `NEXT_PUBLIC_OG_CACHE_DATE`), and `app/layout.tsx` no longer
  forces the `/[lang]` tree dynamic via `headers()` (superseding the
  request-time `x-locale` header approach)
- Dependency updates across the stack (Next.js, React, Tailwind CSS,
  `@sentry/nextjs`, `@opentelemetry/*`, ESLint/TypeScript tooling, and
  others); TypeScript 7 was evaluated but reverted to 6.0.3 after
  confirming `@typescript-eslint/typescript-estree` isn't yet compatible

### Fixed

- Sentry client-side initialization was silently skipped in production for
  region-scoped DSNs (`ingest.us/eu/de.sentry.io`) — the DSN validation
  regex only matched the legacy host format
- OG image generation (`/opengraph-image`, `/cv/opengraph-image`) failed to
  embed the logo in production ("Unsupported image type: unknown", ~100
  occurrences/96 users since May) because it fetched the logo over the
  network from `VERCEL_URL`, which always points at the ephemeral
  per-deployment hostname rather than the stable production domain; the
  logo is now inlined as a base64 data URI read from disk, removing the
  network dependency entirely
- Contact dialog test suite: fake-timer leak and effect-flush race
- Release metadata (`package.json`/`CHANGELOG.md`) sync with the `v1.3.2` tag
- CI: `Version Sync` jobs failed on a cache miss because
  `actions/setup-node@v5`'s automatic package-manager caching had nothing
  to save (these jobs never run `pnpm install`); caching is now disabled
  for them

### Security

- Dismissed Dependabot alert #81 (`@opentelemetry/core` < 2.8.0,
  CVE-2026-54285) as tolerable risk: the vulnerable dependency is pulled in
  transitively by the unmaintained `contentlayer` → `@effect-ts/otel`
  chain, the vulnerable code path (inbound baggage-header parsing) is
  unreachable in this app, and forcing the patched version breaks
  `next.config.mjs` at load time. Migrating off `contentlayer` is tracked
  separately as the real fix.

## [1.2.2] - 2026-02-02

### Added

- **Documentation**: Enhanced technical governance documentation with comprehensive guides for AI development, architecture decisions, and engineering standards
- **Constitution**: Added `docs/CONSTITUTION.md` as the supreme authority for all engineering decisions and patterns
- **SDD Schema**: Introduced structured system design documentation with `sdd.yaml` and `sdd.schema.json`

### Changed

- **Version**: Bumped package version from 1.2.1 to 1.2.2 to reflect accumulated governance and documentation improvements
- **Node Version**: Updated Node.js requirement to v24 LTS in `.nvmrc` and `package.json` engines
- **Dependencies**: Updated multiple dependencies including Next.js, React 19, Tailwind CSS v4, and other packages

### Documentation

- Added comprehensive AI governance documentation including AI_GUARDRAILS.md, FORBIDDEN_PATTERNS.md, and REVIEW_CHECKLIST.md
- Enhanced ARCHITECTURE.md with detailed system flows and boundaries
- Added ENGINEERING_STANDARDS.md for code quality and development practices
- Improved DEPLOYMENT.md with Vercel deployment guidelines
- Added ERROR_HANDLING.md for centralized error handling patterns
- Updated README.md with improved governance documentation structure

## [1.2.1] - 2026-02-02

### Added

- **Features**: Refactored button styles and added glass-card classes with proper CSS variables ([#268](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/268))
- **CI**: Implemented PAT-based workflow triggering for visual snapshot updates ([#271](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/271))

### Changed

- **Dependencies**: Updated Next.js to 16.1.5, jsdom to 28.0.0, and multiple other dependencies
- **Security**: Added pnpm overrides for deprecated subdependencies ([#280](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/280))
- **Governance**: Updated pnpm and enforced PR governance rules ([#277](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/277))

### Fixed

- **Security**: Upgraded Next.js to 16.1.2 to fix CVE-2025-66478 ([#273](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/273))
- **Security**: Restored security protections and sitemap redirects to proxy.ts ([#269](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/269))
- **i18n**: Corrected multiple Spanish translation issues including false cognates and verb usage ([#263](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/263), [#264](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/264), [#265](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/265), [#266](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/266), [#267](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/267))
- **Security**: Fixed qs DoS vulnerability via pnpm override ([#259](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/259))
- **Styles**: Defined missing `--radius-*` CSS variables for glass-card border-radius ([#281](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/281))

### Documentation

- Enhanced documentation with visual diagrams and Spanish content parity ([#260](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/260))
- Improved error handling and reduced Sentry noise ([#262](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/262))

## [1.2.0] - 2025-12-15

### Added

- **Constitution**: Normalized and enumerated all constitutional invariants in `docs/CONSTITUTION.md` with unique `CONSTITUTION-XX` identifiers
- **Governance**: Added reserved slots for future invariants
- **CI/CD**: Enhanced PR template with explicit CI/CD and governance compliance sections

### Changed

- **Governance**: All constitutional invariants are now explicitly enumerated for machine and human reference
- **Documentation**: Updated all governance docs (`AI_GUARDRAILS.md`, `ENGINEERING_STANDARDS.md`, `ARCHITECTURE.md`, `AI_AGENT_GUIDE.md`, `README.md`) for AI-first rigor
- **SDD**: Updated `sdd.yaml` for consistency with AI-first governance model
- **Content**: Updated tech-stack and technical-governance content files for English and Spanish
- **CI**: Enhanced coverage and visual regression workflows
- **Dependencies**: Updated `@types/node`, `zod`, `pnpm/action-setup`, `actions/upload-artifact`, `actions/github-script`

### Documentation

- Updated `.github/PULL_REQUEST_TEMPLATE.md` with additional governance sections
- Updated `cursor.json` for config consistency
- Updated Playwright visual snapshots

## [1.1.0] - 2025-12-14

### Added

- **AI Guardrails**: Implemented comprehensive AI governance framework ([#218](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/218))
- **Security**: Implemented automated secrets scanning and enforcement ([#236](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/236))
- **Documentation**: Added Architecture Decision Records (ADRs) framework ([#232](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/232))
- **Documentation**: Added AI governance and transparency documentation ([#235](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/235))
- **Runtime Guardrails**: Added runtime assertions and ESLint enforcement ([#230](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/230))
- **CI**: Enforced test coverage thresholds in CI ([#228](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/228))
- **Documentation**: Added forbidden patterns documentation and ESLint enforcement ([#226](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/226))
- **Documentation**: Added AI prompt guidance and code review checklist ([#224](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/224))
- **CI**: Added workflow to update Playwright visual snapshots ([#239](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/239))

### Changed

- **ESLint**: Strengthened ESLint configuration for AI Guardrails ([#220](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/220))
- **CI**: Enforced test coverage, PR template compliance, and ADR requirements ([#222](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/222))

### Removed

- **UI**: Removed policy modals and migrated to standalone pages ([#240](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/240))

## [1.0.1] - 2025-12-12

### Changed

- **Dependencies**: Updated Next.js from 16.0.8 to 16.0.10 ([#211](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/211), [#213](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/213))
- **Node Version**: Updated Node.js requirement to v23.5.0 in `.nvmrc`
- **Internationalization**: Made Open Graph images locale-aware with translated badge, subtitle, and footer text for English and Spanish ([#205](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/205))

### Fixed

- Improved test reliability by refactoring page component tests and fixing markdown formatting

### Removed

- Deleted deprecated unit tests for accessibility, home, tech-stack, and technical governance pages to reduce maintenance overhead
- Removed ERROR_HANDLING_SUMMARY.md as error handling is now documented in the main documentation

### Documentation

- Updated CONTRIBUTING.md and README.md with improved clarity
- Enhanced SEO metadata handling documentation
- Added comprehensive CHANGELOG following Keep a Changelog format

## [1.0.0] - 2025-12-02

Initial public release. See [v1.0.0 release notes](https://github.com/vicenteopaso/vicenteopaso-vibecode/releases/tag/v1.0.0) for full changelog.

[1.4.0]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.2.2...v1.3.2
[1.2.2]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/vicenteopaso/vicenteopaso-vibecode/releases/tag/v1.0.0
