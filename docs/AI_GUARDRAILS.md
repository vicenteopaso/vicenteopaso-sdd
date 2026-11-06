# AI Guardrails

This document defines the constraints, safety measures, and quality gates that govern AI-assisted development in this repository.

> Supremacy: All AI-generated changes MUST comply with `docs/CONSTITUTION.md` and `sdd.yaml`. If a request conflicts, the assistant must explain the conflict and refuse.

## Overview

This project embraces AI-first development with strong guardrails to ensure code quality, security, and maintainability. AI tools (GitHub Copilot, Cursor, etc.) are used extensively, but their outputs are subject to rigorous validation and review processes.

## Core Principles

### 1. AI as Accelerator, Not Decision Maker

- AI tools suggest implementations based on documented standards
- Architectural decisions remain human-driven and documented in governance docs
- AI operates within boundaries defined by `sdd.yaml` and engineering standards
- Final approval and responsibility rest with human reviewers

### 2. Documentation-First Foundation

- AI tools reference comprehensive governance documents for context
- Standards in `docs/ENGINEERING_STANDARDS.md` guide AI suggestions
- Architecture in `docs/ARCHITECTURE.md` constrains AI implementation choices
- AI helps maintain documentation consistency as code evolves

### 3. Quality Gates Are Non-Negotiable

- All AI-generated code must pass CI checks (lint, typecheck, tests)
- Coverage thresholds (90% lines, 90% branches, 90% functions) must be maintained
- Accessibility standards (WCAG 2.1 AA) cannot be regressed
- Security checks (CodeQL, dependency scanning) must pass

## Mandatory Guardrails

### Security Constraints

**AI-generated code must never:**

