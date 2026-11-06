# Testing Guide

Comprehensive testing documentation for the portfolio site.

## Table of Contents

- [Overview](#overview)
- [AI Guardrails](#ai-guardrails)
- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The project uses a multi-layered testing approach:

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Visual Regression**: Playwright screenshots
- **Type Safety**: TypeScript + `tsc --noEmit`
- **Linting**: ESLint with security plugins
- **Accessibility**: Automated a11y audits

### Testing Stack

| Layer             | Tool                   | Purpose                            |
| ----------------- | ---------------------- | ---------------------------------- |
| Unit              | Vitest                 | Component logic, utilities         |
| Integration       | React Testing Library  | Component rendering, user behavior |
| E2E               | Playwright             | Full user flows, cross-page        |
| Visual Regression | Playwright screenshots | UI appearance, theme consistency   |
| Type Checking     | TypeScript             | Type safety, interface contracts   |
| Accessibility     | Custom audit script    | WCAG compliance, alt text          |
| Security          | ESLint security plugin | Common vulnerabilities             |
| Performance       | Lighthouse CI          | Core Web Vitals, accessibility     |

## AI Guardrails

This project enforces **AI Guardrails** in CI to ensure code quality and prevent regressions.

### Test Coverage Requirements

**Automated Check**: `scripts/check-pr-tests.mjs`

All changes to code files in `app/` or `lib/` **must** include corresponding test changes in:

- `test/unit/` (unit tests)
- `test/e2e/` (end-to-end tests)
- `test/visual/` (visual regression tests)

**CI Enforcement**: The `test-coverage-check` job in `.github/workflows/ci.yml` runs this verification on every PR and will fail if:

- Code files are modified without test updates
- New features lack test coverage
- Bug fixes don't include regression tests

**Bypass**: This check is skipped for documentation-only or configuration-only changes (files not in `app/` or `lib/`).

### Required Quality Checks

All PRs must pass:

- ✅ Lint (`pnpm lint`)
- ✅ Typecheck (`pnpm typecheck`)
- ✅ Unit tests (`pnpm test`)
- ✅ E2E tests (`pnpm test:e2e`)
- ✅ Visual regression tests (`pnpm test:visual`)

### PR Template Compliance

The PR template includes mandatory checkboxes for:

- **Accessibility**: Keyboard navigation, ARIA, focus management
- **SEO**: Metadata updates, content changes
- **Security**: Input validation, XSS prevention
- **Error Handling**: Graceful degradation, user-friendly messages

### Architecture Changes

PRs labeled `architecture-change` **must** link to an Architecture Decision Record (ADR) in `docs/adr/`. See [ADR Documentation](../adr/README.md) for guidelines.

**Example ADR**: [ADR-0001: Implement AI Guardrails](../adr/0001-implement-ai-guardrails.md)

## Testing Philosophy

### Goals

1. **High confidence**: Catch regressions before production
2. **Fast feedback**: Tests run quickly in development
3. **Clear failures**: Test failures are easy to diagnose
4. **Maintainable**: Tests don't break with refactoring
5. **Comprehensive**: Critical paths are well-covered

### Coverage Targets

- **Unit/Integration**: >90% statement coverage
- **E2E**: All critical user journeys
- **Visual**: All pages, key component variants
- **Accessibility**: 100% of images have alt text

### Testing Pyramid

```
    /\
   /  \  E2E (Playwright)       - Critical flows
  /____\ Integration (RTL)      - Component interactions
 /______\ Unit (Vitest)         - Logic, utilities, edge cases
```

We write **more unit tests**, **some integration tests**, and **fewer E2E tests** to balance speed and confidence.

## Test Types

### 1. Unit Tests

**Location**: `test/unit/`

**Purpose**: Test individual functions, utilities, and isolated component logic

**Example**:

```typescript
// test/unit/seo.test.ts
import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "../../lib/seo";

describe("serializeJsonLd", () => {
  it("escapes < so the payload can't close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)" });
    expect(out).not.toContain("<");
  });

  it("round-trips the original data", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)" });
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)");
  });
});
```

**When to write**:

- Pure functions
- Utility libraries
- Data transformations
- Edge cases and error handling

### 2. Component Tests

**Location**: `test/unit/`

**Purpose**: Test component rendering, props, and user interactions

**Example**:

```typescript
// test/unit/profile-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '@/app/components/ProfileCard';

describe('ProfileCard', () => {
  it('renders name and tagline', () => {
    render(
      <ProfileCard
        name="John Doe"
        tagline="Software Engineer"
        initials="JD"
      />
    );

    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('shows avatar when showAvatar is true', () => {
    render(
      <ProfileCard
        name="John Doe"
        tagline="Software Engineer"
        initials="JD"
        showAvatar={true}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
```

**When to write**:

- Component render logic
- Prop variations
- Conditional rendering
- Basic user interactions (clicks, inputs)

### 3. E2E Tests

**Location**: `test/e2e/`

**Purpose**: Test complete user flows across multiple pages

**Example**:

```typescript
// test/e2e/contact-flow.spec.ts
import { test, expect } from "@playwright/test";

test("user can submit contact form", async ({ page }) => {
  // Navigate to root page (About page)
  await page.goto("/");

  // Open contact dialog
  await page.click("text=Contact me");
  await expect(page.locator("role=dialog")).toBeVisible();

  // Fill form
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="message"]', "Hello, I would like to connect.");

  // Complete Turnstile (mocked in test)
  await page.click('[data-testid="turnstile-mock"]');

  // Submit
  await page.click('button:has-text("Send message")');

  // Verify success
  await expect(page.locator("text=Message sent")).toBeVisible();
});
```

**When to write**:

- Critical user journeys (contact, CV download)
- Multi-page workflows
- Navigation flows
- Form submissions

### 4. Visual Regression Tests

**Location**: `test/visual/` (tests), `test/visual/utils.ts` (shared utilities)

**Purpose**: Catch unintended UI changes with deterministic, stable screenshots

#### Shared Utilities (`test/visual/utils.ts`)

Always use shared utilities instead of inline waits:

**Page-Specific Wait Helpers** (recommended for all tests):

- **`waitForHomepage(page)`**: Waits for homepage to be fully loaded (network idle, fonts, portrait, ImpactCards, footer, stable height, frozen carousels)
- **`waitForCVPage(page)`**: Waits for CV page to be fully loaded (network idle, fonts, h1, references section, footer, stable height)

**Low-Level Utilities** (for custom pages or component tests):

- **`waitForStableHeight(page, consecutive?, intervalMs?)`**: Waits until `document.body.scrollHeight` remains stable for N consecutive checks (default: 3 checks × 100ms)
- **`freezeCarouselInteractions(page, selector)`**: Disables `pointer-events` on all buttons within selector to prevent user-driven carousel changes
- **`waitForStableTransform(page, selector, consecutive?, intervalMs?)`**: Waits for CSS transform to stabilize
- **`homepageMasks(page)`**: Returns `[portrait img, impact-cards]` locators for masking dynamic homepage elements
- **`cvPageMasks(page)`**: Returns `[#cv-references section]` locator for masking dynamic CV elements

#### Handling Dynamic Content

This site has dynamic content that requires masking:

- **ProfileCard**: `Math.random()` selects from 3 portrait images on mount
- **ImpactCards**: Auto-rotates cards every 7s with random selection
- **CvRefsGrid**: Static references grid (replaced auto-rotating carousel in v3)

**Solution**: Use Playwright's `mask` option with shared utilities:

**Example**:

```typescript
// test/visual/pages/home.visual.spec.ts
import { test, expect } from "@playwright/test";
import { waitForHomepage, homepageMasks } from "../utils";

test("homepage renders correctly in light mode", async ({ page }) => {
  await page.goto("/");
  await waitForHomepage(page); // Handles all setup: networkidle, fonts, elements, stability

  await expect(page).toHaveScreenshot("homepage-light.png", {
    fullPage: true,
    animations: "disabled",
    mask: await homepageMasks(page), // Excludes portrait + ImpactCards
  });
});

test("homepage renders correctly in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await waitForHomepage(page);

  await expect(page).toHaveScreenshot("homepage-dark.png", {
    fullPage: true,
    animations: "disabled",
    mask: await homepageMasks(page),
  });
});

test("homepage renders correctly on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await waitForHomepage(page);

  await expect(page).toHaveScreenshot("homepage-mobile.png", {
    fullPage: true,
    animations: "disabled",
    mask: await homepageMasks(page),
  });
});
```

**When to write**:

- Critical pages (Home/root `/`, CV `/cv`) - test in light mode, dark mode, and mobile viewport
- Component visual variations
- Theme switching
- Responsive breakpoints (especially mobile 375×667px)

See [Visual Regression Testing Guide](./VISUAL_REGRESSION_TESTING.md) for detailed documentation.

## Running Tests

### Quick Reference

```bash
# Unit & integration tests
pnpm test                    # Run once
pnpm test:watch              # Watch mode
pnpm coverage                # With coverage report

# E2E tests
pnpm test:e2e                # Run all E2E tests
pnpm test:e2e:ui             # Interactive UI mode
pnpm test:e2e -- --headed    # Headed mode (see browser)

# Visual regression tests
pnpm test:visual             # Run visual tests
pnpm test:visual:update      # Update baselines

# Type checking
pnpm typecheck               # Run TypeScript compiler

# All quality checks
pnpm partial:local           # Build, lint, format, validate:links, coverage, test:e2e, test:visual, typecheck, audit:a11y, audit:security:fix
pnpm full:local              # Clean install + all checks
```

### Detailed Commands

#### Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode (re-run on file changes)
pnpm test:watch

# Run specific test file
pnpm test test/unit/profile-card.test.tsx

# Run tests matching pattern
pnpm test -- --grep "ProfileCard"

# Generate coverage report
pnpm coverage

# View coverage report
open coverage/unit/lcov-report/index.html
```

#### E2E Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e test/e2e/contact-flow.spec.ts

# Run in headed mode (see browser)
pnpm test:e2e -- --headed

# Debug mode
pnpm test:e2e -- --debug

# View HTML report
pnpm playwright show-report
```

#### Visual Regression Tests

```bash
# Run all visual tests
pnpm test:visual

# Update all baselines (after intentional changes)
pnpm test:visual:update

# Update specific baseline
pnpm test:visual -- test/visual/pages/home.visual.spec.ts --update-snapshots

# View diff report
pnpm playwright show-report
```

#### Combined Checks

```bash
# Build + all checks (fast)
pnpm partial:local

# Clean install + all checks (comprehensive)
pnpm full:local
```

## Writing Tests

### When to Add Tests

**Required for all code changes** to maintain coverage thresholds:

#### New UI Components

1. **Unit tests**: Component rendering, props, conditional logic
2. **Visual tests**: Light/dark mode, mobile/desktop viewports
3. **E2E tests** (if interactive): User flows, form submissions, navigation

**Example**: Adding a new `FeatureCard` component

```bash
# 1. Create component
touch app/components/FeatureCard.tsx

# 2. Write unit tests
touch test/unit/feature-card.test.tsx

# 3. Add visual regression tests (if applicable)
touch test/visual/components/feature-card.visual.spec.ts

# 4. Run tests locally
pnpm test test/unit/feature-card.test.tsx
pnpm coverage  # Verify coverage thresholds
pnpm test:visual test/visual/components/feature-card.visual.spec.ts
```

#### New Business Logic

1. **Unit tests**: All functions, edge cases, error handling
2. **E2E tests**: If logic affects user-visible behavior

**Example**: Adding a new utility function

```bash
# 1. Create utility
touch lib/format-date.ts

# 2. Write comprehensive unit tests
touch test/unit/format-date.test.ts

# 3. Test edge cases
# - Valid inputs
# - Invalid inputs
# - Boundary conditions
# - Error handling

# 4. Verify coverage
pnpm coverage
```

#### Changing Existing Code

When modifying existing code:

1. **Run existing tests**: `pnpm test` - ensure they still pass
2. **Update tests**: If behavior changes, update test expectations
3. **Add missing coverage**: If coverage drops, add tests for new branches
4. **Visual regression**: Update baselines with `pnpm test:visual:update` if UI changes are intentional

### Unit Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  it('renders correctly', () => {
    // Arrange
    render(<ComponentName prop="value" />);

    // Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    // Arrange
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);

    // Act
    await fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("completes user flow", async ({ page }) => {
    // Navigate
    await page.click("text=Link text");
    await expect(page).toHaveURL("/expected-url");

    // Interact
    await page.fill('[name="field"]', "value");
    await page.click('button:has-text("Submit")');

    // Verify
    await expect(page.locator("text=Success")).toBeVisible();
  });
});
```

### Visual Test Template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Component Visual Regression", () => {
  test("renders in light mode", async ({ page }) => {
    await page.goto("/page");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("component-light.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("renders in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/page");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("component-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
```

