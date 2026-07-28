---
name: Accessibility Statement
title: Accessibility Statement
slug: accessibility
description: Our commitment to web accessibility and WCAG 2.1 AA conformance
---

## Commitment to Accessibility

This site is committed to ensuring digital accessibility for people with disabilities. We continuously improve the user experience for everyone and apply relevant accessibility standards.

## Conformance Target

This website aims to conform to **WCAG 2.1 Level AA** standards published by the Web Accessibility Initiative (W3C).

### What this means

- Content is perceivable by all users regardless of how they access the web
- Interface components and navigation are operable by keyboard and assistive technologies
- Information and interface operations are understandable
- Content is robust enough to work with current and future assistive technologies

## Accessibility Features

### Keyboard Navigation

All interactive elements are fully keyboard accessible:

- Use **Tab** to navigate forward through interactive elements
- Use **Shift + Tab** to navigate backward
- Use **Enter** or **Space** to activate buttons and links
- Use **Escape** to close dialogs and modals
- A visible skip link appears on keyboard focus to jump to main content

### Screen Reader Support

- Semantic HTML structure with proper heading hierarchy
- ARIA labels and roles where semantic HTML is insufficient
- Alternative text for all meaningful images
- Form labels and error messages properly associated
- Landmark regions (`header`, `main`, `nav`, `footer`) for easy navigation

### Visual Design

- Minimum contrast ratio of 4.5:1 for normal text (WCAG AA)
- Minimum contrast ratio of 3:1 for large text (WCAG AA)
- Text is resizable up to 200% without loss of functionality
- No reliance on color alone to convey information
- Focus indicators are clearly visible with 2px outlines

### Motion & Animation

- Animations are subtle and non-distracting
- Reduced motion preferences are respected via `prefers-reduced-motion`
- No content flashing more than 3 times per second

### Forms

- All form fields have visible labels
- Error messages are descriptive and associated with fields
- Required fields are clearly marked
- Cloudflare Turnstile challenge is keyboard accessible

## Testing Practices

### Automated Testing

- ESLint with `eslint-plugin-jsx-a11y` catches common issues during development
- Automated accessibility audit script (`scripts/audit-a11y.mjs`) runs in CI/CD
- A dedicated Playwright suite (`test/a11y/`) runs a full `axe-core` scan (WCAG 2.1 A/AA, including color contrast) across every page, in both languages and both light/dark themes, plus dedicated checks for reflow at 320px width and the WCAG 1.4.12 text-spacing override, with advisory readability warnings for text size, line-height, and font weight

### Manual Testing

We regularly test with:

- **Keyboard navigation**: Ensuring all functionality is keyboard accessible
- **Screen readers**: Testing with NVDA (Windows) and VoiceOver (macOS/iOS)
- **Browser zoom**: Verifying layout and functionality at 200% zoom
- **Color contrast analyzers**: Validating text and UI element contrast ratios

### Assistive Technologies Tested

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)
- Keyboard-only navigation (all platforms)

## Known Limitations

While we strive for full accessibility, we are aware of the following:

- **Third-party services**: Cloudflare Turnstile (spam protection) and Formspree (email service) are external services we do not fully control, though we've verified they meet basic accessibility standards
- **Dynamic content**: Some animations may not respect all user motion preferences in older browsers

## Continuous Improvement

Accessibility is an ongoing effort. We:

- Review accessibility on every pull request
- Run automated accessibility checks in CI/CD
- Conduct periodic manual audits
- Update components when accessibility issues are identified
- Stay current with WCAG guidelines and best practices

## Feedback & Contact

We welcome feedback on the accessibility of this site. If you encounter accessibility barriers:

**Contact**: Use the "Contact" button in the site navigation to reach us via our accessible contact form.

Please include:

- The page URL where you encountered the issue
- A description of the problem
- The assistive technology you're using (if applicable)
- Your browser and operating system

We aim to respond within 2 business days and will work to resolve reported issues promptly.

## Technical Specifications

- **HTML**: Semantic HTML5
- **CSS**: Tailwind CSS with custom design tokens
- **JavaScript**: React 19 with Next.js 16 (progressive enhancement)
- **ARIA**: Applied where semantic HTML is insufficient
- **Frameworks**: Radix UI for accessible component primitives

## Formal Accessibility Complaints

This website is operated by Vicente Opaso. If you wish to make a formal complaint about accessibility:

1. Contact us via the contact form with details of the issue
2. We will acknowledge your complaint within 2 business days
3. We will investigate and respond within 10 business days with our findings and proposed solution

## Standards & Guidelines

This statement references the following standards:

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Section 508 Standards](https://www.section508.gov/) (U.S.)
- [European Accessibility Act (EAA)](https://ec.europa.eu/social/main.jsp?catId=1202)

## Last Updated

This accessibility statement was last reviewed and updated on May 3, 2026.

---

### Related Documentation

For developers contributing to this project:

- [docs/ACCESSIBILITY.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md) - Technical accessibility guidelines
- [docs/DESIGN_SYSTEM.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md) - Design tokens and component patterns
- [docs/ENGINEERING_STANDARDS.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md) - Code quality standards
