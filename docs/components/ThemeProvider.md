# ThemeProvider Component

## Overview

A wrapper around `next-themes` that provides light/dark theme functionality throughout the app. Enables system preference detection and theme persistence.

**Location:** `app/components/ThemeProvider.tsx`

**Usage:** Rendered in root layout to wrap entire app

## Props

| Prop       | Type        | Default  | Description         |
| ---------- | ----------- | -------- | ------------------- |
| `children` | `ReactNode` | required | App content to wrap |

## Configuration

```tsx
<NextThemesProvider
  attribute="class"              // Toggles via class on <html>
  defaultTheme="system"          // Follow the OS until the visitor picks
  enableSystem                   // Respect system preference
  disableTransitionOnChange      // Prevents flash on theme switch
>
```

### Settings Explained

- **attribute="class"**: Theme applied via `.dark` class on root element
- **defaultTheme="system"**: Visitors land on their OS theme (`prefers-color-scheme`) unless they stored a choice
- **enableSystem**: Detects and respects OS theme preference
- **disableTransitionOnChange**: Prevents transition animations during theme switch (avoids flash)

## Theme Detection Priority

1. **Stored preference**: Previously selected theme in localStorage
2. **System preference**: OS-level dark/light mode setting (the default)

The nav toggle (`BrutalistNav`) is binary. When it switches to the theme the OS already uses, it stores `"system"` rather than a pinned copy, so the site follows the OS again (`lib/theme.ts`). The logo and toggle glyph are picked in CSS from the `dark` class next-themes sets before paint, so they are correct before hydration.

## Usage

### In Root Layout

```tsx
import { ThemeProvider } from "./components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      {" "}
      {/* Prevents hydration mismatch */}
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Using Theme in Components

```tsx
"use client";

import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  );
}
```

## Theme Values

- `"light"` - Light mode
- `"dark"` - Dark mode
- `"system"` - Follow system preference

## CSS Implementation

Themes styled via CSS custom properties:

```css
:root {
  --bg-app: #f8fafc; /* Light mode */
  /* ... */
}

:root.dark {
  --bg-app: #05070a; /* Dark mode */
  /* ... */
}
```

The `.dark` class is applied to `<html>` element when dark mode is active.

## Hydration Handling

The `suppressHydrationWarning` attribute on `<html>` prevents:

- Mismatch between server-rendered content (no theme) and client-rendered (with theme)
- Console warnings about hydration differences
- Flash of incorrect theme on page load

## Accessibility

- Respects user's system preference (`prefers-color-scheme`)
- Theme toggle must have accessible label
- Ensure sufficient contrast in both themes

## Testing

**Test file:** Tested as part of components that use themes (NavigationMenu, ProfileCard, etc.)

- ✅ Theme provider wraps app
- ✅ `useTheme()` hook returns current theme
- ✅ Theme toggle switches themes
- ✅ Theme persists across page loads

## Storage

Theme preference stored in localStorage:

- **Key**: `theme` (managed by next-themes)
- **Values**: `"light"`, `"dark"`, or `"system"`
- **Persistence**: Survives page reloads and browser restarts

## Performance

- Minimal JavaScript overhead (~2KB)
- Theme applied before paint (no flash)
- `disableTransitionOnChange` prevents transition overhead

## Related Components

- **[NavigationMenu](./NavigationMenu.md)** - Includes theme toggle button
- Any component using `useTheme()` hook

## Related Documentation

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Design System - Theming](../DESIGN_SYSTEM.md#theme-switching)
- [CSS Custom Properties](../../styles/globals.css)

## Best Practices

1. **Wrap at root**: Mount once in root layout
2. **Use suppressHydrationWarning**: Prevents hydration errors
3. **Test both themes**: Ensure all components work in light and dark modes
4. **Respect system**: Always enable system preference detection
5. **Provide toggle**: Give users manual control over theme
6. **Maintain contrast**: Ensure WCAG AA compliance in both themes
