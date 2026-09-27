# Design System Documentation

This document describes the visual design system for the portfolio site, including design tokens, component patterns, and usage guidelines.

## Overview

The design system is built on:

- **Tailwind CSS v4** for utility-first styling
- **Radix UI** for accessible component primitives
- **CSS Custom Properties** for theming and design tokens
- **Variable Fonts** (Inter, DM Sans) for typography

**Philosophy:**

- Minimalist, content-first aesthetic
- Strong accessibility and contrast (WCAG AA minimum)
- Dark/light theme support via `next-themes`
- Brutalist-inspired with zero border radius (configurable)

## Component Catalog

Comprehensive documentation for all components is available in the [`docs/components/`](./components/) directory.

### Key Components

- **[ProfileCard](./components/ProfileCard.md)** - User profile with avatar, name, tagline, and action links
- **[NavigationMenu](./components/NavigationMenu.md)** - Main navigation with theme toggle and contact dialog trigger
- **[Modal](./components/Modal.md)** - Base modal/dialog component with size variants and analytics
- **[ErrorBoundary](./components/ErrorBoundary.md)** - Error boundary wrapper for graceful error handling

### Full Component List

See the [Component Documentation Index](./components/README.md) for a complete catalog including:

- Layout components (Header, Footer)
- UI components (Modal, ContactDialog, ProfileCard)
- Content components (ImpactCards, ReferencesCarousel)

- Policy content pages (Cookie Policy, Privacy Policy, Tech Stack)

Each component doc includes props, states, accessibility notes, usage examples, and testing information.

---

## Design Tokens

Design tokens are defined in `styles/globals.css` as CSS custom properties under the `:root` selector. Light and dark theme variants are scoped to `:root.dark`.

### Color System

#### Light Theme Colors

**Backgrounds:**

```css
--bg-app: #f8fafc; /* slate-50, page background */
--bg-surface: #ffffff; /* white, card/elevated surfaces */
--bg-elevated: #e5e7eb; /* gray-200, slightly elevated UI */
--bg-muted: #e5e7eb; /* gray-200, muted backgrounds */
--surface-subtle: #fef2f2; /* subtle accent-tinted surface */
```

**Text:**

```css
--text-primary: #05070a; /* slate-950, primary text */
--text-muted: #374151; /* slate-700, secondary text */
```

**Accents:**

```css
--accent: #b91c1c; /* deep red, primary accent */
--accent-hover: #7f1d1d; /* darker red, hover state */
--accent-soft: #fecaca; /* muted red, subtle states */
--secondary: #2563eb; /* blue, secondary accent */
--secondary-muted: #dbeafe; /* light blue, muted secondary */
```

**Links:**

```css
--link: #b91c1c; /* deep red for links */
--link-hover: #7f1d1d; /* darker red on hover */
```

**Borders:**

```css
--border-subtle: #e2e8f0; /* slate-200, subtle borders */
--border-strong: rgba(107, 114, 128, 0.9); /* gray-600/90, strong borders */
```

#### Dark Theme Colors

**Backgrounds:**

```css
--bg-app: #05070a; /* slate-950, page background */
--bg-surface: #05070a; /* same as app background */
--bg-elevated: #05070a; /* consistent surface level */
--bg-muted: #05070a; /* consistent muted background */
--surface-subtle: #0f172a; /* slate-900, subtle lifted surface */
```

**Text:**

```css
--text-primary: #f9fafb; /* slate-50, primary text */
--text-muted: #9ca3af; /* gray-400, secondary text */
```

**Accents:**

```css
--accent: #ff4040; /* vivid red for dark background */
--accent-hover: #ff1f1f; /* deeper red for hover */
--accent-soft: #7f1d1d; /* subtle red for borders/backgrounds */
--secondary: #60a5fa; /* blue-400, secondary accent */
--secondary-muted: #1d4ed8; /* blue-700, muted secondary */
```

**Links:**

```css
--link: var(--accent); /* uses accent color */
--link-hover: var(--accent-hover); /* uses accent-hover */
```

**Borders:**

```css
--border-subtle: rgba(148, 163, 184, 0.3); /* slate-400/30 */
--border-strong: rgba(148, 163, 184, 0.6); /* slate-400/60 */
```

#### V3 Brutalist Accent Tokens and High Contrast Mode

