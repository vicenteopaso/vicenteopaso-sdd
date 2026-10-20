# JsonLd Component

## Overview

A server component that renders structured data as `<script type="application/ld+json">` in the prerendered HTML, so crawlers see it without running JavaScript.

**Location:** `app/components/JsonLd.tsx`

## Props

| Prop   | Type      | Description                                                  |
| ------ | --------- | ------------------------------------------------------------ |
| `data` | `unknown` | A JSON-LD object, usually built by a helper in `lib/seo.ts`. |

## Usage

```tsx
import { JsonLd } from "@/app/components/JsonLd";
import { loadCv } from "@/lib/cv";
import { getPersonJsonLd } from "@/lib/seo";

<JsonLd data={getPersonJsonLd(locale, loadCv(locale))} />;
```

| Rendered in                          | Data                          |
| ------------------------------------ | ----------------------------- |
| `app/[lang]/layout.tsx` (every page) | `getWebsiteJsonLd(locale)`    |
| `app/[lang]/page.tsx`                | `getPersonJsonLd(locale, cv)` |
| `app/[lang]/cv/page.tsx`             | `getCvPageJsonLd(locale, cv)` |
| `app/[lang]/articles/*/page.tsx`     | `getArticleJsonLd(...)`       |

## Security

The payload goes through `serializeJsonLd`, which escapes `<` as the JSON unicode escape `\u003c`. A string containing `</script>` therefore cannot end the tag early, and `dangerouslySetInnerHTML` is safe here. `test/unit/seo.test.ts` covers this.

## Testing

- `test/unit/seo.test.ts`: every builder, plus the escaping.
- `test/unit/layout.test.tsx`, `test/unit/cv-page.test.tsx`, `test/unit/agent-job-search-article-page.test.tsx`: the script is present in rendered output with the expected `@type` and URL.

See [SEO Guide](../SEO_GUIDE.md) for the full structured-data map.
