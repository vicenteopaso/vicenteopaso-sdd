# ADR-0003: High Contrast Mode as the Conforming Alternate for Deeper Default Reds

**Status**: Proposed

**Date**: 2026-09-11

**Deciders**: Vicente Opaso (owner)

**Technical Context**: Design system, accessibility conformance, CI accessibility gates

---

## Context and Problem Statement

The v3 brutalist design uses a single accent red. In the dark theme it was pinned at `#e13232`, the deepest red that still meets 4.5:1 for small text on the pure-black background (4.7:1). The owner wants a deeper, bloodier red in both themes. In the light theme a deeper red raises contrast. In the dark theme any noticeably deeper red drops small red text below 4.5:1. On its own, that would break WCAG 2.1 SC 1.4.3 and CONSTITUTION-09 ("Accessibility MUST NOT regress (WCAG 2.1 AA minimum)").

## Decision Drivers

- Brand: the owner judged a deeper red a better fit for the brutalist theme.
- CONSTITUTION-09: WCAG 2.1 AA conformance must hold.
- WCAG technique G174 is a W3C sufficient technique for SC 1.4.3. A page may use lower contrast if a control that meets contrast itself switches to a presentation that does.
- The conforming palette must be reachable from every page, by keyboard and assistive technology, and the choice must persist.
- Visitors who chose High Contrast must never see the low-contrast palette flash.

## Considered Options

- **Option 1**: Keep `#e13232` in the dark theme (status quo).
- **Option 2**: Split tokens: deeper red for large text and fills, `#e13232` for small text.
- **Option 3**: Deeper default reds, plus a High Contrast toggle that serves the WCAG AA palette (G174).
- **Option 4**: Deeper default reds, with High Contrast only through the OS `prefers-contrast: more` setting.

## Decision Outcome

**Chosen option**: Option 3. It's the only option that delivers the deeper red in both themes and keeps WCAG 2.1 AA conformance, through a documented W3C technique.

- **Default accents**: light `#9b1219` (7.9:1 on `--v3-bg`), dark `#b3141c` (3.0:1). The dark red meets 3:1 for large text and UI accents but not 4.5:1 for small text.
- **High Contrast palette** (`<html data-contrast="more">`): light `#b91c1c` (6.1:1) and dark `#e13232` (4.7:1), the pre-change accents. The dark theme also gets a lighter `--v3-muted`: `#aaa398`, 8.4:1 on `--v3-bg` and 7.1:1 on `--v3-elevated`.
- **`--v3-on-accent`**: filled buttons use cream text on the deep dark red (6.2:1) and black text on `#e13232` (4.7:1). Primary buttons meet AA in both palettes.
- **`--v3-accent-inverse`**: in the light theme, the near-black inverted blocks (the TL;DR heading and the CV closing headline) keep `#b91c1c` for their red text, at 3.0:1. The deep red would be 2.3:1 there, below the 3:1 large-text floor. On the dark theme's cream inverted blocks the accent itself is used: 6.2:1 by default, 4.0:1 in High Contrast. The light default palette therefore meets AA everywhere.
- **`ContrastToggle`**: a native `<button aria-pressed>` in the top navigation on every page. Its text is `--v3-fg` on `--v3-bg`, about 18:1, in every presentation.
- **Persistence**: the choice is stored in `localStorage` (`contrast`). With no stored choice, `prefers-contrast: more` turns High Contrast on. An inline `<head>` script applies the preference before first paint.

### Consequences

#### Positive

- The owner's deeper reds are the default in both themes.
- WCAG 2.1 AA conformance holds through G174. Visitors whose OS asks for more contrast get the conforming palette without doing anything.
- Primary buttons now pass AA in the default dark palette: cream on deep red, 6.2:1, where they used black on `#e13232`, 4.7:1. In the dark High Contrast palette, muted text reaches AAA.

#### Negative

- In the default dark palette, small red text is 3.0:1. That covers section numbers, meta labels and form error text. Low-vision visitors who don't set the OS preference must find and press the toggle.
- The axe gate no longer checks color contrast on the default dark presentation (see Validation).
- Lighthouse audits the default (dark) view, so its `color-contrast` audit is expected to fail there and the accessibility score to drop. `lighthouserc.js` keeps both at warning level.
- In the light theme, High Contrast serves `#b91c1c` (6.1:1), below the new default's 7.9:1. Both pass AA. In the light theme the toggle restores the previous palette rather than maximizing contrast.
- There's one more inline `<head>` script, which the existing CSP (`script-src 'unsafe-inline'`) already allows.

#### Neutral

- Legacy tokens (`--accent`, `--link`) are unchanged. Only superseded components use them.

## Validation

- `test/a11y/axe.spec.ts` scans every route and locale in four presentations: light, dark, light High Contrast and dark High Contrast. Every rule runs everywhere except `color-contrast` on the default dark presentation. Dark High Contrast shares every non-accent token with the default, except the lighter muted grey, so other contrast regressions still fail.
- On every page and in every presentation, the same spec asserts that the toggle is visible, reports `aria-pressed` and passes axe itself, contrast included. These are G174's three test procedures.
- `test/e2e/high-contrast.spec.ts` covers:
  - keyboard activation
  - persistence across client-side navigation and reload
  - following the OS preference
  - applying the preference before hydration
  - the Spanish label
  - the 24px target at 320px
- `test/unit/contrast.test.ts` keeps the inline script in step with `resolveContrastPreference()`.

## Pros and Cons of the Options

### Option 1: Keep `#e13232`

**Pros**: AA by default. No new mechanism.

**Cons**: Doesn't deliver the requested look.

### Option 2: Split text and fill reds

**Pros**: AA by default. Headlines and buttons get the deeper red.

**Cons**: Two visibly different reds in one view, after the design was deliberately consolidated to one. Small red labels stay bright.

### Option 3: Deeper default plus High Contrast toggle (chosen)

**Pros**: Delivers the look. AA through G174. Better than the status quo for visitors with an OS contrast setting.

**Cons**: Small red text in the default dark palette is below 4.5:1. It depends on visitors finding the toggle. Lighthouse will warn on contrast.

### Option 4: OS setting only

**Pros**: No UI change.

**Cons**: Not G174. Visitors without the OS setting can't reach the conforming presentation, so the default simply fails SC 1.4.3.

## References

- [WCAG 2.1 Technique G174](https://www.w3.org/WAI/WCAG21/Techniques/general/G174)
- [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Understanding Conformance: conforming alternate versions](https://www.w3.org/WAI/WCAG21/Understanding/conformance#conforming-alt-versions)
- [Constitution](../CONSTITUTION.md) (CONSTITUTION-09)
- Implementation: `lib/contrast.ts`, `app/components/ContrastToggle.tsx`, `styles/globals.css`

---

## Notes

The High Contrast accents are the exact pre-change values. Reverting the default is a two-token change in `styles/globals.css`.