The live v3 UI uses the `--v3-*` tokens (the second `:root` / `.dark` block in `styles/globals.css`). The accent red has a default palette and a High Contrast palette. High Contrast applies while `<html data-contrast="more">` is set. The nav's [ContrastToggle](./components/ContrastToggle.md) toggles it, and the OS `prefers-contrast: more` setting turns it on by default. See [ADR-0003](./adr/0003-high-contrast-mode-conforming-alternate.md).

| Token                                          | Light default     | Light High Contrast | Dark default          | Dark High Contrast    |
| ---------------------------------------------- | ----------------- | ------------------- | --------------------- | --------------------- |
| `--v3-accent` / `--v3-accent-text`             | `#9b1219` (7.9:1) | `#b91c1c` (6.1:1)   | `#b3141c` (3.0:1)     | `#e13232` (4.7:1)     |
| `--v3-on-accent` (text on accent fills)        | `--v3-bg` (7.9:1) | `--v3-bg` (6.1:1)   | `--v3-fg` (6.2:1)     | `--v3-bg` (4.7:1)     |
| `--v3-muted`                                   | `#6b6760` (5.3:1) | `#6b6760` (5.3:1)   | `#8a847a` (5.7:1)     | `#aaa398` (8.4:1)     |
| `--v3-accent-inverse` (red on inverted blocks) | `#b91c1c` (3.0:1) | `#b91c1c` (3.0:1)   | `--v3-accent` (6.2:1) | `--v3-accent` (4.0:1) |

Ratios are measured against `--v3-bg`, with two exceptions: `--v3-on-accent` is measured against the accent, and `--v3-accent-inverse` against `--v3-fg`, the background of inverted blocks such as the TL;DR sidebar. The dark default accent meets 3:1 for large text and UI accents only; small red text there relies on High Contrast mode. Use `--v3-accent-inverse` only for large headings: the deep light red would be 2.3:1 on those near-black blocks.

For text on accent-filled surfaces, use `--v3-on-accent`, never `--v3-bg`, so buttons stay AA in both palettes.

#### Background Gradients

**Light theme:**

```css
--bg-gradient-top: radial-gradient(
  circle at top,
  rgba(37, 99, 235, 0.14),
  transparent 55%
);
--bg-gradient-bottom: radial-gradient(
  circle at bottom,
  rgba(59, 130, 246, 0.12),
  transparent 55%
);
```

**Dark theme:** Similar gradients with adjusted opacity for subtlety.

---

### Typography

#### Font Stacks

**Body text (Inter):**

```css
font-family:
  "Inter",
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

**Headings (DM Sans):**

```css
font-family:
  "DM Sans",
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

**Monospace/Code:**

```css
font-family:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
  "Courier New", monospace;
```

#### Type Scale

```css
--font-size-root: 16px; /* base root size */
--font-size-body: 0.875rem; /* 14px, body text (text-sm) */
--font-size-small: 0.8rem; /* 12.8px, labels/skip link */
--font-size-code: 0.78rem; /* inline code */
```

**Heading sizes** (via Tailwind utilities):

- `h1`: `text-4xl md:text-5xl` (36px → 48px)
- `h2`: `text-3xl md:text-4xl` (30px → 36px)
- `h3`: `text-xl` (20px)
- `h4`: `text-xl` (20px)
- `h5`: `text-lg` (18px)
- `h6`: `text-base` (16px)

#### Line Heights

```css
--line-height-body: 1.625; /* leading-relaxed, body text */
```

Headings use `tracking-tight` for tighter letter spacing.

---

### Spacing

Tailwind's default spacing scale is used throughout:

- `px-4`, `py-8` for page shells
- `p-6 sm:p-8` for page cards
- `p-4 sm:p-6` for section cards
- `space-y-3`, `space-y-4` for vertical rhythm

**Key spacing utilities:**

- `gap-4`, `gap-6` - grid/flex gaps
- `mt-8`, `mb-12` - section margins
- `px-4` - horizontal page padding (shell)

---

### Border Radius

**Current configuration (Brutalist):**
All radius values are set to `0` for sharp, brutalist aesthetic:

```css
--radius-xs: 0;
--radius-sm: 0;
--radius-md: 0;
--radius-lg: 0;
--radius-xl: 0;
--radius-full: 9999px; /* only for circular elements */
```

**If enabling rounded corners:**

```css
--radius-xs: 0.125rem; /* 2px */
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
```

