# Icon Components

## Overview

Collection of SVG icon components for social media and UI actions. All icons are client-side, accessible, and styled with `currentColor`.

**Location:** `app/components/icons.tsx`

## Components

### GitHubIcon

GitHub logo icon

```tsx
<GitHubIcon className="h-5 w-5" />
```

### LinkedInIcon

LinkedIn logo icon

```tsx
<LinkedInIcon className="h-5 w-5" />
```

### XIcon

X (formerly Twitter) logo icon

```tsx
<XIcon className="h-5 w-5" />
```

### DownloadIcon

Download arrow icon (arrow pointing down with base line)

```tsx
<DownloadIcon className="h-5 w-5" />
```

### ContrastIcon

Contrast icon (a circle with its left half filled), used by the [ContrastToggle](./ContrastToggle.md)

```tsx
<ContrastIcon className="h-4 w-4" />
```

## Props

All icons accept standard SVG props (`SVGProps<SVGSVGElement>`):

- `className` - Tailwind classes for sizing and colors
- `aria-hidden` - Automatically set to `"true"` (icons are decorative)
- `style` - Inline styles if needed
- All other SVG attributes

## Features

- **currentColor**: All icons use `fill="currentColor"` for easy color theming
- **Accessible**: `aria-hidden="true"` prevents screen readers from announcing decorative icons
- **Flexible sizing**: No fixed dimensions, controlled via className
- **Client-side**: All marked with `"use client"` directive

## Usage Examples

### Social Links

```tsx
<a href="https://github.com/username" aria-label="GitHub">
  <GitHubIcon className="h-5 w-5 text-[color:var(--text-primary)]" />
</a>
```

### Download Button

```tsx
<button aria-label="Download CV (PDF)">
  <DownloadIcon className="h-4 w-4" />
</button>
```

### With Color Classes

```tsx
<GitHubIcon className="h-6 w-6 text-blue-500 hover:text-blue-600" />
```

## Accessibility

- Icons are decorative and have `aria-hidden="true"`
- Parent elements (links/buttons) must have `aria-label` or visible text
- Never use icons without accessible text or labels

## Design Tokens

Icons inherit color from parent element or explicit color classes:

```css
currentColor  /* Inherits from text color */
```

## Testing

Tested as part of components that use them:

- ProfileCard component
- NavigationMenu component
- ContactInfo component

## Related Components

- **[ProfileCard](./ProfileCard.md)** - Uses social icons
- **[NavigationMenu](./NavigationMenu.md)** - Uses theme toggle icon (not in this file)
- **[ContactInfo](./ContactInfo.md)** - May use icons for contact methods

## Best Practices

1. **Always provide accessible text**: Use `aria-label` on parent button/link
2. **Size appropriately**: Typically 16px-24px (h-4 to h-6)
3. **Use currentColor**: Easier to theme consistently
4. **Keep simple**: Icons should be recognizable at small sizes
5. **Test visibility**: Ensure sufficient contrast in both themes
