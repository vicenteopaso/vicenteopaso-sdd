# Accessibility Tests

Playwright-based accessibility audits for the portfolio site. These run against the
built app (via the `webServer` config in `playwright.config.ts`), same as `test/e2e`
and `test/visual`.

## Structure

```
test/a11y/
├── axe.spec.ts         # Full axe-core WCAG 2.1 A/AA scan
└── typography.spec.ts  # Font size, reflow, and text-spacing checks axe doesn't cover
```

## What's covered

### `axe.spec.ts`

Runs a full [`axe-core`](https://github.com/dequelabs/axe-core) scan (via
`@axe-core/playwright`) tagged to `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` — the
conformance level published on the site's own
[Accessibility Statement](../../content/en/accessibility.md). This covers color
contrast plus the rest of axe's rule set: ARIA usage, form labels, heading order,
landmark uniqueness, link/button accessible names, and more.

Runs across every route × both locales (`en`, `es`) × both themes (light, dark) —
28 scans total. Dark-mode-specific contrast regressions (a common miss when only
testing the default theme) are caught here.

### `typography.spec.ts`

Checks axe doesn't perform, since WCAG mostly leaves exact typography values
unspecified:

- **Readability advisories** (logged as warnings, non-blocking): text under the
  12px legibility floor, body text under 16px, line-height under 1.5× font-size
  (WCAG 1.4.8 is AAA, not a hard AA requirement), and font-weight under 400 on
  text smaller than 14px. All advisory-only — this site's "brutalist" design
  intentionally uses small mono labels/meta text (down to ~9px) in places, so a
  hard font-size gate would fight the design rather than catch a bug. Read the
  test output if you're touching typography; nothing here fails CI.
- **Reflow at 320px width** (hard fail): WCAG 1.4.10 (AA) — content must reflow to a
  single column without horizontal scrolling at mobile viewport widths.
- **Text-spacing override** (hard fail): WCAG 1.4.12 (AA) — injects the standard
  override stylesheet (line-height 1.5, paragraph spacing 2×, letter-spacing
  0.12em, word-spacing 0.16em) and asserts nothing clips or overflows
  horizontally.

## Running

```bash
# Run everything
pnpm test:a11y

# Run one file
pnpm test:a11y -- test/a11y/axe.spec.ts

# Debug a specific failure
pnpm exec playwright test test/a11y/axe.spec.ts -g "cv (en, dark)" --debug
```

On failure, `axe.spec.ts` prints the rule ID, impact level, help URL, and the
offending element selector(s) — enough to reproduce and fix without re-running.

## Adding a new route

Add an entry to the shared `ROUTES` array in both `axe.spec.ts` and
`typography.spec.ts` — it'll automatically be covered by every locale/theme
combination.

## Relationship to `scripts/audit-a11y.mjs`

`scripts/audit-a11y.mjs` (run via `pnpm audit:a11y` in
`.github/workflows/accessibility.yml`) is a fast, static, no-build heuristic that
only checks for missing `alt` props on `next/image` usages. It's a quick pre-build
gate. This suite is the deep, dynamic check against real rendered pages and runs as
part of the `Build & Verify` CI job, which already builds and starts the app for
`test:e2e`/`test:visual`.
