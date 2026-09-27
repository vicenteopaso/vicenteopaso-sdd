# BrutalistNav

Primary site navigation for the v3 brutalist redesign. Renders as a sticky `<header>` containing the wordmark, primary nav links, High Contrast toggle, locale toggle, and theme toggle.

**File**: `app/components/BrutalistNav.tsx`

## Behaviour

- Links use `next/link` for client-side navigation and prefetching
- `isActive()` highlights the current route; hash-only links (e.g. `#contact`) are never marked active
- High Contrast toggle ([ContrastToggle](./ContrastToggle.md)) switches every page to the WCAG AA palette; see [ADR-0003](../adr/0003-high-contrast-mode-conforming-alternate.md)
- Locale toggle switches between `en` and `es` by replacing the locale prefix in `pathname`
- Theme toggle cycles light ↔ dark via `next-themes`; icon is suppressed until mounted to avoid hydration flash
- `aria-label="Main navigation"` on the `<nav>` element

## Props

None — reads locale from `LocaleProvider` and pathname from `usePathname()`.

## Nav Links

| Label key     | `href`               |
| ------------- | -------------------- |
| `nav.about`   | `/${locale}`         |
| `nav.cv`      | `/${locale}/cv`      |
| `nav.contact` | `/${locale}#contact` |

## Accessibility

- `<nav aria-label="Main navigation">` wraps primary links
- High Contrast toggle: native button with `aria-pressed`, named by its visible label `t("nav.highContrast")`
- Locale toggle: `aria-label={t("nav.switchLanguage")}`
- Theme toggle: `aria-label={t("nav.themeToggle")}`

## Visual Testing

- `test/visual/components/navigation.visual.spec.ts`: light, dark, mobile, and CV active-state variants
- `test/visual/components/contrast-toggle.visual.spec.ts`: the full header in both themes with High Contrast off and on, plus mobile
