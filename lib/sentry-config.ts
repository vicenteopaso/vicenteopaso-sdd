/**
 * Shared Sentry option resolvers for the server and edge runtimes.
 *
 * Kept free of SDK imports so the parsing rules are unit-testable and stay
 * identical across `sentry.server.config.ts` and `sentry.edge.config.ts`.
 */

/**
 * Console levels forwarded to Sentry Logs from server-side runtimes.
 *
 * On the Vercel Hobby plan there are no Log Drains, so the SDK ships these
 * logs to Sentry directly. Only warnings and errors are sent to keep the
 * Sentry Logs quota predictable; Vercel runtime logs still hold everything.
 */
export const SERVER_CONSOLE_LOG_LEVELS = ["warn", "error"] as const;

/**
 * Parse `SENTRY_TRACES_SAMPLE_RATE`. Server tracing is off unless the value is
 * a rate above 0 and up to 1.
 *
 * Off is the default because the server side here is the proxy, a few API
 * routes and OG images: traces add CPU to every Vercel Function invocation
 * (billed as Active CPU) for little insight. `undefined` is returned rather
 * than 0 because the SDK still creates spans for every request when the rate
 * is 0; only a nullish rate disables tracing.
 */
export function resolveTracesSampleRate(
  raw: string | undefined,
): number | undefined {
  const parsed = Number.parseFloat(raw ?? "");
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 1) {
    return undefined;
  }
  return parsed;
}
