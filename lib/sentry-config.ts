/**
 * Shared Sentry option resolvers for the server and edge runtimes.
 *
 * Kept free of SDK imports so the parsing rules are unit-testable and stay
 * identical across `sentry.server.config.ts` and `sentry.edge.config.ts`.
 */

export const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

/**
 * Console levels forwarded to Sentry Logs from server-side runtimes.
 *
 * On the Vercel Hobby plan there are no Log Drains, so the SDK ships these
 * logs to Sentry directly. Only warnings and errors are sent to keep the
 * Sentry Logs quota predictable; Vercel runtime logs still hold everything.
 */
export const SERVER_CONSOLE_LOG_LEVELS = ["warn", "error"] as const;

/**
 * Parse `SENTRY_TRACES_SAMPLE_RATE`, falling back to the default when the
 * value is missing, not a number, or outside Sentry's accepted 0–1 range.
 */
export function resolveTracesSampleRate(raw: string | undefined): number {
  const parsed = Number.parseFloat(raw ?? "");
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }
  return parsed;
}
