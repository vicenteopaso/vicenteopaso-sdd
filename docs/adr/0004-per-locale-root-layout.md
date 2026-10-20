# ADR-0004: Per-Locale Root Layout with a Global Not-Found Page

**Status**: Accepted

**Date**: 2026-10-20

**Deciders**: Vicente Opaso (owner)

**Technical Context**: Routing, i18n, SEO (CONSTITUTION-10, CONSTITUTION-11), App Router file conventions

---

## Context and Problem Statement

The site is bilingual (`/en/*`, `/es/*`) and fully prerendered. The root layout lived at `app/layout.tsx`, which receives no route params, so it rendered `<html lang="en">` for every page. An inline script corrected `lang` after load, so the prerendered HTML that crawlers, link previews and no-JS clients read declared Spanish pages as English. The same layout injected JSON-LD through a client `<Script>` keyed on `/` and `/cv`. Real paths are `/en` and `/en/cv`, so no structured data was ever emitted.

The `<html>` element has to be rendered by a layout that knows the locale, without making any page dynamic.

## Decision Drivers

- Correct `lang` in the static HTML of each locale (WCAG 3.1.1, SEO).
- Keep every page statically prerendered (`●` SSG); no per-request rendering.
- One place for site chrome (fonts, providers, nav, footer, structured data).
- Unknown URLs must return HTTP 404, with localized copy and correct `lang`.

## Considered Options

- **Option 1**: Keep `app/layout.tsx` and fix `lang` client-side (status quo).
- **Option 2**: Keep `app/layout.tsx`, read the locale from a request header and render `lang` from it.
- **Option 3**: Move the root layout to `app/[lang]/layout.tsx`, and render unmatched URLs with `app/global-not-found.tsx` (`experimental.globalNotFound`).

## Decision Outcome

**Chosen option**: Option 3. Option 2 needs `headers()` in the root layout, which makes every page dynamic. Option 1 leaves the static HTML wrong.

- `app/[lang]/layout.tsx` is the root layout. It renders `<html lang={locale}>`, exports `generateStaticParams` for `en`/`es` with `dynamicParams = false`, and server-renders WebSite JSON-LD. Pages add their own JSON-LD (Person, ProfilePage, Article) through `app/components/JsonLd.tsx`.
- Next.js does not attach a `not-found.tsx` boundary at the level of a root layout that sits under a dynamic segment. A catch-all page calling `notFound()` produced a blank 404 in production. The Next.js docs name `global-not-found.js` for exactly this layout shape, so unmatched URLs render `app/global-not-found.tsx` instead.
- `global-not-found` receives no params. `proxy.ts` therefore forwards the path locale as the `x-opaso-locale` request header (`LOCALE_REQUEST_HEADER`), and the page uses it for `lang`, copy and the home link. It falls back to English.
- Non-locale paths keep being redirected by `proxy.ts` to `/{locale}{path}` (cookie → `Accept-Language` → `en`). The unreachable root redirect pages `app/found-luggage` and `app/lost-luggage` were removed.

### Consequences

- **Good**: Static HTML declares the right language for every page. Canonical and hreflang alternates, localized metadata and JSON-LD are all emitted at build time. All pages stay SSG.
- **Good**: 404s are server-rendered, localized, `noindex`, and return HTTP 404.
- **Bad**: `globalNotFound` is experimental in Next.js 16.4. A future upgrade may change or stabilize the API. Revisit on each Next.js major.
- **Bad**: The 404 page renders outside the layout, so it has no site nav or footer. It imports global styles itself.
- **Neutral**: Pages under `app/[lang]` must not call `notFound()`; there is no boundary to catch it. Missing content fails the build through `loadContentPage`/`loadCv` instead.

## Validation

- `test/unit/layout.test.tsx`: `lang`, localized skip link and WebSite JSON-LD per locale.
- `test/unit/global-not-found.test.tsx` and `test/unit/middleware.test.ts`: localized 404 and header forwarding.
- Verified against `next start`: `/es/nope` returns 404 with `<html lang="es">` and Spanish copy, and `/en`, `/es`, `/en/cv` stay 200 and SSG.

## Links

- Next.js docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` (section `global-not-found.js`)
- PR: https://github.com/vicenteopaso/vicenteopaso-sdd/pull/452