---

### Shadows

```css
--shadow-page-card: 0 18px 60px rgba(15, 23, 42, 0.9);
--shadow-skip-link: 0 18px 40px rgba(15, 23, 42, 0.7);
```

**Usage:**

- `page-card` - main content cards with strong shadow
- `skip-link` - accessibility skip link shadow
- Tailwind utilities: `shadow-sm`, `shadow-md`, `shadow-lg`

---

### Motion & Transitions

```css
--transition-fast: 150ms; /* UI state changes */
--transition-impact-in: 500ms; /* impact card fade-in */
--transition-impact-out: 140ms; /* impact card fade-out */
```

**Default transition:**

```css
transition: all var(--transition-fast) ease;
```

**Animations:**

- `impact-card-fade-in` - subtle fade-in with vertical movement
- `impact-card-fade-out` - quick fade-out

---

## Core Components

### Cards

#### Page Card (`.page-card`)

Primary content container with strong elevation:

```css
.page-card {
  @apply rounded-3xl p-6 sm:p-8 backdrop-blur;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-page-card);
}
```

**Usage:**

```tsx
<div className="page-card">{/* Main content */}</div>
```

**Characteristics:**

- Large rounded corners (`rounded-3xl` if enabled, else sharp)
- Strong shadow for elevation
- Backdrop blur for layering effect
- Responsive padding (`p-6 sm:p-8`)

---

#### Section Card (`.section-card`)

Secondary content container for subsections:

```css
.section-card {
  @apply rounded-2xl p-4 sm:p-6 shadow-sm;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
```

**Usage:**

```tsx
<div className="section-card">{/* Section content */}</div>
```

**Characteristics:**

- Medium rounded corners (`rounded-2xl`)
- Lighter shadow (`shadow-sm`)
- Smaller padding (`p-4 sm:p-6`)

---

### Buttons & Links

#### Primary Button

No default button class; Radix UI components handle button primitives. Custom styling via utility classes:

```tsx
<button className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[color:var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">
  Contact me
</button>
```

**Characteristics:**

- Uses accent colors
- Smooth color transitions
- Visible focus outline (a11y)

---

#### Text Links

Styled globally in base layer:

```css
a {
  @apply underline-offset-4 hover:underline;
  color: var(--link);
}

a:hover {
  color: var(--link-hover);
}
```

**Characteristics:**

- Underline on hover
- Offset underline (`underline-offset-4`)
- Color changes on hover
- Sufficient contrast (WCAG AA)

---

### Navigation

#### Header

Sticky header with backdrop blur:

```tsx
<header className="sticky top-0 z-50 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/90 backdrop-blur-lg">
  <nav className="shell flex items-center justify-between py-4">
    <NavigationMenu />
  </nav>
</header>
```

**Characteristics:**

- Sticky positioning (`sticky top-0`)
- High z-index (`z-50`)
- Semi-transparent with blur (`bg-[color:var(--bg-app)]/90 backdrop-blur-lg`)
- Bottom border for separation

---

#### Navigation Menu

Uses Radix UI NavigationMenu with custom styling:

**Active link:**

```tsx
className =
  "font-medium text-[color:var(--accent)] underline decoration-2 underline-offset-4";
```

**Inactive link:**

```tsx
className =
  "font-medium text-[color:var(--text-primary)] hover:text-[color:var(--accent)] transition-colors";
```

---

### Forms

#### Text Input

```tsx
<input
  type="text"
  className="w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 py-2 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--placeholder-color)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2"
/>
```

**Characteristics:**

- Rounded corners
- Subtle border
- Visible focus ring (a11y)
- Placeholder text with sufficient contrast

---

#### Textarea

Similar styling to text input with vertical resize:

```tsx
<textarea
  className="w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 py-2 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--placeholder-color)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 resize-y"
  rows={5}
/>
```

---

#### Error States

Error messages styled in accent color:

```tsx
{
  error && <p className="text-sm text-[color:var(--accent)] mt-1">{error}</p>;
}
```

---

### Modals & Dialogs

The base Modal component is used for dialogs such as ContactDialog. **Policy content (Cookie Policy, Privacy Policy, Tech Stack) is now shown as standalone pages, not in modals.**

**Modal overlay and content styling:**

Overlay: `fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`

Content: `fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-6 shadow-2xl`

See [Modal](./components/Modal.md) for details.