- Bypass Cloudflare Turnstile verification in contact flow
- Remove or weaken rate limiting in `/api/contact`
- Disable honeypot spam protection
- Remove domain origin checks
- Hard-code secrets, API keys, or credentials
- Weaken Content Security Policy (CSP) or security headers
- Introduce XSS vulnerabilities (never render raw HTML from content or user input; see [HTML Rendering](#html-rendering))
- Bypass error logging (all errors must use `lib/error-logging.ts`)

**Required security practices:**

- All external input must be validated with Zod schemas
- All HTML content must be sanitized before rendering
- Environment variables must be used for all secrets
- Rate limiting must be maintained on all API routes
- Turnstile tokens must be verified server-side

### Accessibility Constraints

**AI-generated code must maintain:**

- WCAG 2.1 AA compliance minimum
- Semantic HTML structure (proper heading hierarchy, landmarks)
- Keyboard navigation (tab order, focus visible, no traps)
- ARIA attributes used correctly (only when necessary)
- Color contrast ratios ≥ 4.5:1 for body text
- Alt text on all non-decorative images
- Screen reader compatibility

**Prohibited accessibility regressions:**

- Breaking keyboard navigation
- Removing semantic HTML elements
- Adding incorrect or redundant ARIA
- Reducing color contrast below thresholds
- Breaking focus management

### Architecture Boundaries

**AI tools must respect:**

- **App Router structure**: Components stay in `app/components/`, no mixing with API routes
- **Server Components first**: Use Client Components only when necessary
- **Pure logic in `lib/`**: Business rules don't belong in API routes or components
- **Single Source of Truth**: Configuration in `lib/seo.ts`, error handling in `lib/error-logging.ts`
- **Content separation**: Content lives in `content/`, not hard-coded in components

**Prohibited patterns:**

- Shared mutable state across routes
- Cross-layer imports (e.g., `app/components` importing from `app/api`)
- Direct filesystem or `process.env` access in components (use props/lib helpers)
- Bypassing centralized error logging or the safe HTML rendering rules

### Testing Requirements

**All AI-generated code changes must:**

- Include or update unit tests (Vitest) for new functionality
- Include or update E2E tests (Playwright) for user-facing changes
- Maintain or improve coverage thresholds
- Update visual regression baselines if UI changed
- Pass all existing tests without modification (unless fixing bugs)

**Test patterns:**

- Unit tests in `test/unit/` mirror file structure
- E2E tests in `test/e2e/` cover critical user flows
- Visual tests in `test/visual/` validate UI consistency
- Coverage exclusions are justified in `vitest.config.ts`

## CI/CD Enforcement

### Required CI Checks

All PRs (including AI-generated changes) must pass:

1. **Linting** (`pnpm lint`)
   - ESLint with Next.js, TypeScript, a11y, security rules
   - Import ordering with `eslint-plugin-simple-import-sort`
   - Prettier formatting

2. **Type Checking** (`pnpm typecheck`)
   - TypeScript strict mode
   - No `any` types without justification
   - Consistent type imports (`import type`)

3. **Link Validation** (`pnpm validate:links`)
   - All internal markdown links must resolve
   - Broken links fail CI

4. **Unit Tests** (`pnpm test`)
   - Coverage thresholds: 90% lines, 90% branches, 90% functions
   - Tests must be meaningful, not just coverage padding

5. **E2E Tests** (`pnpm test:e2e`)
   - Core user flows must pass
   - Contact form, navigation, content rendering

6. **Build** (`pnpm build`)
   - Production build must succeed
   - No build-time errors or warnings

7. **Accessibility Audit** (`.github/workflows/accessibility.yml`)
   - Automated a11y checks
   - Image alt text validation

8. **Security Scanning**
   - CodeQL analysis (JavaScript/TypeScript)
   - Dependency vulnerability scanning
   - High+ vulnerabilities block merge

9. **Lighthouse CI** (`.github/workflows/lighthouse-ci.yml`)
   - Performance ≥ 90
   - Accessibility ≥ 90
   - SEO ≥ 95 (error threshold)

### Automated vs Manual Review

**Auto-merge eligible** (with `copilot-automerge` label):

- Documentation-only changes
- Dependency updates (via Dependabot)
- Test updates without behavior changes
- Formatting/linting fixes

**Requires manual review:**

- Security-related changes
- API route modifications
- Contact form changes
- Architecture changes
- Breaking changes
- New dependencies

## AI-Assisted Workflow

### Development Phase

1. **Context Loading**
   - AI reads `sdd.yaml` for principles and boundaries
   - AI consults `docs/ENGINEERING_STANDARDS.md` for quality bar
   - AI references `docs/ARCHITECTURE.md` for design patterns

2. **Implementation**
   - AI suggests code following documented patterns
   - AI generates tests matching coverage requirements
   - AI updates documentation when introducing new patterns

3. **Validation**
   - AI runs `pnpm lint:fix` and `pnpm format:fix`
   - AI runs `pnpm typecheck`
   - AI runs `pnpm test` and verifies coverage

### Review Phase

1. **Self-Review Checklist** (see `docs/REVIEW_CHECKLIST.md`)
   - Security: No secrets, proper validation, sanitization
   - Accessibility: Keyboard nav, ARIA, contrast
   - Testing: Coverage maintained, meaningful tests
   - Documentation: Updated if behavior changed

2. **CI Validation**
   - All required checks pass
   - No new warnings or errors
   - Lighthouse scores maintained

3. **Human Review**
   - Architectural alignment verified
   - Security implications assessed
   - Maintainability considered

## Escalation Path

### When AI-Generated Code Fails

1. **CI Failure**
   - Review GitHub Actions logs
   - Fix issues locally
   - Re-run checks
   - Push fixes

2. **Security Vulnerability**
   - Stop immediately
   - Review `docs/SECURITY_POLICY.md`
   - Fix vulnerability
   - Re-run CodeQL and security scans
   - Document decision if vulnerability is false positive

3. **Accessibility Regression**
   - Review `docs/ACCESSIBILITY.md`
   - Fix with keyboard testing
   - Verify with screen reader
   - Update visual tests if needed

4. **Architecture Violation**
   - Review `docs/ARCHITECTURE.md` and `sdd.yaml`
   - Refactor to align with boundaries
   - Update documentation if pattern is new
   - Get human approval for architecture changes

### Emergency Stop Conditions

**Immediately stop and escalate if:**

- Security checks fail with high/critical vulnerabilities
- Production errors spike after deployment
- Accessibility is severely broken
- Data loss or corruption occurs
- Secrets are exposed in commits

**Escalation contacts:**

- Repository owner: @vicenteopaso
- Security issues: Follow `SECURITY.md` private reporting
- GitHub Security Advisories for vulnerabilities

## Monitoring and Observability

### Error Tracking

- **Sentry integration**: All production errors captured
- **Structured logging**: Via `lib/error-logging.ts`
- **Error boundaries**: Graceful UI fallbacks
- **Vercel logs**: Build and runtime diagnostics

### Performance Monitoring

- **Lighthouse CI**: Automated on every PR
- **Core Web Vitals**: Tracked in production
- **Bundle analysis**: Manual via `pnpm build`

### Security Monitoring

- **Dependabot**: Weekly dependency scans
- **CodeQL**: On every PR and weekly
- **Manual audits**: `pnpm audit:security`

## Related Documentation

- [Forbidden Patterns](./FORBIDDEN_PATTERNS.md) — Anti-patterns and prohibited changes
- [Review Checklist](./REVIEW_CHECKLIST.md) — Pre-merge validation checklist
- [Engineering Standards](./ENGINEERING_STANDARDS.md) — Quality bar and coding standards
- [Security Policy](./SECURITY_POLICY.md) — Threat model and security practices
- [Architecture](./ARCHITECTURE.md) — System design and boundaries
- [Technical Governance](../content/en/technical-governance.md) — Governance model and decision-making

## Continuous Improvement

This document evolves with the project:

- Guardrails may be added as new risks are identified
- Thresholds may be tightened as quality improves
- New tools may be integrated as AI tooling evolves
- Feedback from CI failures informs updates

**Last updated**: December 13, 2024

# AI Guardrails: Runtime Assertions and Error Handling

This document provides guidelines for AI-assisted code generation to ensure robust error handling and prevent silent failures.

## Table of Contents

- [Overview](#overview)
- [Runtime Assertions](#runtime-assertions)
- [Error Handling Patterns](#error-handling-patterns)
- [ESLint Rules](#eslint-rules)
- [Common Pitfalls](#common-pitfalls)
- [Examples](#examples)

## Overview

AI-generated code often makes optimistic assumptions that "things just work." In production, this leads to:

- **Silent failures**: Empty catch blocks swallow errors, making debugging impossible
- **Unreachable code paths**: Switch statements without exhaustiveness checks miss edge cases
- **Missing validation**: Functions don't validate preconditions, leading to cryptic errors downstream
- **Scattered errors**: Inconsistent error handling patterns make logs hard to aggregate

This document provides guardrails to prevent these issues.

## Runtime Assertions

### `assertNever`: Exhaustiveness Checking

Use `assertNever()` in the default case of switch statements to catch unhandled enum/union cases.

**Location**: `lib/assertions.ts`

```typescript
import { assertNever } from "@/lib/assertions";

type Status = "idle" | "loading" | "success" | "error";

function getStatusMessage(status: Status): string {
  switch (status) {
    case "idle":
      return "Ready to start";
    case "loading":
      return "Processing...";
    case "success":
      return "Completed successfully";
    case "error":
      return "An error occurred";
    default:
      // If Status type is extended but this switch isn't updated,
      // TypeScript will catch it at compile time and runtime will throw
      return assertNever(status);
  }
}
```

**Benefits**:

- TypeScript enforces that all cases are handled at compile time
- Runtime throws a descriptive error if an unexpected value is encountered
- Automatically logs the error with context for observability
- Makes code assumptions explicit

**When to use**:

- In switch statement default cases for enums or union types
- When handling discriminated unions
- Any time you want to assert that a code path is unreachable

### `invariant`: Precondition Checking

Use `invariant()` to enforce critical preconditions and business logic constraints.

**Location**: `lib/assertions.ts`

```typescript
import { invariant } from "@/lib/assertions";

function divide(a: number, b: number): number {
  invariant(b !== 0, "Cannot divide by zero");
  return a / b;
}

function processUser(user: User | null, requiredRole: string) {
  invariant(user !== null, "User must be authenticated");
  invariant(user.role === requiredRole, `User must have ${requiredRole} role`);
  // TypeScript now knows user is non-null
  return user.performAction();
}

function applyDiscount(price: number, discountPercentage: number): number {
  invariant(price >= 0, "Price must be non-negative");
  invariant(
    discountPercentage >= 0 && discountPercentage <= 100,
    "Discount percentage must be between 0 and 100",
  );
  return price * (1 - discountPercentage / 100);
}
```

**Benefits**:

- Makes preconditions explicit and self-documenting
- TypeScript type narrowing works correctly (e.g., `user` is non-null after check)
- Fails fast with clear error messages instead of causing mysterious bugs downstream
- Automatically logs violations with context for debugging

**When to use**:

- Validating function arguments
- Checking business logic constraints
- Asserting that required data is present
- Enforcing state transitions

**When NOT to use**:

- For user input validation (use Zod schemas instead)
- For expected errors that should be handled gracefully (use try/catch)
- For optional parameters (use optional chaining or default values)

## Error Handling Patterns

### Structured Error Logging

Always use `logError()` from `lib/error-logging.ts` for unexpected errors.

```typescript
import { logError, logWarning } from "@/lib/error-logging";

try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  // ✅ Good: Structured logging with context
  logError(error, {
    component: "MyComponent",
    action: "riskyOperation",
    metadata: { userId: user.id, attempt: retryCount },
  });
  throw error; // Re-throw or handle gracefully
}
```

**Benefits**:

- Consistent log format across the application
- Logs are captured by Vercel and forwarded to Sentry
- Context helps with debugging and aggregating related errors
- Breadcrumbs enrich subsequent error reports

### Empty Catch Blocks (ESLint Warning)

ESLint is configured to warn on empty catch blocks (`no-empty` rule).

```typescript
// ❌ Bad: Silent failure
try {
  await fetchData();
} catch {
  // Empty catch block - error is swallowed
}

// ✅ Good: Log the error
try {
  await fetchData();
} catch (error) {
  logError(error, { component: "DataFetcher", action: "fetchData" });
  setError("Failed to load data");
}

// ✅ Also acceptable: Explicit comment when safe to ignore
try {
  const config = JSON.parse(localStorage.getItem("config"));
} catch {
  // Ignore JSON parse errors and use default config
  return defaultConfig;
}
```

### Error Boundaries for React Components

Wrap components with `ErrorBoundary` to catch rendering errors.

```typescript
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

<ErrorBoundary
  fallback={<ErrorFallbackUI />}
  onError={(error) => {
    logError(error, { component: "MyFeature" });
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## ESLint Rules

The following ESLint rules help enforce error handling best practices:

| Rule                                | Level        | Purpose                                                         |
| ----------------------------------- | ------------ | --------------------------------------------------------------- |
| `no-empty`                          | `warn`       | Prevents empty catch blocks that swallow errors                 |
| `@typescript-eslint/no-unused-vars` | `error`      | Prevents unused error variables (suggests intentional ignoring) |
| `security/detect-*`                 | `error/warn` | Various security-focused rules to catch common vulnerabilities  |

## Common Pitfalls

### Pitfall 1: Assuming Data is Always Present

```typescript
// ❌ Bad: Assumes data.user always exists
function getUserName(data: Response) {
  return data.user.name; // Crashes if data.user is null/undefined
}

// ✅ Good: Use invariant to validate
function getUserName(data: Response) {
  invariant(data.user, "User data must be present in response");
  return data.user.name;
}

// ✅ Alternative: Optional chaining with fallback
function getUserName(data: Response) {
  return data.user?.name ?? "Unknown User";
}
```

### Pitfall 2: Incomplete Switch Statements

```typescript
type Theme = "light" | "dark" | "auto";

// ❌ Bad: Missing case and no default
function getThemeStyles(theme: Theme) {
  switch (theme) {
    case "light":
      return lightStyles;
    case "dark":
      return darkStyles;
    // "auto" case is missing - silent bug!
  }
}

// ✅ Good: assertNever catches missing cases
function getThemeStyles(theme: Theme) {
  switch (theme) {
    case "light":
      return lightStyles;
    case "dark":
      return darkStyles;
    case "auto":
      return autoStyles;
    default:
      return assertNever(theme);
  }
}
```

### Pitfall 3: Swallowing Errors Without Logging

```typescript
// ❌ Bad: Error is swallowed
async function loadUserData(userId: string) {
  try {
    const data = await fetchUser(userId);
    return data;
  } catch {
    return null; // Error information is lost!
  }
}

// ✅ Good: Log before returning fallback
async function loadUserData(userId: string) {
  try {
    const data = await fetchUser(userId);
    return data;
  } catch (error) {
    logError(error, {
      component: "UserLoader",
      action: "loadUserData",
      metadata: { userId },
    });
    return null;
  }
}
```

### Pitfall 4: Missing Input Validation

```typescript
// ❌ Bad: No validation, crashes on invalid input
function calculateArea(width: number, height: number) {
  return width * height;
}

// ✅ Good: Validate preconditions
function calculateArea(width: number, height: number) {
  invariant(width > 0, "Width must be positive");
  invariant(height > 0, "Height must be positive");
  return width * height;
}
```

## Examples

### Example 1: API Route Handler

```typescript
import { invariant } from "@/lib/assertions";
import { logError } from "@/lib/error-logging";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  message: z.string().min(5),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const data = requestSchema.parse(body);

    // Validate environment configuration
    const apiKey = process.env.API_KEY;
    invariant(apiKey, "API_KEY environment variable must be configured");

    // Process request
    const result = await processMessage(data.email, data.message, apiKey);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Log all errors with context
    logError(error, {
      component: "ContactAPI",
      action: "POST",
    });

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
```

### Example 2: Form Component with Validation

```typescript
import { invariant } from "@/lib/assertions";
import { logError } from "@/lib/error-logging";
import { useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;

      // Validate required fields
      invariant(email, "Email is required");
      invariant(message, "Message is required");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setStatus("success");
    } catch (error) {
      logError(error, {
        component: "ContactForm",
        action: "handleSubmit",
      });
      setStatus("error");
      setErrorMessage("Failed to submit. Please try again.");
    }
  };

  // Render form with status handling
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {renderStatusUI(status, errorMessage)}
    </form>
  );
}

function renderStatusUI(status: FormStatus, errorMessage: string | null) {
  switch (status) {
    case "idle":
      return null;
    case "submitting":
      return <p>Submitting...</p>;
    case "success":
      return <p>Thank you for your message!</p>;
    case "error":
      return <p className="error">{errorMessage}</p>;
    default:
      return assertNever(status);
  }
}
```

### Example 3: Data Processing Utility

```typescript
import { invariant } from "@/lib/assertions";

interface Product {
  id: string;
  price: number;
  discount?: number;
}

export function calculateFinalPrice(product: Product): number {
  // Validate product data
  invariant(product.id, "Product must have an ID");
  invariant(product.price >= 0, "Price must be non-negative");

  if (product.discount !== undefined) {
    invariant(
      product.discount >= 0 && product.discount <= 100,
      "Discount must be between 0 and 100",
    );
    return product.price * (1 - product.discount / 100);
  }

  return product.price;
}

export function aggregateTotal(products: Product[]): number {
  invariant(products.length > 0, "Cannot calculate total of empty cart");

  return products.reduce((total, product) => {
    return total + calculateFinalPrice(product);
  }, 0);
}
```

## Related Documentation

- [Error Handling](./ERROR_HANDLING.md) - Comprehensive error handling guide
- [Engineering Standards](./ENGINEERING_STANDARDS.md) - Project-wide engineering principles
- [Testing](./TESTING.md) - Testing strategies including error scenarios

---

**Last updated**: 2025-12-13  
**Purpose**: Provide guardrails for AI-assisted development to prevent silent failures and ensure robust error handling  
**Audience**: AI code generation tools, developers, code reviewers

# AI Guardrails

This document describes the guardrails in place to ensure safe and high-quality AI-assisted development in this codebase. These guardrails are implemented through a combination of ESLint rules, TypeScript strict mode, automated tests, and documentation.

## Table of Contents

- [Philosophy](#philosophy)
- [ESLint Configuration](#eslint-configuration)
- [Guardrail Categories](#guardrail-categories)
- [Working with Guardrails](#working-with-guardrails)
- [Exception Handling](#exception-handling)

---

## Philosophy

AI coding assistants are powerful tools that can accelerate development, but they require guardrails to ensure:

1. **Type Safety**: Strong TypeScript typing prevents runtime errors
2. **Accessibility**: Automated checks ensure WCAG compliance
3. **Security**: Prevent common vulnerabilities and unsafe patterns
4. **Maintainability**: Enforce consistent patterns and best practices
5. **Performance**: Optimize for Core Web Vitals and user experience

The guardrails in this project are designed to **guide** rather than **block** AI assistants, providing clear feedback when patterns deviate from established conventions.

---

## ESLint Configuration

All guardrails are configured in `eslint.config.mjs`. The configuration includes:

### Core Plugins

- `@typescript-eslint`: TypeScript-specific rules and type checking
- `eslint-plugin-jsx-a11y`: Accessibility rules for JSX
- `@next/eslint-plugin-next`: Next.js best practices
- `eslint-plugin-security`: Security vulnerability detection
- `eslint-plugin-simple-import-sort`: Consistent import ordering

### Configuration Structure

```javascript
export default [
  // Ignores
  { ignores: ['**/.next/**', '**/node_modules/**', ...] },

  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  jsxA11y.flatConfigs.recommended,

  // Custom rules
  {
    rules: {
      // TypeScript guardrails
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      // Console guardrails
      'no-console': 'error',

      // DOM access guardrails
      'no-restricted-globals': [...],

      // Pattern guardrails
      'no-restricted-syntax': [...],
    }
  },

  // Type-aware TypeScript rules (separate config with parserOptions)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } }
      ],
    }
  },

  // Overrides for specific contexts
  { files: ['test/**', 'scripts/**'], rules: {...} },
];
```

---

## Guardrail Categories

### 1. TypeScript Type Safety

**Goal**: Prevent `any` types that bypass type checking

**Rules**:

- `@typescript-eslint/no-explicit-any`: Error on explicit `any` types
- `@typescript-eslint/consistent-type-imports`: Enforce `import type` for type-only imports

**Why**:

- AI assistants may default to `any` when uncertain about types
- Type safety is our first line of defense against runtime errors
- `import type` helps with tree-shaking and bundle size

**Example**:

```typescript
// ❌ Bad
function process(data: any) {
  return data.value;
}

// ✅ Good
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error("Invalid data structure");
}

// ✅ Good - type-only import
import type { User } from "@/types/user";
```

### 2. Logging and Debugging

**Goal**: Centralize logging through `lib/error-logging.ts`

**Rules**:

- `no-console`: Disallow direct console usage in production code

**Why**:

- AI assistants often add `console.log` for debugging
- Direct console usage can leak sensitive information
- Centralized logging enables monitoring and error tracking via Sentry

**Example**:

```typescript
// ❌ Bad
console.log("Processing user data", userData);

// ✅ Good
import { logError, logWarning } from "@/lib/error-logging";

try {
  processData(userData);
} catch (error) {
  logError(error, {
    component: "DataProcessor",
    action: "process-user-data",
    metadata: { userId: userData.id },
  });
}
```

**Exceptions**:

- `lib/error-logging.ts`: Console usage is the purpose of this file
- `test/**`: Console usage allowed for test debugging
- `scripts/**`: Console usage allowed for CLI output

### 3. DOM Manipulation

**Goal**: Prevent direct DOM access that bypasses React

**Rules**:

- `no-restricted-globals`: Restrict `document` and `window` in React components

**Why**:

- AI assistants may suggest direct DOM manipulation as a quick fix
- Direct DOM access breaks React's virtual DOM
- Can introduce XSS vulnerabilities
- Makes code harder to test

**Example**:

```typescript
// ❌ Bad - direct DOM manipulation
function MyComponent() {
  useEffect(() => {
    document.getElementById('header').style.color = 'red';
  }, []);
}

// ✅ Good - use React refs
function MyComponent() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.color = 'red';
    }
  }, []);

  return <div ref={headerRef}>Header</div>;
}
```

**Exceptions**:

- `test/**`: DOM access needed for test assertions
- `test/visual/utils.ts`: Purpose is DOM manipulation for visual tests
- Global event listeners in effects (when properly cleaned up)
- Third-party library integration (e.g., Turnstile widget)

### 4. React & Next.js Best Practices

**Goal**: Enforce Next.js patterns and prevent anti-patterns

**Rules**:

- `@next/next/no-html-link-for-pages`: Enforce `next/link` for internal navigation
- `@next/next/no-img-element`: Enforce `next/image` for optimized images
- `@typescript-eslint/no-misused-promises`: Prevent async event handlers without proper error handling

**Why**:

- AI assistants may use standard HTML patterns instead of Next.js optimized components
- Async event handlers can silently fail without proper error handling
- Next.js components provide automatic optimization

**Example**:

```typescript
// ❌ Bad - HTML anchor
function BadComponent() {
  return <a href="/about">About</a>;
}

// ✅ Good - Next.js Link
import Link from 'next/link';

function GoodComponent() {
  return <Link href="/about">About</Link>;
}
```

```typescript
// ❌ Bad - HTML img
function BadImage() {
  return <img src="/logo.png" alt="Logo" />;
}

// ✅ Good - Next.js Image
import Image from 'next/image';

function GoodImage() {
  return <Image src="/logo.png" alt="Logo" width={100} height={100} />;
}
```

```typescript
// ❌ Bad - async event handler without error handling
function BadButton() {
  return <button onClick={async () => { await save(); }}>Save</button>;
}

// ✅ Good - wrapped async with error handling
import { logError } from '@/lib/error-logging';

function GoodButton() {
  return (
    <button onClick={() => {
      void (async () => {
        try {
          await save();
        } catch (error) {
          logError(error, { component: 'SaveButton', action: 'save' });
        }
      })();
    }}>
      Save
    </button>
  );
}
```

### 5. Accessibility (A11y)

**Goal**: Maintain WCAG 2.1 AA compliance

**Rules**:

- `jsx-a11y/recommended`: Full suite of accessibility rules
  - Proper heading hierarchy
  - Alt text on images
  - Keyboard navigation support
  - ARIA labels and roles
  - Focus management
  - Color contrast

**Why**:

- AI assistants may generate visually correct but inaccessible markup
- Accessibility is a legal requirement and moral imperative
- Good accessibility improves UX for all users

**Example**:

```typescript
// ❌ Bad - missing alt text, no keyboard support
<div onClick={handleClick}>
  <img src="/icon.png" />
</div>

// ✅ Good - semantic button with alt text
<button onClick={handleClick}>
  <Image src="/icon.png" alt="Settings" width={24} height={24} />
  <span className="sr-only">Settings</span>
</button>
```

### 6. Security

**Goal**: Prevent common security vulnerabilities

**Rules**:

- `security/detect-unsafe-regex`: Prevent ReDoS attacks
- `security/detect-eval-with-expression`: Prevent eval usage
- `security/detect-non-literal-regexp`: Warn on dynamic regex
- Custom restrictions on dangerous APIs

**Why**:

- AI assistants may not consider security implications
- Security vulnerabilities can have severe consequences
- Prevention is easier than remediation

**Example**:

```typescript
// ❌ Bad - unsafe HTML injection
element.innerHTML = userInput;

// ✅ Good - render as React elements (escaped by React)
<p>{userInput}</p>

// ✅ Good - markdown through ReactMarkdown (raw HTML is escaped)
<ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
```

---

## Working with Guardrails

### Development Workflow

1. **Write code**: AI assistant generates code
2. **Lint**: Run `pnpm lint` to check for violations
3. **Fix**: Address any ESLint errors
4. **Commit**: Pre-commit hooks run linting automatically
5. **CI**: GitHub Actions verify all checks pass

### Common Patterns

#### Pattern 1: Replacing Console Statements

```bash
# Find all console usage
grep -r "console\." app/ lib/
```

Replace with:

```typescript
import { logError, logWarning } from "@/lib/error-logging";
```

#### Pattern 2: Fixing `any` Types

```bash
# Find all any types
grep -r ": any\|as any" app/ lib/
```

Replace with proper types or `unknown` with type guards.

#### Pattern 3: Converting HTML to Next.js Components

Search and replace:

- `<a href="` → `<Link href="`
- `<img src="` → `<Image src="`

---

## Exception Handling

### When to Allow Exceptions

Exceptions should be **rare** and **justified**. Valid reasons include:

1. **Third-party library constraints**: Untyped legacy libraries
2. **Test utilities**: DOM access for test assertions
3. **Performance-critical code**: After profiling shows a real benefit
4. **Temporary migration**: With a TODO and issue number

### How to Document Exceptions

Always use ESLint disable comments with clear justification:

```typescript
// ❌ Bad - no justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getValue();

// ✅ Good - clear justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Turnstile library has no type definitions; types would require significant maintenance
const turnstileWidget: any = window.turnstile;
```

### Exception Comment Template

```typescript
// eslint-disable-next-line [rule-name] -- [Reason]: [What you tried]. [Link to issue if applicable]
```

Examples:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Legacy API: no types available; refactor tracked in #123
const legacyResult: any = oldAPI.getData();

// eslint-disable-next-line no-console -- Error logging: this is the centralized error logging utility
console.error("Application Error:", error);

// eslint-disable-next-line no-restricted-globals -- Test utility: DOM access required for Playwright visual regression baseline
const height = document.body.scrollHeight;
```

---

## Guardrail Override Patterns

### Test Files

Test files have relaxed rules for pragmatic testing:

```javascript
{
  files: ['test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  rules: {
    'no-console': 'off',
    'no-restricted-globals': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
}
```

### Scripts

Build and utility scripts have pragmatic overrides:

```javascript
{
  files: ['scripts/**/*.{js,mjs,ts}', '*.config.{js,mjs,ts}'],
  rules: {
    'no-console': 'off',
    'security/detect-non-literal-fs-filename': 'off',
    'security/detect-child-process': 'off',
  }
}
```

### API Routes

API routes allow server-side patterns:

```javascript
{
  files: ['app/api/**/*.ts'],
  rules: {
    // API routes can use console.error for server-side logging
    'no-console': ['error', { allow: ['error'] }],
  }
}
```

---

## Continuous Improvement

These guardrails are **living documentation**. They evolve as:

1. **New patterns emerge**: Add rules for new anti-patterns
2. **False positives**: Refine rules to reduce noise
3. **Technology changes**: Update for new Next.js features
4. **Team learning**: Incorporate lessons from code reviews

### Feedback Loop

1. **Observe**: Notice patterns in AI-generated code
2. **Document**: Add to [FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md)
3. **Automate**: Add ESLint rule if possible
4. **Educate**: Update this document

### Measuring Success

- **Lint pass rate**: Should be 100% on main branch
- **CI failure rate**: Track ESLint-related CI failures
- **Code review feedback**: Reduce manual catch of pattern violations
- **Runtime errors**: Decrease in production errors

---

## Resources

- [FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md) - Detailed pattern catalog
- [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) - Overall engineering guidelines
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - A11y requirements
- [SECURITY_POLICY.md](./SECURITY_POLICY.md) - Security practices
- `eslint.config.mjs` - ESLint configuration source

---

## Summary

AI guardrails in this project:

1. ✅ **Prevent common mistakes** through automated linting
2. ✅ **Guide AI assistants** toward best practices
3. ✅ **Maintain quality** across AI-assisted and human contributions
4. ✅ **Enable fast iteration** with quick feedback loops
5. ✅ **Ensure consistency** across the entire codebase

When AI assistants are properly constrained by these guardrails, they become powerful force multipliers that maintain high code quality while accelerating development velocity.

---

## Project-Specific Best Practices

Beyond ESLint rules, these practices are specific to this codebase:

### Content Parsing

**Preserve CV JSON parsing behavior**: The `content/[locale]/cv.json` file contains a JSON object that must be parsed correctly:

```typescript
try {
  const cvData = JSON.parse(cvJsonString);
  if (!cvData.basics || !cvData.work) {
    throw new Error("Invalid CV structure");
  }
  return cvData;
} catch (error) {
  logError(error, { component: "CVParser", action: "parseCV" });
  return null;
}
```

### Contact Flow Security

**Never bypass security checks**: The `/api/contact` route has critical security measures that must be preserved:

- Turnstile verification
- Honeypot check
- Domain validation
- Rate limiting

### i18n Requirements

- Read locale from `params.lang` in App Router pages
- Never hardcode locale or language-specific content
- All links must include locale prefix: `/en/about`, not `/about`
- Use UI string dictionaries in `i18n/[locale]/ui.json`

### HTML Rendering

The site never renders raw HTML from content or user input, so it has no HTML sanitizer. Keep it that way:

- **Markdown** goes through `ReactMarkdown` with the shared mappings in `lib/markdown-components.tsx`. Don't add `rehype-raw` or any other plugin that turns raw HTML on. Without it, react-markdown escapes inline HTML and drops unsafe link schemes such as `javascript:`.
- **Structured content** (`content/[locale]/cv.json`) is validated by the Zod schema in `lib/cv.ts`, which rejects HTML markup in text fields. Render it as React elements.
- **`dangerouslySetInnerHTML`** is only for trusted, build-time payloads that are escaped for their context. Today that's JSON-LD via `serializeJsonLd()` in `lib/seo.ts` (escapes `<`) and the static `contrastInitScript` from `lib/contrast.ts`.

```tsx
import { serializeJsonLd } from "@/lib/seo";

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
/>;
```

If a feature ever needs to render real HTML, add a vetted allowlist sanitizer with unit tests first, and record the decision in an ADR. Don't hand-roll one.

---

## PR Review Checklist

Before submitting a PR with AI-assisted changes:

**Code Quality:**

- [ ] `import type` used for type-only imports
- [ ] No `any` types (except with justification)
- [ ] No `console.*` outside `lib/error-logging`
- [ ] ESLint passes (`pnpm lint`)
- [ ] TypeScript passes (`pnpm typecheck`)

**Security:**

- [ ] No hardcoded secrets
- [ ] No raw HTML rendered (see [HTML Rendering](#html-rendering))
- [ ] Security checks preserved in `/api/contact`

**Accessibility:**

- [ ] Semantic HTML used
- [ ] Proper heading hierarchy
- [ ] Alt text on images
- [ ] Keyboard navigation works

**Testing:**

- [ ] Tests pass (`pnpm test`)
- [ ] Visual baselines updated if UI changed

**Documentation:**

- [ ] Updated if behavior changed
- [ ] `sdd.yaml` updated if principles changed

---

## Additional References

For comprehensive governance guidelines, see:

- **[FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md)** — Detailed catalog of banned patterns
- **[ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md)** — Overall engineering standards
- **[SECURITY_POLICY.md](./SECURITY_POLICY.md)** — Security practices
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Error handling patterns
- **[SEO_GUIDE.md](./SEO_GUIDE.md)** — SEO implementation
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** — Accessibility requirements
- **`sdd.yaml`** — Authoritative source of truth for principles and boundaries
