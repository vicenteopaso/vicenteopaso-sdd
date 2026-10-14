# Contact Flow Architecture

This document consolidates all contact form implementation details.

## Overview

The contact form implements defense-in-depth with multiple validation layers:

1. Client-side Turnstile challenge
2. Honeypot spam detection
3. Domain origin verification
4. Server-side rate limiting
5. Turnstile token verification
6. Zod schema validation
7. Formspree submission

## Flow Diagram

```
User opens contact dialog
  ↓
User focuses the form → Cloudflare Turnstile script loads and widget renders
  ↓
User fills form (email, message, optional phone)
  ↓
Turnstile challenge completes → token received
  ↓
Client POSTs to /api/contact
  ↓
API validates:
  - Request origin (domain check)
  - Honeypot field (spam filter)
  - Rate limiting (per-IP)
  - Turnstile token (server verification)
  - Form schema (Zod)
  ↓
If valid → forward to Formspree
  ↓
Return success/error to client
```

## Key Files

| File                               | Purpose                      |
| ---------------------------------- | ---------------------------- |
| `app/components/ContactDialog.tsx` | Client dialog with Turnstile |
| `app/api/contact/route.ts`         | API route with validation    |
| `lib/rate-limit.ts`                | In-memory rate limiting      |

## Security Layers

### 1. Cloudflare Turnstile (Bot Protection)

**Client-side:**

- Script loaded on demand by `lib/turnstile.ts` (`loadTurnstile()`), the first time a visitor focuses the form, so pages where nobody uses the form never download Turnstile or receive its `_cfuvid` cookie
- Widget rendered in `V3ContactForm` (home page) and ContactDialog
- Token passed via `window.onTurnstileSuccess`

**Server-side:**

- Token verified against `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Client IP extracted from `x-forwarded-for` or `cf-connecting-ip`

### 2. Honeypot Field

Hidden `website` field that bots typically fill:

- If non-empty → silently accept (no Formspree forward)
- Returns `{ ok: true }` to avoid bot detection

### 3. Domain Origin Check

Validates `domain` field matches `ALLOWED_DOMAIN`:

- Expected: `https://opa.so`
- Mismatches return `400` error

### 4. Rate Limiting

In-memory per-IP rate limiting (`lib/rate-limit.ts`):

- Prevents spam/abuse
- Returns `429` when exceeded
- Note: Per-instance, resets on deploy

### 5. Schema Validation

Zod schema validates all input:

- `email`: Required, valid email format
- `message`: Required, non-empty
- `phone`: Optional
- `turnstileToken`: Required

## Environment Variables

| Variable                         | Location | Purpose                                                        |
| -------------------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client   | Turnstile widget site key                                      |
| `TURNSTILE_SECRET_KEY`           | Server   | Turnstile server-side verification                             |
| `NEXT_PUBLIC_FORMSPREE_KEY`      | Both     | Formspree form ID (used server-side to build the endpoint URL) |

Formspree endpoint is configured in `app/api/contact/route.ts`.

## Error Handling

| Scenario                 | Response     |
| ------------------------ | ------------ |
| Missing Turnstile token  | 400          |
| Invalid Turnstile token  | 400          |
| Honeypot triggered       | 200 (silent) |
| Domain mismatch          | 400          |
| Rate limit exceeded      | 429          |
| Schema validation failed | 400          |
| Formspree error          | 502          |
| Server error             | 500          |

All errors are logged via `lib/error-logging.ts`. Stack traces are never exposed to clients.

## Testing

- **Unit tests**: Schema validation, rate limiting
- **E2E tests**: Full form submission flow
- **Visual tests**: Dialog appearance

## Forbidden Changes

Never bypass or remove:

- Turnstile verification
- Honeypot protection
- Rate limiting
- Domain origin check
- HTML sanitization
- Error logging

See `docs/FORBIDDEN_PATTERNS.md` for detailed anti-patterns.
