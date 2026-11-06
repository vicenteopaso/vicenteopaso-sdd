---
name: Tech Stack
title: Tech Stack
slug: tech-stack
description: "Technology stack and tooling behind opa.so: Next.js, React, TypeScript, Tailwind CSS v4, testing, observability, and CI/CD."
---

## Overview

This site is built with a modern, type-safe stack optimized for performance, accessibility, and developer experience. The architecture follows [Spec-Driven Development (SDD)](/en/technical-governance) principles, with comprehensive governance documentation guiding implementation decisions.

## Core Framework & Runtime

- **Next.js 16.4** — App Router with React Server Components (RSC), static site generation (SSG), and typed routes
- **React 19.3** — UI library with server components and progressive enhancement
- **TypeScript 6.0** — Strict type checking end-to-end
- **Node.js 24** — Runtime environment (LTS)

## Styling & UI Components

- **Tailwind CSS v4** — Utility-first CSS framework with custom design tokens
- **next-themes** — Light/dark mode theming with system preference detection
- **High Contrast mode** — A WCAG AA palette, switched from the navigation or by the OS "increase contrast" setting
- **@tailwindcss/typography** — Typography plugin for prose styling
- **clsx** — Conditional class name composition

## Content Management

- **Markdown** — Content source files in `content/` directory, in English and Spanish
- **gray-matter** — Frontmatter parsing, validated against a Zod schema
- **react-markdown** — Markdown rendering in React, with raw HTML disabled
- **DeepL** (`deepl-node`) — Machine translation of English content into Spanish, run on demand

## Forms & Backend Services

- **Cloudflare Turnstile** — Bot protection and spam prevention (CAPTCHA alternative)
- **Formspree** — Email form backend service
- **Next.js Route Handlers** — API routes for form processing, content, and the profile API
- **Zod 4** — Schema validation for form data and API requests
- **WebMCP** (`@mcp-b/global`) — Exposes site tools to AI agents in the browser, loaded only where the browser has no native support

## Testing & Quality Assurance

- **Vitest 4.1** — Unit testing framework with jsdom environment
- **@vitest/coverage-v8** — Code coverage reporting
- **Playwright 1.64** — End-to-end, visual regression, and accessibility testing
- **@axe-core/playwright** — Automated WCAG 2.1 A/AA scans
- **@testing-library/react** — React component testing utilities
- **@testing-library/jest-dom** — DOM matchers for testing
- **@testing-library/dom** — DOM testing utilities

## Code Quality & Linting

- **ESLint 10.13** — Code linting with:
  - `@next/eslint-plugin-next` — Next.js recommended rules
  - `typescript-eslint` — TypeScript-specific rules
  - `eslint-plugin-jsx-a11y` — Accessibility linting
  - `eslint-plugin-security` — Security-focused rules
  - `eslint-plugin-simple-import-sort` — Import sorting
  - `eslint-config-prettier` — Prettier integration
- **Prettier 3.9** — Code formatting
- **Husky 9.1** — Git hooks
- **lint-staged 17.6** — Pre-commit linting and formatting
- **Knip** — Unused files, exports, and dependencies detection

## Observability & Monitoring

- **Vercel Web Analytics** — Cookieless, aggregate page views
- **Vercel Speed Insights** — Core Web Vitals and performance metrics
- **Sentry (@sentry/nextjs 11.8)** — Error tracking, alerting, and session replay (loaded on first interaction)
- **Sentry Logs** — Server-side warnings and errors forwarded from the Sentry SDK
- **Vercel Logs** — Request and function logs

## Build & Deployment

- **Vercel** — Hosting and CDN. GitHub Actions builds the site with `vercel build` and deploys the prebuilt output, so checks run before anything ships
- **Next.js metadata routes** — `app/sitemap.ts` and `app/robots.ts` generate the sitemap and robots.txt
- **pnpm 11.2** — Package manager

## Development Tools

- **[Warp](https://app.warp.dev/referral/8X3W39)** — Terminal for development workflow
- **[Cursor](https://cursor.com)** — AI-assisted code editor
- **[Claude Code](https://claude.com/claude-code)** and **GitHub Copilot** — AI coding agents working under the project's governance documents
- **PostCSS 8.5** — CSS processing
- **autoprefixer 10.6** — CSS vendor prefixing

## Performance & SEO

- **Static Site Generation (SSG)** — Pre-rendered pages at build time
- **Server Components** — Reduced client-side JavaScript
- **Image Optimization** — Next.js automatic image optimization
- **Font Optimization** — Google Fonts self-hosted via `next/font/google`: Instrument Serif, Inter, and JetBrains Mono, with `font-display: swap`
- **JSON-LD Structured Data** — Schema.org markup for SEO
- **Open Graph & Twitter Cards** — Social media previews

## Security

- **Content Security Policy (CSP)** — XSS protection
- **Rate Limiting** — In-memory rate limiting for API routes
- **Input Validation** — Zod schema validation
- **Output Sanitization** — Markdown is rendered without raw HTML, so content can't inject markup
- **Cloudflare Turnstile** — Bot verification on the contact form, checked on the server
- **Security Headers** — Comprehensive security headers via Next.js config
- **CodeQL** — Automated security scanning in CI
- **Dependency and secret scanning** — `pnpm audit` (high and critical advisories) and a repository secret scan

## CI/CD & Automation

- **GitHub Actions** — Continuous integration and deployment
- **Dependabot** — Automated dependency updates
- **Lighthouse CI** — Performance, accessibility, best-practices, and SEO audits
- **Coverage Thresholds** — Enforced via Vitest (90% lines, statements, branches, functions)
- **Release Drafter** — Release notes drafted from merged pull requests

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
