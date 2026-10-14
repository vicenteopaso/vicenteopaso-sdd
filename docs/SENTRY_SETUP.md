# Sentry Setup Guide

This guide provides step-by-step instructions for configuring Sentry error tracking in this Next.js application.

## Prerequisites

- A Sentry account (free tier available at [sentry.io](https://sentry.io))
- Access to your organization's Sentry dashboard
- Node.js LTS and pnpm installed

## Overview

Sentry is configured in this project to provide:

- **Error tracking** for client, server, and edge runtimes
- **Performance monitoring** with configurable trace sampling
- **Session replay** for debugging user interactions
- **Source map uploads** for readable stack traces in production

## Required Environment Variables

The following environment variables must be set for Sentry to work properly:

| Variable                    | Required For   | Description                                                   |
| --------------------------- | -------------- | ------------------------------------------------------------- |
| `SENTRY_DSN`                | Server & Edge  | Secret DSN for server-side and edge runtime error tracking    |
| `NEXT_PUBLIC_SENTRY_DSN`    | Client         | Public DSN for browser-side error tracking                    |
| `SENTRY_ENVIRONMENT`        | All            | Environment label (development, preview, production)          |
| `SENTRY_AUTH_TOKEN`         | Build          | Auth token for uploading source maps during build             |
| `SENTRY_ORG`                | Build          | Organization slug for source map uploads                      |
| `SENTRY_PROJECT`            | Build          | Project slug for source map uploads                           |
| `SENTRY_TRACES_SAMPLE_RATE` | All (Optional) | Sample rate for performance traces (0.0 to 1.0, default: 0.1) |

## Step-by-Step Setup

### 1. Create a Sentry Project

1. Log in to [sentry.io](https://sentry.io)
2. Navigate to **Projects** in the sidebar
3. Click **Create Project**
4. Select **Next.js** as the platform
5. Choose your alert frequency
6. Name your project (e.g., `vicenteopaso-vibecode`)
7. Click **Create Project**

### 2. Get Your DSN (Data Source Name)

The DSN is the connection string that tells the Sentry SDK where to send events.

1. After creating the project, you'll see the DSN on the setup page
2. Alternatively, navigate to:
   - **Settings** → **Projects** → Select your project
   - Click **Client Keys (DSN)** in the left sidebar
3. You'll see two values:
   - **DSN**: Use this for both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
   - The format is: `https://<key>@<org-id>.ingest.sentry.io/<project-id>`

**Security Note:** The DSN is safe to expose publicly in client-side code. Do NOT use an auth token in place of the DSN.

### 3. Get Your Organization Slug

The organization slug is the URL-friendly identifier for your Sentry organization.

1. Navigate to **Settings** (gear icon in the bottom left)
2. Click **General Settings** under Organization
3. Copy the **Organization Slug** field
4. Use this value for `SENTRY_ORG`

Example: If your Sentry URL is `https://sentry.io/organizations/my-company/`, your org slug is `my-company`.

### 4. Get Your Project Slug

The project slug is the URL-friendly identifier for your Sentry project.

1. Navigate to **Settings** → **Projects**
2. Select your project
3. Click **General Settings**
4. Copy the **Project Slug** (usually the same as your project name in lowercase with hyphens)
5. Use this value for `SENTRY_PROJECT`

Example: If your project URL is `https://sentry.io/organizations/my-org/projects/my-project/`, your project slug is `my-project`.

### 5. Create an Auth Token

The auth token is used to authenticate source map uploads during the build process.

1. Navigate to **Settings** (click your avatar → Settings)
2. In the left sidebar, click **Account**
3. Under **API Keys**, select **Auth Tokens** and click **Create New Token**
4. Configure the token:
   - **Name**: `vicenteopaso-vibecode-sourcemaps` (or any descriptive name)
   - **Scopes**: Select the following:
     - `project:releases` (required for creating releases)
     - `project:write` (required for uploading source maps)
     - `org:read` (optional, for organization-level queries)
5. Click **Create Token**
6. **IMPORTANT**: Copy the token immediately - you won't be able to see it again
7. Use this value for `SENTRY_AUTH_TOKEN`

**Security Warning:** The auth token is a SECRET. Never commit it to version control or expose it in client-side code. Store it securely in your CI/CD environment variables.

### 6. Configure Environment Variables

#### For Local Development

Create a `.env.local` file in the project root (this file is gitignored):

```bash
# Sentry configuration
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
SENTRY_ENVIRONMENT=development
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `SENTRY_DSN`)
   - **Value**: The corresponding value from Sentry
   - **Environment**: Select appropriate environments (Production, Preview, Development)
4. For sensitive values like `SENTRY_AUTH_TOKEN`:
   - Mark as **Sensitive** to hide the value in logs
   - Only expose to **Production** builds if source maps are only needed in production

**Important**:

- `NEXT_PUBLIC_SENTRY_DSN` must be set for all environments (it's bundled in client code)
- `SENTRY_AUTH_TOKEN` is only needed during build time, not runtime
- Set `SENTRY_ENVIRONMENT` appropriately per environment (e.g., `production`, `preview`, `development`)

### 7. Verify the Setup

#### Test Locally

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Check the console for Sentry initialization messages:
   - You should NOT see warnings about missing DSN or auth token
   - If Sentry is disabled (no env vars), you'll see a warning in development

3. Trigger a test error:

   ```typescript
   // Add this temporarily to any page component
   throw new Error("Test Sentry integration");
   ```

4. Check your Sentry dashboard:
   - Navigate to **Issues**
   - You should see the test error appear within a few seconds

#### Test Production Build

1. Build the application:

   ```bash
   pnpm build
   ```

2. Verify source map uploads:
   - During the build, you should see Sentry uploading source maps
   - If `SENTRY_AUTH_TOKEN` is missing, source maps will be skipped (a warning will appear)

3. Check the build output:
   - With proper configuration, you should see:
     ```
     [@sentry/nextjs] Creating release...
     [@sentry/nextjs] Uploading source maps...
     [@sentry/nextjs] Release created successfully
     ```

4. Start the production server:

   ```bash
   pnpm start
   ```

5. Trigger an error and verify it appears in Sentry with readable stack traces

## Troubleshooting

### Build Warnings About Missing Auth Token

**Symptom:**

```
[@sentry/nextjs - Node.js] Warning: No auth token provided. Will not create release.
[@sentry/nextjs - Node.js] Warning: No auth token provided. Will not upload source maps.
```

**Solution:**

- Set the `SENTRY_AUTH_TOKEN` environment variable
- Ensure it has the `project:releases` and `project:write` scopes
- For local builds, add it to `.env.local`
- For CI/CD, add it as a secret environment variable in your build platform

### Source Maps Exposed to Users

**Symptom:** Source maps are accessible via browser DevTools in production

**Solution:**

- The current configuration sets `deleteSourcemapsAfterUpload: true` in `next.config.mjs`
- This automatically removes source maps from the public build output after uploading to Sentry
- Verify that `SENTRY_AUTH_TOKEN` is set so source maps are uploaded

### Errors Not Appearing in Sentry

**Checklist:**

1. Verify the DSN is correct and active in Sentry
2. Check that the DSN is set in the appropriate environment variable:
   - `NEXT_PUBLIC_SENTRY_DSN` for client-side errors
   - `SENTRY_DSN` for server-side errors
3. Ensure your Sentry project is not paused or rate-limited
4. Check browser console for Sentry initialization warnings
5. Verify network requests to `*.ingest.sentry.io` are not blocked by firewalls or ad blockers

### Peer Dependency Warnings

**Symptom:**

```
warning "@sentry/nextjs > @sentry/opentelemetry@8.55.0" has unmet peer dependency "@opentelemetry/core@^1.30.1"
```

**Solution:**

- These OpenTelemetry dependencies are now included as dev dependencies
- Run `pnpm install` to ensure they're installed

### High Costs / Quota Exceeded

**Solution:**

- Adjust sampling rates in the Sentry config files:
  - `sentry.client.config.ts`: `tracesSampleRate`, `replaysSessionSampleRate`
  - `sentry.server.config.ts`: `SENTRY_TRACES_SAMPLE_RATE` env var
- Consider implementing filtering rules in Sentry:
  - Navigate to **Settings** → **Inbound Filters**
  - Add filters for known noisy errors (e.g., browser extensions)
- Set up alert quotas in Sentry:
  - Navigate to **Settings** → **Quota Management**

## Configuration Reference

### Sampling Rates

The project uses the following default sampling rates:

- **Traces Sample Rate**: 10% (`0.1`)
  - Controls how many performance transactions are sent to Sentry
  - Set via `SENTRY_TRACES_SAMPLE_RATE` environment variable
  - Range: 0.0 (0%, none) to 1.0 (100%, all)

- **Replay Session Sample Rate**: 10% (`0.1`)
  - Controls how many normal user sessions are recorded
  - Configured in `sentry.client.config.ts`

- **Replay on Error Sample Rate**: 100% (`1.0`)
  - Records 100% of sessions where an error occurs
  - Provides full context for debugging errors

- **Replay loading**: on first interaction, from the Sentry CDN
  - `instrumentation-client.ts` calls `Sentry.lazyLoadIntegration("replayIntegration")` on the first `pointerdown`/`keydown`/`scroll`/`touchstart`, so rrweb isn't part of the initial bundle
  - Recording therefore starts at that interaction; anything before it (or a visit with no interaction) is not replayed
  - Requires `https://browser.sentry-cdn.com` in the CSP `script-src` (`next.config.mjs`)

### CSP Configuration

**Important:** The Content Security Policy (CSP) headers are already configured to allow Sentry connections in production. The CSP includes:

```javascript
"connect-src 'self' https://challenges.cloudflare.com https://formspree.io https://*.ingest.sentry.io",
```

This allows the browser to send error reports to Sentry's ingest endpoints. The configuration is in `next.config.mjs` and is automatically applied in production environments.

**Note:** The CSP configuration in development mode is relaxed to avoid interfering with dev tooling.

## Privacy Considerations

When using Sentry, be aware of the data being collected:

1. **Error Messages**: May contain user input or sensitive data
2. **Stack Traces**: Include file paths and code structure
3. **Breadcrumbs**: User actions, network requests, console logs
4. **Session Replays**: Video-like recordings of user interactions
5. **User Context**: IP addresses, user agents, and optionally user IDs

**Recommendations:**

1. Update your privacy policy (`content/privacy-policy.md`) to mention Sentry
2. Configure data scrubbing in Sentry:
   - Navigate to **Settings** → **Security & Privacy**
   - Enable "Data Scrubbing" to remove sensitive data
   - Add custom scrubbing rules for PII (emails, credit cards, etc.)
3. Use `beforeSend` hooks in Sentry config files to filter sensitive data
4. Consider implementing user consent for session replay

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Sentry Sampling Documentation](https://docs.sentry.io/platforms/javascript/configuration/sampling/)
- [Sentry Privacy Guide](https://docs.sentry.io/product/data-management-settings/scrubbing/server-side-scrubbing/)

## Support

If you encounter issues:

1. Check the [Sentry status page](https://status.sentry.io/)
2. Review the [Sentry documentation](https://docs.sentry.io/)
3. Search the [Sentry community forum](https://forum.sentry.io/)
4. Contact [Sentry support](https://sentry.io/support/)

---

**Last Updated**: 2025-12-09  
**Sentry SDK Version**: `@sentry/nextjs@^10.29.0`  
**Next.js Version**: `^16.0.8`
