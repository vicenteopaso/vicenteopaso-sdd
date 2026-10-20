# Component Documentation

This directory contains detailed documentation for all reusable components in the application.

## Component Catalog

### Layout Components (v3 Brutalist)

- **[BrutalistNav](./BrutalistNav.md)** - Primary site navigation: logo, nav links, High Contrast toggle, locale toggle, theme toggle
- **[ContrastToggle](./ContrastToggle.md)** - High Contrast switch in the nav; the WCAG G174 control for the deeper default reds
- **[BrutalistFooter](./BrutalistFooter.md)** - Primary site footer with locale-prefixed policy links

### UI Components

- **[V3ContactForm](./V3ContactForm.md)** - Inline v3 contact form with Turnstile, name/subject/email/message
- **[CvRefCard](./CvRefCard.md)** - CV references grid card with hover-expand overlay
- **[ErrorBoundary](./ErrorBoundary.md)** - React error boundary for graceful error handling

### Policy Content Pages

- **Cookie Policy, Privacy Policy, and Tech Stack** are now rendered as standalone pages and linked from the site footer. See [BrutalistFooter](./BrutalistFooter.md) and [Policy Content Pages](./PolicyContentPages.md) for details.

### Utility Components

- **[LocaleProvider](./LocaleProvider.md)** - Locale context provider; persists preference to cookie and syncs `<html lang>`
- **[GlobalErrorHandler](./GlobalErrorHandler.md)** - Global error and promise rejection handler
- **[JsonLd](./JsonLd.md)** - Server-rendered structured data (JSON-LD)
- **[ThemeProvider](./ThemeProvider.md)** - Theme context provider (light/dark mode)
- **[Icons](./Icons.md)** - UI icon components

## Documentation Format

Each component doc follows this structure:

1. **Overview** - Brief description and purpose
2. **Props** - All props with types, defaults, and descriptions
3. **States** - Different visual/functional states
4. **Accessibility** - ARIA attributes, keyboard navigation, focus management
5. **Usage Examples** - Code examples showing common use cases
6. **Testing** - How the component is tested
7. **Design Tokens** - Related design tokens and styling

## Usage Guidelines

- All components follow **WCAG 2.1 AA** accessibility standards
- Components use **Tailwind CSS v4** utility classes
- Interactive components support **keyboard navigation**
- Components work in both **light and dark** themes
- All components are **fully typed** with TypeScript

## Related Documentation

- [Design System](../DESIGN_SYSTEM.md) - Visual design language and tokens
- [Accessibility](../ACCESSIBILITY.md) - Accessibility guidelines and testing
- [Engineering Standards](../ENGINEERING_STANDARDS.md) - Code quality and patterns
