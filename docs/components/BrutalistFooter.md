# BrutalistFooter

Primary site footer for the v3 brutalist redesign. Renders the site wordmark, policy links, and copyright line.

**File**: `app/components/BrutalistFooter.tsx`

## Behaviour

- Policy links use `next/link` with locale-prefixed hrefs (e.g. `/${locale}/privacy-policy`) so navigation stays client-side and avoids redirect through the locale proxy
- Links are i18n-driven via `t("footer.*")` keys

## Props

None — reads locale from `LocaleProvider`.

## Footer Links

| Label key                    | Route                             |
| ---------------------------- | --------------------------------- |
| `footer.privacyPolicy`       | `/${locale}/privacy-policy`       |
| `footer.cookiePolicy`        | `/${locale}/cookie-policy`        |
| `footer.accessibility`       | `/${locale}/accessibility`        |
| `footer.technicalGovernance` | `/${locale}/technical-governance` |
| `footer.techStack`           | `/${locale}/tech-stack`           |

## Accessibility

All policy links are standard `<Link>` anchors with descriptive text.

The heart at the end of the tagline is rendered apart from the translated string, as `<span class="v3-footer-heart" role="img" aria-label={t("footer.heartLabel")}>` ("love" / "amor"). It uses the text-presentation glyph `❤︎` (U+2764 U+FE0E) so it takes `--v3-accent` instead of the platform emoji colour, and is set at 14px against the 10px tagline. `--v3-accent` meets 3:1 on `--v3-bg` in every theme and contrast mode (SC 1.4.11).

## Visual Testing

Covered by `test/visual/components/footer.visual.spec.ts` — light, dark, mobile, and CV page variants.