## Test Coverage

### Coverage Enforcement

**Coverage thresholds are enforced in CI** and will fail the build if not met. This ensures every change maintains high test coverage and prevents regressions.

#### Enforced Thresholds

The following minimum coverage thresholds are configured in `vitest.config.ts` and enforced in CI:

| Category   | Minimum |
| ---------- | ------- |
| Lines      | 90%     |
| Statements | 90%     |
| Branches   | 90%     |
| Functions  | 90%     |

**CI Integration**: Both the main CI workflow and the dedicated coverage workflow run `pnpm coverage`, which fails if any threshold is not met.

### Viewing Coverage Reports

Check current coverage and detailed reports:

```bash
pnpm coverage                                # Run tests with coverage
open coverage/unit/lcov-report/index.html   # View HTML report
```

### Increasing Coverage

1. **Identify uncovered code**:

   ```bash
   pnpm coverage
   # Review coverage/unit/lcov-report/index.html
   # Red lines = uncovered
   ```

2. **Write tests for uncovered code**:
   - Focus on branches (if/else, switch)
   - Test error handling paths
   - Test edge cases

3. **Exclude untestable code** (sparingly):
   ```typescript
   /* istanbul ignore next */
   if (process.env.NODE_ENV === "production") {
     // Production-only code
   }
   ```

