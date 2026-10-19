# Security Policy

## Supported Versions

This is a personal site, but security is still taken seriously.

## Reporting a Vulnerability

If you discover a security issue:

- Do not open a public issue with exploit details.
- Instead, contact the maintainer privately (e.g., via the email listed on the contact page).

## Security Practices

### Secrets Handling

**Never commit secrets, API keys, tokens, or credentials to the repository.**

This repository enforces secrets protection through multiple layers:

#### 1. Automated Secrets Scanning

All commits and pull requests are automatically scanned for potential secrets using `scripts/scan-secrets.mjs`. The scanner detects:

- API keys and tokens (GitHub, OpenAI, AWS, Slack, etc.)
- Bearer tokens
- Private keys
- Long hexadecimal strings that may be secrets
- Hard-coded passwords

**To run locally:**

```bash
# Scan all tracked files
pnpm audit:secrets

# Scan only changed files
node scripts/scan-secrets.mjs --changed

# Scan specific files
node scripts/scan-secrets.mjs path/to/file.ts
```

**CI Integration:** The secrets scanner runs automatically in CI and will fail pull requests if potential secrets are detected.

#### 2. ESLint Rules

ESLint is configured with `no-restricted-syntax` rules to detect common secret patterns during development:

- GitHub tokens (`ghp_*`, `ghs_*`)
- OpenAI API keys (`sk-*`)
- AWS access keys (`AKIA*`)
- Slack tokens (`xox*`)
- Long hex strings

These rules provide immediate feedback in your editor and during lint checks.

#### 3. Environment Variables

**Always use environment variables for sensitive configuration.**

**Local Development:**

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Never commit `.env.local` - it's in `.gitignore`

3. Access environment variables in code:

   ```typescript
   // Client-side (public variables only, prefixed with NEXT_PUBLIC_)
   const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

   // Server-side (API routes, server components)
   const secretKey = process.env.TURNSTILE_SECRET_KEY;
   ```

**Production Deployment (Vercel):**

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add your secrets (they are encrypted at rest)
4. Secrets are injected at build time and runtime

**Important:**

- Client-side variables (`NEXT_PUBLIC_*`) are bundled into the JavaScript and are **publicly visible**
- Server-side variables (no prefix) are only available in API routes and server components
- Never expose sensitive values through client-side variables

#### 4. Git History

If a secret is accidentally committed:

1. **Immediately revoke/rotate** the compromised secret
2. Remove it from git history:
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner
   # See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
   ```
3. Force push the cleaned history (coordinate with team if applicable)
4. Update the secret in environment variables

**Remember:** Git history in forks and clones may still contain the secret. Always rotate compromised secrets.

### Dependency Management

- Dependencies should be kept up to date.
- `.github/workflows/security-audit.yml` runs `pnpm audit --audit-level=high` weekly, on PRs and on pushes to `main`. A high/critical finding fails the run (the weekly scheduled run opens an issue instead).
- The `Dependency Audit` job is not yet a required status check in the `main` ruleset, so a failing audit does not block merges on its own — treat a red audit as a release blocker.

#### Accepted dependency advisories

An advisory may be ignored only when no patched release exists **and** the vulnerable code is not reachable from untrusted input. Each exception lives in `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml` with an inline rationale, and is listed here:

| Advisory                                                                                       | Package                                               | Why accepted                                                                                                                                                                                                                              | Exit criteria                                                 |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (accepted 2026-10-19) | `braces` ≤3.0.3 — DoS on deeply nested brace patterns | No patched release published. Only pulled in by the `@next/eslint-plugin-next` devDependency (via `fast-glob` → `micromatch`), which expands glob patterns from repo config, never from request input. Not shipped in the runtime bundle. | Remove the ignore as soon as a patched `braces` is published. |

### Additional Best Practices

- Use strong Content Security Policy (CSP) headers (configured in `next.config.mjs`)
- Enable HTTPS/TLS everywhere (enforced by Vercel)
- Validate and sanitize all user inputs
- Use rate limiting for API endpoints
- Keep security headers up to date
- Regular security audits and penetration testing

## For AI Contributors

**When generating code:**

1. ✅ **DO**: Use `process.env.VARIABLE_NAME` for sensitive values
2. ✅ **DO**: Reference `.env.example` for required variables
3. ✅ **DO**: Use placeholder values in documentation (e.g., `your-api-key-here`)
4. ❌ **DON'T**: Hard-code API keys, tokens, or credentials
5. ❌ **DON'T**: Include real secrets in code examples
6. ❌ **DON'T**: Commit `.env.local` or other environment files with real values

The CI pipeline will automatically reject code with potential secrets.

- Secrets are never committed to the repository.
- Environment variables are managed via `.env` files and Vercel project settings.
- Security-critical patterns that must be avoided are documented in [Forbidden APIs and Patterns](./FORBIDDEN_PATTERNS.md).
