# Icon Components

## Overview

SVG icon components used by the UI. Icons are decorative (`aria-hidden="true"`), inherit color via `currentColor`, and forward any SVG props (`className`, `data-*`, …).

**Location:** `app/components/icons.tsx`

## Components

### ContrastIcon

Half-filled circle used by the High Contrast toggle ([ContrastToggle](./ContrastToggle.md)).

```tsx
<ContrastIcon className="v3-contrast-toggle-icon" />
```

## Accessibility

Icons never carry meaning on their own: they are always `aria-hidden="true"`, and the control that renders them provides the accessible name (visible text or `aria-label`).

## Adding an icon

1. Add a named export to `app/components/icons.tsx` that accepts `IconProps` and spreads them onto the `<svg>`.
2. Keep `viewBox="0 0 24 24"`, `aria-hidden="true"` and `currentColor` fills/strokes.
3. Add a test case to `test/unit/icons.test.tsx`.
4. Only add icons that a component actually renders — unused exports fail the `pnpm deadcode` check.

## Testing

`test/unit/icons.test.tsx` asserts the SVG `viewBox`, `aria-hidden`, and prop forwarding.