### What NOT to Test

- **Third-party libraries**: Trust they're tested
- **Next.js internals**: Framework code
- **Type definitions**: TypeScript handles this
- **Trivial code**: Simple pass-through functions

Focus on **business logic**, **edge cases**, and **user interactions**.

## Best Practices

### General

1. **Follow AAA pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Descriptive test names**: "it('renders profile card with avatar')"
4. **Test behavior, not implementation**: Avoid testing internal state
5. **Avoid test interdependence**: Each test should be isolated

### Component Testing

1. **Use semantic queries**: `getByRole`, `getByLabelText` > `getByTestId`
2. **Test accessibility**: Ensure screen reader compatibility
3. **Mock external dependencies**: API calls, timers
4. **Test user perspective**: What does the user see and do?

```typescript
// Good: Tests user-visible behavior
expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();

// Bad: Tests implementation details
expect(component.state.isValid).toBe(true);
```

### E2E Testing

1. **Wait for elements**: Use `waitFor`, `waitForLoadState`
2. **Avoid brittle selectors**: Prefer `role`, `text`, `aria-label`
3. **Test critical paths only**: E2E tests are slow
4. **Clean up state**: Reset database/localStorage between tests

### Visual Regression

1. **Use page-specific helpers**: Always prefer page-specific wait helpers from `test/visual/utils.ts` to avoid code duplication:

