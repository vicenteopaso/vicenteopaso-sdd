# ContrastToggle

Site-wide High Contrast switch in the top navigation. It swaps the deeper default accent reds for the WCAG 2.1 AA palette on every page. This is the control that WCAG technique G174 requires; see [ADR-0003](../adr/0003-high-contrast-mode-conforming-alternate.md).

**File**: `app/components/ContrastToggle.tsx` · **Logic**: `lib/contrast.ts`

## Overview

- [BrutalistNav](./BrutalistNav.md) renders it in the right-hand controls, before the locale and theme toggles.
- It sets `data-contrast="more"` on `<html>`. `styles/globals.css` keys the High Contrast tokens off that attribute.
- It saves an explicit choice to `localStorage` under `contrast` (`"more"` or `"default"`).
- With no saved choice, it follows the OS `prefers-contrast: more` setting, including live changes.
- An inline `<head>` script in `app/layout.tsx` (`contrastInitScript`) applies the preference before first paint, so High Contrast visitors never see the default palette flash.

## Props

None. The label comes from `t("nav.highContrast")` for the current locale.

## States

| State                 | `aria-pressed` | Look                                                   |
| --------------------- | -------------- | ------------------------------------------------------ |
| Off (default palette) | `false`        | Outlined chip, `--v3-fg` border and text               |
| On (High Contrast)    | `true`         | Inverted chip, `--v3-fg` background and `--v3-bg` text |

- The pressed look is driven in CSS by the `<html>` attribute, not React state, so it's already correct before hydration.
- Below 480px the label is visually hidden and the chip becomes a 24×24 icon button, so the nav still reflows at 320px. The label remains the button's accessible name.

## Accessibility

- It's a native `<button type="button">` with `aria-pressed`. It's keyboard operable (Tab, then Enter or Space) and announced as a toggle button.
- The accessible name is the visible label: "High contrast" in English, "Alto contraste" in Spanish. It doesn't change with state. The 14px `ContrastIcon` (an inline SVG from `icons.tsx`) is `aria-hidden`.
- Text contrast is about 18:1 in both states and both themes. Focus shows a 2px `--v3-fg` outline.
- The target is at least 24×24 (WCAG 2.2 SC 2.5.8).
- Under `forced-colors: active`, the pressed state uses `Highlight` and `HighlightText`, so it survives Windows contrast themes.

## Design Tokens

High Contrast overrides in `styles/globals.css`:

| Token                              | Light default | Light High Contrast | Dark default  | Dark High Contrast |
| ---------------------------------- | ------------- | ------------------- | ------------- | ------------------ |
| `--v3-accent` / `--v3-accent-text` | `#9b1219`     | `#b91c1c`           | `#b3141c`     | `#e13232`          |
| `--v3-on-accent`                   | `--v3-bg`     | `--v3-bg`           | `--v3-fg`     | `--v3-bg`          |
| `--v3-muted`                       | `#6b6760`     | `#6b6760`           | `#8a847a`     | `#aaa398`          |
| `--v3-accent-inverse`              | `#b91c1c`     | `#b91c1c`           | `--v3-accent` | `--v3-accent`      |

`--v3-accent-inverse` colors the red headings on inverted blocks (`background: var(--v3-fg)`). In the light theme those blocks are near-black, where the deep default red would be only 2.3:1.

## Usage

```tsx
import { ContrastToggle } from "./ContrastToggle";

<ContrastToggle />;
```

## Testing

- **Unit**: `test/unit/contrast-toggle.test.tsx` covers the English and Spanish labels, `aria-pressed`, persistence, following OS changes, listener cleanup and storage failures. `test/unit/contrast.test.ts` covers the preference logic and the inline script.
- **E2E**: `test/e2e/high-contrast.spec.ts`
- **Accessibility**: `test/a11y/axe.spec.ts` asserts that the toggle is on every page and passes axe in every presentation.
- **Visual**: `test/visual/components/contrast-toggle.visual.spec.ts` captures the header in both themes, with the toggle off and on, plus mobile.
