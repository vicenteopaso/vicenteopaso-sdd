# SEO Guide

SEO is treated as an engineering concern: every rule below is enforced by code and covered by tests, not by convention alone.

## Core Practices

- Every page is statically prerendered per locale (`/en/*`, `/es/*`), with a correct `<html lang>` in the static HTML ([ADR-0004](./adr/0004-per-locale-root-layout.md)).
- Every page has a canonical URL and hreflang alternates (`en`, `es`, `x-default` → `en`).
- Titles and descriptions are localized and come from the same source as the rendered page, so they can't drift.
- Structured data (JSON-LD) is server-rendered in the HTML and derived from `content/<locale>/cv.json`.
- `sitemap.xml` and `robots.txt` are generated at build time from code.

## Implementation

### `lib/seo.ts`: single source of truth

| Export                                                               | Purpose                                                                                                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteConfig`                                                         | Name, domain, base URL, and default description.                                                                                                                                      |
| `baseMetadata(overrides)`                                            | Site-wide defaults: `metadataBase`, title template, and the default social image. Used directly only by the root layout.                                                              |
| `pageMetadata({ locale, path, title, description, robots, images })` | **Use this for every page.** Adds the canonical URL, hreflang alternates, and locale-aware Open Graph (`og:url`, `og:locale`, `og:locale:alternate`).                                 |
| `localizedAlternates(locale, path)` / `localizedPath(locale, path)`  | Canonical and alternate URLs for a locale-less path (`""`, `"/cv"`, …).                                                                                                               |
| `getWebsiteJsonLd(locale)`                                           | `WebSite` node (rendered on every page by the root layout).                                                                                                                           |
| `getPersonJsonLd(locale, cv)`                                        | `Person` node built from the CV: `jobTitle` is the first sentence of `basics.label`, `knowsAbout` the skill groups. `worksFor` is set only while the latest position has no end date. |
| `getCvPageJsonLd(locale, cv)`                                        | `@graph` with `ProfilePage`, `Person`, and one `Article` per CV publication (CV page).                                                                                                |
| `getArticleJsonLd({ locale, path, headline, description })`          | `Article` node for article pages.                                                                                                                                                     |
| `serializeJsonLd(data)`                                              | `JSON.stringify` with `<` escaped, so a value can't close the `<script>` tag.                                                                                                         |
| `INDEXABLE_PATHS`                                                    | Locale-less paths included in the sitemap.                                                                                                                                            |

`lib/seo.ts` has no filesystem access, so it is safe to import anywhere. Callers pass in the CV from `lib/cv.ts` (`loadCv(locale)`).

### Page metadata

- **Markdown-backed pages** (`accessibility`, `cookie-policy`, `privacy-policy`, `tech-stack`, `technical-governance`, `found-luggage`, articles) call `contentPageMetadata(locale, slug, { path?, robots? })` from `lib/content-metadata.ts`. Title and description come from the page's localized frontmatter (`title`, `description`). Add a `description` to the frontmatter of every new page, in both locales.
- **Home and CV** call `pageMetadata()` directly: the home description comes from the `meta.siteDescription` UI string, and the CV description from `getCvDescription(locale)`.
- **Unlisted pages** (`found-luggage`, `articles/*`) pass `robots: { index: false, … }` and are absent from `INDEXABLE_PATHS`.

### Structured data

`app/components/JsonLd.tsx` renders `<script type="application/ld+json">` on the server. The [Next.js JSON-LD guidance](https://nextjs.org/docs/app/guides/json-ld) pattern is used, with `serializeJsonLd` escaping.

| Where                         | Schema                                |
| ----------------------------- | ------------------------------------- |
| Root layout (every page)      | `WebSite`                             |
| Home (`app/[lang]/page.tsx`)  | `Person`                              |
| CV (`app/[lang]/cv/page.tsx`) | `ProfilePage` + `Person` + `Article`s |
| Article pages                 | `Article`                             |

### Sitemap and robots

- `app/sitemap.ts`: one entry per `INDEXABLE_PATHS` × locale, each with absolute hreflang alternates. `lastModified` is deliberately omitted (build time isn't content-change time).
- `app/robots.ts`: allows everything except a few legacy probe paths, and points at `/sitemap.xml`. `/api/*` stays crawlable because `/llms.txt` advertises the content and profile APIs to agents.

### Open Graph images

- `app/[lang]/opengraph-image.tsx` (home) and `app/[lang]/cv/opengraph-image.tsx` (CV) render locale-aware 1200×630 PNGs via `lib/og-home-image.tsx`. Each receives `params: Promise<{ lang: Locale }>`.
- `app/opengraph-image.tsx` is the default image referenced by `baseMetadata`.
- Image URLs carry `?v=${ogCacheVersion}` (`NEXT_PUBLIC_OG_CACHE_DATE`); bump it to invalidate cached previews.
- "Design Systems" stays in English in both locales as a technical term.

### 404s

Unmatched URLs render `app/global-not-found.tsx`. It returns HTTP 404 with `noindex`, a localized message, and `<html lang>` from the `x-opaso-locale` header set by `proxy.ts` (see ADR-0004).

## Checklist: adding a page

1. Create `app/[lang]/<slug>/page.tsx` with `generateStaticParams` for both locales.
2. Add `content/en/<slug>.md` and `content/es/<slug>.md` with `name`, `title`, `slug` and `description` frontmatter.
3. Export `generateMetadata` that returns `contentPageMetadata(locale, "<slug>")` (or `pageMetadata` for non-markdown pages).
4. If the page should be indexed, add `"/<slug>"` to `INDEXABLE_PATHS`; otherwise pass `robots: { index: false }`.
5. If it needs a schema beyond `WebSite`, render `<JsonLd data={…} />` in the page with a builder from `lib/seo.ts`.
6. Extend `test/unit/sitemap-robots.test.ts` and the page's metadata tests.

## Adding a locale

1. Add it to `locales` in `lib/i18n/locales.ts` and to the `OG_LOCALE` map in `lib/seo.ts`.
2. Add `content/<locale>/*` (including `cv.json`) and `i18n/<locale>/ui.json`.
3. Handle the locale in `lib/og-home-image.tsx`.
4. Routing (`proxy.ts`), alternates, the sitemap and the 404 page pick up the new locale automatically from `locales`.

## Content practices

- One `<h1>` per page and a logical heading hierarchy.
- Descriptive link text, not "click here".
