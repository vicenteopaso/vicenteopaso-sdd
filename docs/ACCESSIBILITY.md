# Accessibility Guidelines

This project targets **WCAG 2.1 AA** compliance as a minimum standard.

## Core Principles (POUR)

1. **Perceivable**: Content available to all senses
2. **Operable**: Interface works with keyboard and assistive tech
3. **Understandable**: Content and operation are clear
4. **Robust**: Works across browsers and assistive technologies

## Requirements

### Semantic HTML

- Use semantic elements: `header`, `main`, `nav`, `footer`, `article`, `section`
- Maintain correct heading hierarchy (h1 → h2 → h3, no skips)
- Use `button` for actions, `a` for navigation
- Use lists (`ul`, `ol`) for list content

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order following visual layout
- Visible focus indicators (never `outline: none` without alternative)
- No keyboard traps
- Skip links for main content

### Color & Contrast

- Body text: ≥ 4.5:1 contrast ratio
- Large text (18px+ or 14px+ bold): ≥ 3:1 contrast ratio
- UI components: ≥ 3:1 contrast ratio
- Never rely on color alone to convey information

### Images

- Decorative images: `alt=""`
- Informative images: Descriptive alt text
- Complex images: Extended description via `aria-describedby`
- Use Next.js `Image` component for optimization

### Forms

- Labels associated with inputs (`htmlFor` or wrapping)
- Error messages linked to inputs
- Clear validation feedback
- Accessible placeholders (not as label replacement)

### ARIA

- Use only when native HTML is insufficient
- Prefer semantic HTML over ARIA
- Common patterns:
  - `aria-label` for icon buttons
  - `aria-expanded` for expandable content
  - `aria-live` for dynamic content
  - `role="dialog"` with proper focus management

## Implementation

### Components

All UI components in `app/components/` must:

- Support keyboard interaction
- Have appropriate ARIA attributes
- Maintain focus correctly
- Work with screen readers

### Testing

**Automated:**

- `pnpm lint` includes `eslint-plugin-jsx-a11y`
- `scripts/audit-a11y.mjs` checks image alt text (fast, no build required — runs in `.github/workflows/accessibility.yml`)
- `pnpm test:a11y` (`test/a11y/`) runs against the built app in CI's Build & Verify job:
  - `axe.spec.ts`: full `axe-core` scan tagged to WCAG 2.1 A/AA (contrast, ARIA, labels, heading order, landmarks, link names, etc.) across every route, both locales, and both themes
  - `typography.spec.ts`: reflow at 320px width (WCAG 1.4.10) and the WCAG 1.4.12 text-spacing override check are hard gates; font size, line-height, and font-weight are advisory (non-blocking) warnings, since the site's design intentionally uses small mono labels/meta text in places
- Lighthouse accessibility score ≥ 90

**Manual (required for PRs):**

- Keyboard-only navigation test
- Screen reader testing (VoiceOver/NVDA)
- Color contrast verification
- Focus management verification

### Tools

- ESLint: `eslint-plugin-jsx-a11y` (enforced)
- Lighthouse: Accessibility audits
- axe DevTools: Browser extension
- WAVE: Web accessibility evaluator

## Forbidden Patterns

Never:

- Remove or hide focus indicators
- Use `tabindex > 0`
- Create keyboard traps
- Use non-semantic elements for interactive content
- Skip heading levels
- Use color alone for information
- Remove alt text from informative images

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Compliance Statement

This site aims to conform to WCAG 2.1 Level AA. The accessibility statement is published at `/en/accessibility`.