```typescript
// ✅ BEST: Page-specific helper (handles all setup)
import { waitForHomepage, waitForCVPage } from "../utils";
await waitForHomepage(page); // For homepage
await waitForCVPage(page); // For CV page

// ✅ GOOD: Low-level utilities for custom pages
import { waitForStableHeight, freezeCarouselInteractions } from "../utils";
await waitForStableHeight(page);
await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');

// ❌ BAD: Inline polling logic or duplicated setup code
await page.evaluate(() => {
  /* inline polling */
});
```

2. **Mask dynamic content**: Use Playwright's `mask` option for random/time-based changes:

```typescript
await expect(page).toHaveScreenshot("page.png", {
  mask: await homepageMasks(page), // portrait + ImpactCards
});
```

3. **Disable animations**: Ensure consistent screenshots
4. **Wait for stability**: Page-specific helpers handle this automatically; for custom pages use `waitForLoadState('networkidle')`, `document.fonts.ready`, `waitForStableHeight()`
5. **Test multiple viewports**: Mobile (375×667), tablet, desktop

See [Visual Regression Testing Guide](./VISUAL_REGRESSION_TESTING.md) for details.

## Troubleshooting

### Common Issues

#### Tests fail locally but pass in CI

**Cause**: Environment differences (Node version, dependencies)