---

## Accessibility Guidelines

### Focus States

All interactive elements MUST have visible focus states:

```css
focus-visible:outline
focus-visible:outline-2
focus-visible:outline-offset-2
focus-visible:outline-[color:var(--accent)]
```

**For links:**

```css
focus-visible:ring-2
focus-visible:ring-[color:var(--accent)]
focus-visible:ring-offset-2
```

---

### Color Contrast

All text must meet WCAG AA contrast requirements:

**Light theme:**

- Primary text (`#05070a`) on background (`#f8fafc`): 19.5:1 ✅
- Muted text (`#374151`) on background: 10.8:1 ✅
- Accent (`#b91c1c`) on white: 7.4:1 ✅

**Dark theme:**

- Primary text (`#f9fafb`) on background (`#05070a`): 19.2:1 ✅
- Muted text (`#9ca3af`) on background: 8.1:1 ✅
- Accent (`#ff4040`) on dark: 8.9:1 ✅

**V3 accents (live UI):**

- Light default (`#9b1219`) on `--v3-bg` (`#faf8f5`): 7.9:1 ✅
- Dark default (`#b3141c`) on `--v3-bg` (`#000000`): 3.0:1, for large text and UI accents only. Small red text relies on High Contrast mode ([ADR-0003](./adr/0003-high-contrast-mode-conforming-alternate.md))
- Light High Contrast (`#b91c1c`): 6.1:1 ✅
- Dark High Contrast (`#e13232`): 4.7:1 ✅

---

### Skip Link

Accessible skip-to-content link for keyboard users:

```css
.skip-link {
  position: absolute;
  top: 1.25rem;
  left: 0.75rem;
  transform: translateY(-140%);
  opacity: 0;
  /* Hidden by default */
}

.skip-link:focus-visible {
  transform: translateY(0);
  opacity: 1;
  /* Visible on focus */
}
```

---

## Theme Switching

Themes are managed by `next-themes`:

```tsx
import { ThemeProvider } from "./ThemeProvider";

// In layout:
<ThemeProvider>{children}</ThemeProvider>;
```

**Theme toggle implementation:**

```tsx
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();

<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
  Toggle theme
</button>;
```

**CSS class:**

- Light theme: `:root`
- Dark theme: `:root.dark`

**High Contrast mode** is independent of the theme. `data-contrast="more"` on `<html>` layers the High Contrast tokens over either theme (`:root[data-contrast="more"]` and `:root.dark[data-contrast="more"]`). See [ContrastToggle](./components/ContrastToggle.md).

---

## Usage Guidelines

### Do's

✅ **Use design tokens** for all colors, spacing, and typography  
✅ **Follow semantic HTML** (headings, landmarks, lists)  
✅ **Provide visible focus states** for all interactive elements  
✅ **Test both themes** (light and dark)  
✅ **Use utility classes** from Tailwind when possible  
✅ **Maintain consistent spacing** using Tailwind's scale  
✅ **Apply sufficient contrast** (WCAG AA minimum)

---

### Don'ts

❌ **Don't use inline colors** without CSS variables  
❌ **Don't skip focus indicators**  
❌ **Don't use fixed pixel values** for spacing (use Tailwind utilities)  
❌ **Don't create one-off components** without checking for reusable patterns  
❌ **Don't override semantic HTML** without accessibility considerations  
❌ **Don't forget dark theme variants**

---

## Component Checklist

When creating new components:

- [ ] Uses design tokens (CSS custom properties)
- [ ] Works in both light and dark themes
- [ ] Has visible focus states for interactive elements
- [ ] Uses semantic HTML
- [ ] Follows spacing scale (Tailwind utilities)
- [ ] Meets WCAG AA contrast requirements
- [ ] Includes hover states where appropriate
- [ ] Has smooth transitions (`var(--transition-fast)`)
- [ ] Is keyboard accessible
- [ ] Tested with screen readers (where applicable)

---

## File Reference

- **Design tokens**: `styles/globals.css` (`:root` and `:root.dark`)
- **Typography**: `styles/globals.css` (`@layer base`)
- **Utility classes**: `styles/globals.css` (`@layer components`)
- **Theme provider**: `app/components/ThemeProvider.tsx`
- **Radix components**: `app/components/` (ContactDialog, Modal, NavigationMenu)

---

## Related Documentation

- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) - Code standards
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
