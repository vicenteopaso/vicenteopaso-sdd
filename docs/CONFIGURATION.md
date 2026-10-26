# Configuration

All environment variables and configuration for this project.

## Environment Variables

Copy `.env.example` to `.env.local` for local development.

### Contact Form

| Variable                         | Location | Required | Description                   |
| -------------------------------- | -------- | -------- | ----------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client   | Yes      | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY`           | Server   | Yes      | Turnstile verification secret |
| `NEXT_PUBLIC_FORMSPREE_KEY`      | Both     | Yes      | Formspree form ID             |

### Error Tracking (Sentry)

| Variable                    | Location | Required | Description                                        |
| --------------------------- | -------- | -------- | -------------------------------------------------- |
| `SENTRY_DSN`                | Server   | Yes      | Sentry DSN for server SDK                          |
| `NEXT_PUBLIC_SENTRY_DSN`    | Client   | Yes      | Sentry DSN for browser SDK                         |
| `SENTRY_ENVIRONMENT`        | Both     | No       | Environment label (development/preview/production) |
| `SENTRY_AUTH_TOKEN`         | Build    | Yes      | Token for source map uploads                       |
| `SENTRY_ORG`                | Build    | Yes      | Sentry organization slug                           |
| `SENTRY_PROJECT`            | Build    | Yes      | Sentry project slug                                |
| `SENTRY_TRACES_SAMPLE_RATE` | Server   | No       | Performance trace rate (0.0-1.0, default 0.1)      |

### Cache Busting

| Variable                        | Location | Required | Description                  |
| ------------------------------- | -------- | -------- | ---------------------------- |
| `NEXT_PUBLIC_PDF_CACHE_DATE`    | Client   | No       | Cache version for PDF assets |
| `NEXT_PUBLIC_OG_CACHE_DATE`     | Client   | No       | Cache version for OG images  |
| `NEXT_PUBLIC_ICONS_CACHE_DATE`  | Client   | No       | Cache version for icons      |
| `NEXT_PUBLIC_IMAGES_CACHE_DATE` | Client   | No       | Cache version for images     |

### Translation

| Variable        | Location | Required | Description                        |
| --------------- | -------- | -------- | ---------------------------------- |
| `DEEPL_API_KEY` | Server   | No       | DeepL API key for `pnpm translate` |

## Configuration Files

| File                   | Purpose                        |
| ---------------------- | ------------------------------ |
| `.nvmrc`               | Node.js version (24)           |
| `package.json`         | Dependencies, scripts, engines |
| `tsconfig.json`        | TypeScript configuration       |
| `next.config.mjs`      | Next.js configuration          |
| `tailwind.config.js`   | Tailwind CSS configuration     |
| `eslint.config.mjs`    | ESLint configuration           |
| `vitest.config.ts`     | Unit test configuration        |
| `playwright.config.ts` | E2E test configuration         |
| `sentry.*.config.ts`   | Sentry SDK configuration       |

## Governance Files

| File                   | Purpose                          |
| ---------------------- | -------------------------------- |
| `sdd.yaml`             | System Design & Development spec |
| `cursor.json`          | AI IDE configuration             |
| `docs/CONSTITUTION.md` | Governance invariants            |

## Security Notes

- Never commit `.env.local` or actual secrets
- Use Vercel environment variables for production
- Rotate secrets if accidentally exposed
- `NEXT_PUBLIC_*` variables are exposed to the browser

## Vercel Configuration

Production environment variables are set in:

- Vercel Dashboard → Project → Settings → Environment Variables

Required for production:

- All contact form variables
- All Sentry variables (for error tracking)
- Cache busting variables (optional, for versioning)