**Solution**:

```bash
# Ensure consistent Node version
node --version  # Should match .nvmrc or package.json engines

# Clean install dependencies
pnpm clean:local
pnpm install
```

#### E2E tests timeout

**Cause**: Dev server not starting, slow page load

**Solution**:

```bash
# Start dev server manually in separate terminal
pnpm dev

# Run E2E tests without starting server
PLAYWRIGHT_SKIP_WEB_SERVER=true pnpm test:e2e
```

#### Visual tests fail with minor diffs

**Cause**: Font rendering, animation timing

**Solution**:

```typescript
// Increase tolerance
await expect(page).toHaveScreenshot('example.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});

// Or update baseline if change is intentional
pnpm test:visual:update
```

#### Coverage drops unexpectedly

**Cause**: New untested code added

**Solution**:

```bash
# Check which files have low coverage
pnpm coverage
open coverage/unit/lcov-report/index.html

# Add tests for red (uncovered) lines
```

#### "Cannot find module" in tests

**Cause**: Import path aliases not resolved

**Solution**:
Check `vitest.config.ts` has correct path aliases:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### Debug Modes

#### Vitest

```bash
# Run specific test with console logs
pnpm test -- --reporter=verbose test/unit/my-test.test.ts

# Debug in VS Code
# Set breakpoint, press F5, select "Debug Vitest Test"
```

#### Playwright

```bash
# Debug mode (step through test)
pnpm test:e2e -- --debug

# Headed mode (see browser)
pnpm test:e2e -- --headed

# Slow motion
pnpm test:e2e -- --headed --slow-mo=1000

# Pause on failure
pnpm test:e2e -- --headed --pause-on-failure
```

## CI/CD Integration

Tests run automatically in CI on:

- **Pull requests**: All tests with coverage enforcement
- **Push to main**: All tests + deployment

### GitHub Actions Workflows

#### Main CI Workflow (`.github/workflows/ci.yml`)

The main CI workflow runs on every PR and push to main, executing:

1. **Lint**: Code style and quality checks
2. **Typecheck**: TypeScript type checking
3. **Validate Links**: Internal link validation
4. **Unit Tests**: Fast unit tests (`pnpm test`)
5. **Coverage Check**: Unit tests with coverage enforcement (`pnpm coverage`) - **fails if thresholds not met**
6. **E2E Tests**: End-to-end user flow tests (`pnpm test:e2e`)
7. **Visual Regression Tests**: Screenshot-based UI consistency checks (`pnpm test:visual`)
8. **Build**: Production build verification

#### Coverage Workflow (`.github/workflows/coverage.yml`)

Dedicated coverage workflow that:

1. Runs unit tests with coverage (`pnpm coverage`)
2. **Enforces coverage thresholds** (lines: 90%, statements: 90%, branches: 90%, functions: 90%)
3. Uploads coverage reports as artifacts for review

### Coverage Gates

Coverage thresholds are **hard requirements**:

- **Local development**: `pnpm coverage` will fail locally if thresholds are not met
- **CI/CD**: Both `ci.yml` and `coverage.yml` workflows will fail if coverage drops below thresholds
- **Purpose**: Ensures AI-generated code and manual changes maintain high test coverage, preventing regressions that only appear in production

## Related Documentation

- [Visual Regression Testing](./VISUAL_REGRESSION_TESTING.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Engineering Standards](./ENGINEERING_STANDARDS.md)
- [Error Handling](./ERROR_HANDLING.md)
- [Accessibility Testing](./ACCESSIBILITY.md)

---

**Last updated**: December 1, 2025  
**Maintained by**: Vicente Opaso
