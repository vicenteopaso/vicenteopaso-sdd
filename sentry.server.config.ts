import * as Sentry from "@sentry/nextjs";

import {
  resolveTracesSampleRate,
  SERVER_CONSOLE_LOG_LEVELS,
} from "./lib/sentry-config";

// Skip Sentry initialization during unit tests to avoid Next.js pages hooks.
if (process.env.NODE_ENV === "test" || process.env.VITEST) {
  // Do not initialize Sentry when running Vitest/JSDOM.
  // This prevents wrapping of /_document in non-Pages Router environments.
  // eslint-disable-next-line no-console
  if (process.env.VITEST)
    console.debug("[Sentry] Skipping server init in tests.");
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    // Off unless SENTRY_TRACES_SAMPLE_RATE is above 0 (see lib/sentry-config.ts).
    tracesSampleRate: resolveTracesSampleRate(
      process.env.SENTRY_TRACES_SAMPLE_RATE,
    ),
    // Vercel Hobby has no Log Drains, so forward console warnings/errors
    // (including lib/error-logging output) to Sentry Logs from the SDK.
    integrations: [
      Sentry.consoleLoggingIntegration({
        levels: [...SERVER_CONSOLE_LOG_LEVELS],
      }),
    ],
  });
}
