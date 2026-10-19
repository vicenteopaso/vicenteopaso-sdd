# Component Visual Regression Tests

This directory contains visual regression tests for individual UI components. Tests are organized by component and test each component in multiple themes and viewports.

## Test Files

| File                                  | Section under test                           | Tests                                      |
| ------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| `navigation.visual.spec.ts`           | `BrutalistNav` main navigation               | Light, dark, mobile, CV active state       |
| `contrast-toggle.visual.spec.ts`      | Header with High Contrast toggle             | Light/dark × default/High Contrast, mobile |
| `hero-and-cv-masthead.visual.spec.ts` | Home hero (`.v3-hero-section`), CV masthead  | Light, dark, mobile                        |
| `impact-strip.visual.spec.ts`         | Home impact strip (`.v3-impact-grid`)        | Light, dark, mobile, single cell           |
| `cv-references.visual.spec.ts`        | CV references grid (`CvRefCard`)             | Light, dark, mobile, single card           |
| `contact-section.visual.spec.ts`      | Home `#contact` section with `V3ContactForm` | Light, dark, mobile                        |
| `footer.visual.spec.ts`               | `BrutalistFooter`                            | Light, dark, mobile, CV page               |

## Running Tests

```bash
# Run all component visual tests
pnpm playwright test test/visual/components

# Run a specific component test
pnpm playwright test test/visual/components/navigation.visual.spec.ts

# Update baselines after intentional changes
pnpm playwright test test/visual/components --update-snapshots
```

## Patterns

All component tests follow these patterns:

1. **Page-specific wait helpers**: Use `waitForHomepage()` or `waitForCVPage()` from `../utils.ts`
2. **Shared low-level utilities**: Use `waitForStableHeight()` for custom scenarios
3. **Theme testing**: Each component is tested in light mode, dark mode, and mobile viewport
4. **Masking dynamic content**: Use masks for randomly selected content (e.g., portrait images)

## Snapshot Naming Convention

Snapshots follow the pattern: `{section}-{variant}-{theme/viewport}-{platform}.png`

Examples:

- `navigation-light-linux.png`
- `hero-dark-linux.png`
- `contact-section-mobile-linux.png`

## Adding New Component Tests

1. Create a new file: `{component-name}.visual.spec.ts`
2. Import utilities from `../utils.ts`
3. Test at least:
   - Light mode (default viewport)
   - Dark mode (default viewport)
   - Mobile viewport (375×667px)
4. Run with `--update-snapshots` to generate baselines
5. Review baselines visually before committing
