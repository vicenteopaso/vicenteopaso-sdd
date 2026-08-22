---
name: Tech Stack
title: Tech Stack
slug: tech-stack
---

## Overview

This site is built with a modern, type-safe stack optimized for performance, accessibility, and developer experience. The architecture follows [Spec-Driven Development (SDD)](/en/technical-governance) principles, with comprehensive governance documentation guiding implementation decisions.

## Core Framework & Runtime

- **Next.js 16** — App Router with React Server Components (RSC), static site generation (SSG), and typed routes
- **React 19.2** — UI library with server components and progressive enhancement
- **TypeScript 6.0** — Strict type checking end-to-end
- **Node.js 24** — Runtime environment (LTS)

## Styling & UI Components

- **Tailwind CSS v4** — Utility-first CSS framework with custom design tokens
- **Radix UI** — Accessible component primitives:
  - `@radix-ui/react-dialog` — Modal dialogs
  - `@radix-ui/react-navigation-menu` — Navigation components
  - `@radix-ui/react-avatar` — Avatar components
  - `@radix-ui/react-popover` — Popover components
- **next-themes** — Light/dark mode theming with system preference detection
- **tailwindcss-animate** — Animation utilities
- **tailwindcss-radix** — Radix UI integration for Tailwind
- **@tailwindcss/typography** — Typography plugin for prose styling

## Content Management

- **Markdown** — Content source files in `content/` directory
- **gray-matter** — Frontmatter parsing, validated against a Zod schema
- **react-markdown** — Markdown rendering in React
- **sanitize-html** — HTML sanitization for security

## Forms & Backend Services

- **Cloudflare Turnstile** — Bot protection and spam prevention (CAPTCHA alternative)
- **Formspree** — Email form backend service
- **Next.js Route Handlers** — API routes for form processing and content serving
- **Zod** — Schema validation for form data and API requests

## Testing & Quality Assurance

- **Vitest 4.1** — Unit testing framework with jsdom environment
- **@vitest/coverage-v8** — Code coverage reporting
- **Playwright 1.62** — End-to-end testing
- **@testing-library/react** — React component testing utilities
- **@testing-library/jest-dom** — DOM matchers for testing
- **@testing-library/dom** — DOM testing utilities

## Code Quality & Linting

- **ESLint 10.8** — Code linting with:
  - `eslint-config-next` — Next.js recommended rules
  - `@typescript-eslint/eslint-plugin` — TypeScript-specific rules
  - `eslint-plugin-jsx-a11y` — Accessibility linting
  - `eslint-plugin-security` — Security-focused rules
  - `eslint-plugin-simple-import-sort` — Import sorting
  - `eslint-config-prettier` — Prettier integration
- **Prettier 3.9** — Code formatting
- **Husky 9.1** — Git hooks
- **lint-staged 17.3** — Pre-commit linting and formatting

## Observability & Monitoring

- **Vercel Analytics** — Page views and user interactions
- **Vercel Speed Insights** — Core Web Vitals and performance metrics
- **Sentry (@sentry/nextjs 10.70)** — Error tracking, session replay, and alerting
- **Vercel Logs** — Server-side error logs

## Build & Deployment

- **Vercel** — Hosting, CDN, and edge network deployment
- **next-sitemap 4.2** — Automatic sitemap and robots.txt generation
- **pnpm 11.2** — Package manager

## Development Tools

- **[Warp](https://app.warp.dev/referral/8X3W39)** — Terminal for development workflow
- **[Cursor](https://cursor.com)** — AI-assisted code editor
- **PostCSS 8.4** — CSS processing
- **autoprefixer 10.4** — CSS vendor prefixing

## Performance & SEO

- **Static Site Generation (SSG)** — Pre-rendered pages at build time
- **Server Components** — Reduced client-side JavaScript
- **Image Optimization** — Next.js automatic image optimization
- **Font Optimization** — Google Fonts via `next/font/google`: Instrument Serif and JetBrains Mono, with `font-display: swap`
- **JSON-LD Structured Data** — Schema.org markup for SEO
- **Open Graph & Twitter Cards** — Social media previews

## Security

- **Content Security Policy (CSP)** — XSS protection
- **Rate Limiting** — In-memory rate limiting for API routes
- **Input Validation** — Zod schema validation
- **Output Sanitization** — HTML sanitization for user-generated content
- **Security Headers** — Comprehensive security headers via Next.js config
- **CodeQL** — Automated security scanning in CI

## CI/CD & Automation

- **GitHub Actions** — Continuous integration and deployment
- **Dependabot** — Automated dependency updates
- **Lighthouse CI** — Performance and accessibility audits
- **Coverage Thresholds** — Enforced via Vitest (90% lines, statements, branches, functions)

## Design System

The site uses a custom design system built on CSS custom properties (design tokens) defined in `styles/globals.css`. Design decisions are documented in [docs/DESIGN_SYSTEM.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md).

Key design principles:

- Minimalist, content-first aesthetic
- WCAG AA accessibility compliance
- Dark/light theme support
- Brutalist-inspired with configurable border radius

## Architecture & Governance

This project follows [Spec-Driven Development (SDD)](/en/technical-governance) principles, with comprehensive governance documentation including:

- **[Engineering Standards](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md)** — North-star engineering intent
- **[Architecture Overview](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ARCHITECTURE.md)** — Technical architecture and system design
- **[Engineering Constitution](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/CONSTITUTION.md)** — Immutable governance invariants and precedence

For more details on how these governance documents guide development and enable AI-assisted workflows, see the [Technical Governance](/en/technical-governance) page.

## Project Links

- [GitHub Repository](https://github.com/vicenteopaso/vicenteopaso-vibecode)
- [Hosted on Vercel](https://vercel.com)
- [Technical Governance](/en/technical-governance) — How SDD and documentation-first engineering shaped this project
