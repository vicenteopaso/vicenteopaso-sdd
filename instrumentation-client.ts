import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry initialization.
 *
 * This file is automatically loaded by Next.js instrumentation for client-side
 * error tracking and performance monitoring.
 */

// Hook to capture router transitions for client-side navigation performance monitoring.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Basic check: Sentry public DSNs look like 'https://<publicKey>@o<orgId>.ingest[.<region>].sentry.io/<projectId>'
// Secret auth tokens are much longer and do not belong in the client bundle.
function isLikelyPublicDSN(dsn: string | undefined): boolean {
  if (!dsn) return false;
  // Public DSNs have a key of 32 hex chars, no colons, and an '@' before the host.
  // The ingest host may include a region segment (us/us2/eu/de) for data-residency
  // projects, e.g. https://1234567890abcdef1234567890abcdef@o123456.ingest.de.sentry.io/1234567
  // Matched case-insensitively since the hex key's casing isn't guaranteed.
  const publicDsnPattern =
    /^https:\/\/[0-9a-f]{32}@o\d+\.ingest\.(?:us2\.|us\.|eu\.|de\.)?sentry\.io\/\d+$/i;
  return publicDsnPattern.test(dsn);
}

const isTestEnv =
  process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

if (isTestEnv) {
  // Actually skip Sentry initialization during unit tests to avoid
  // unnecessary client hooks, rather than just logging that we would.
  if (process.env.VITEST) {
    // eslint-disable-next-line no-console
    console.debug("[Sentry] Skipping client init in tests.");
  }
} else {
  // Ensure the DSN is a public client key, not a secret auth token.
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    // No DSN provided; skip Sentry init.
    if (process.env.NODE_ENV !== "production") {
      // Only warn in non-prod to avoid leaking info in prod.
      // eslint-disable-next-line no-console
      console.warn(
        "[Sentry] No NEXT_PUBLIC_SENTRY_DSN provided; client-side error tracking is disabled.",
      );
    }
  } else if (!isLikelyPublicDSN(dsn)) {
    // DSN does not look like a public client key; warn and skip Sentry init.
    // eslint-disable-next-line no-console
    console.warn(
      "[Sentry] The DSN provided in NEXT_PUBLIC_SENTRY_DSN does not look like a public client key. " +
        "Do not expose secret auth tokens in the client bundle. Sentry client initialization skipped.",
    );
  } else {
    Sentry.init({
      dsn,
      // Inlined from SENTRY_ENVIRONMENT by next.config.mjs; the unprefixed
      // var is not available in the browser bundle.
      environment:
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      // Adjust these sample rates based on your traffic and quota.
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    deferReplayUntilInteraction();
  }
}

/**
 * Session Replay (rrweb) is the bulk of the Sentry client bundle. Bundling it
 * cost ~120 KB of mostly-unused JS and main-thread time on every page load,
 * so it is pulled from Sentry's CDN on the visitor's first interaction
 * instead. Visits with no interaction have nothing worth replaying.
 */
function deferReplayUntilInteraction() {
  const scope = globalThis;
  if (typeof scope.addEventListener !== "function") return;

  const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
  const load = () => {
    for (const type of events) scope.removeEventListener(type, load);
    Sentry.lazyLoadIntegration("replayIntegration")
      .then((replayIntegration) => Sentry.addIntegration(replayIntegration()))
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.warn("[Sentry] Session Replay failed to load.", error);
      });
  };
  for (const type of events) {
    scope.addEventListener(type, load, { once: true, passive: true });
  }
}
