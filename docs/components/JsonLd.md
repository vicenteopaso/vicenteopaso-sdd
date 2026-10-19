# SeoJsonLd Component

## Overview

A client component that injects structured data (JSON-LD) into the page for SEO purposes. Renders `Website` schema on all pages and `Person` schema on About and CV pages.

**Location:** `app/components/SeoJsonLd.tsx`

**Usage:** Rendered in root layout to provide structured data for search engines

## Props

None - The component uses `usePathname()` to determine which schemas to include.

## Features

### Schema Types

1. **Website Schema** (all pages)
   - Site name, URL, description
   - Alternate names
   - Potential actions (search)

2. **Person Schema** (root/About and CV pages only)
   - Name, job title, description
   - Contact points (email, location)
   - Social media profiles
   - Skills and expertise
   - Affiliations and awards

### Conditional Rendering

```typescript
const pathname = usePathname();
const includePerson = pathname === "/" || pathname === "/cv";
```

Person schema only included on pages where biographical information is relevant.

## Implementation

```tsx
<>
  <Script
    id="website-json-ld"
    type="application/ld+json"
    strategy="afterInteractive"
  >
    {JSON.stringify(getWebsiteJsonLd())}
  </Script>

  {includePerson && (
    <Script
      id="person-json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(getPersonJsonLd())}
    </Script>
  )}
</>
```

### Script Strategy

- **Type**: `application/ld+json` (standard for JSON-LD)
- **Strategy**: `afterInteractive` (loads after page is interactive)
- **Placement**: Rendered in `<head>` via Next.js Script component

## JSON-LD Functions

Defined in `lib/seo.ts`:

### `getWebsiteJsonLd()`

Returns structured data for the website:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Vicente Opaso",
  "url": "https://opa.so",
  "description": "Product & Design System Leader. Building accessible, scalable, and delightful digital experiences. Passionate about design systems, product strategy, and inclusive technology.",
  "inLanguage": "en-US",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://opa.so/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### `getPersonJsonLd()`

Returns structured data for the person:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Vicente Opaso",
  "jobTitle": "Product & Design System Leader",
  "description": "15+ years bridging design and engineering...",
  "url": "https://opa.so",
  "sameAs": [
    "https://github.com/vicenteopaso",
    "https://linkedin.com/in/vicenteopaso",
    "https://x.com/vicenteopaso"
  ],
  "knowsAbout": ["Design Systems", "Product Leadership", ...],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "vicente@opa.so",
    "contactType": "professional"
  }
}
```

## SEO Benefits

### For Search Engines

- **Rich snippets**: Enhanced search results with structured data
- **Knowledge graph**: May appear in Google's knowledge panel
- **Social media**: Better link previews on social platforms
- **Discoverability**: Easier for search engines to understand site content

### Schema Validation

Validate structured data:

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

## Usage

### In Root Layout

```tsx
import { SeoJsonLd } from "./components/SeoJsonLd";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <SeoJsonLd />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Accessibility

No visual UI - purely for SEO and machine-readable structured data.

## Testing

**Test file:** `test/unit/seo-jsonld.test.tsx`

- ✅ Renders Website schema on all pages
- ✅ Renders Person schema on root page (About)
- ✅ Renders Person schema on CV page
- ✅ Does not render Person schema on other pages
- ✅ JSON-LD is valid and parseable

## Performance

- **Load strategy**: `afterInteractive` doesn't block page load
- **Small payload**: Minimal JSON size (few KB)
- **No runtime overhead**: Static JSON rendered once
- **Cached**: Served with page HTML

## Best Practices

1. **Keep data accurate**: Update when site info changes
2. **Validate regularly**: Use Google Rich Results Test
3. **Follow schema.org**: Use standard schema types and properties
4. **Provide complete data**: More context = better SEO
5. **Update social links**: Keep social media profiles current
6. **Test in search console**: Monitor structured data in Google Search Console

## Related Components

None - This is a standalone SEO component.

## Related Documentation

- [SEO Utilities](../../lib/seo.ts)
- [SEO Guide](../SEO_GUIDE.md)
- [Schema.org Person](https://schema.org/Person)
- [Schema.org WebSite](https://schema.org/WebSite)
- [Google Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
