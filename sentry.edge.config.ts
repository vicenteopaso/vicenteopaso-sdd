import * as Sentry from "@sentry/nextjs";

import {
  resolveTracesSampleRate,
  SERVER_CONSOLE_LOG_LEVELS,
} from "./lib/sentry-config";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  // Same SENTRY_TRACES_SAMPLE_RATE handling as the Node.js runtime.
  tracesSampleRate: resolveTracesSampleRate(
    process.env.SENTRY_TRACES_SAMPLE_RATE,
  ),
  // Vercel Hobby has no Log Drains; forward console warnings/errors to
  // Sentry Logs from the SDK, matching sentry.server.config.ts.
  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: [...SERVER_CONSOLE_LOG_LEVELS],
    }),
  ],
});
