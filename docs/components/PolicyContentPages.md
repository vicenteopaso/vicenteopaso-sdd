# Policy Content Pages

## Overview

Cookie Policy, Privacy Policy, and Tech Stack are now rendered as standalone pages (e.g., `/[lang]/cookie-policy`) and linked directly from the site footer. These pages are rendered from markdown content and do not use modals.

## Related Files

- Footer links: see `app/components/BrutalistFooter.tsx`
- Policy pages: see `app/[lang]/cookie-policy/page.tsx`, etc.
- Content API: see `app/api/content/[[...parts]]/route.ts`

## Testing

- Policy pages are tested in `test/e2e/policies-and-a11y.spec.ts`.

## See Also

- [BrutalistFooter](./BrutalistFooter.md)
- [Markdown Components](../../lib/markdown-components.tsx)
