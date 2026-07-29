import { defineConfig } from "@playwright/test";

// Playwright runs both E2E tests (test/e2e) and visual regression tests (test/visual).
// The testMatch pattern ensures we only load Playwright test files, not Vitest unit tests.
//
// The base URL and dev server command are configurable so tests can
// either reuse an existing dev server or start one automatically.
// Use a dedicated Playwright port by default to avoid colliding with unrelated local apps.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3100);
// Use localhost so the origin matches what Next.js expects in development.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const WEB_SERVER_COMMAND =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
  (process.env.CI
    ? `pnpm start --port ${PORT}`
    : `pnpm build && pnpm start --port ${PORT}`);

export default defineConfig({
  testMatch: /.*\.(spec|test)\.(ts|tsx)$/,
  testDir: "./test",
  testIgnore: ["**/test/unit/**"],
  timeout: 30000,
  use: {
    baseURL: BASE_URL,
    // Send header that disables Vercel Toolbar (per Vercel docs).
    // Note: This does NOT disable Speed Insights (different product), which we suppress
    // via runtime detection in `AnalyticsWrapper`.
    extraHTTPHeaders: {
      "x-vercel-skip-toolbar": "1",
    },
  },
  // Visual regression testing configuration
  expect: {
    // Default is 5000ms; under full local parallelism (default worker count)
    // the stability wait before a screenshot can exceed that from CPU
    // contention alone, not a real pixel mismatch (reproduced: the same
    // assertion passes immediately in isolation with --workers=1).
    timeout: 10_000,
    toHaveScreenshot: {
      // Maximum allowed pixel difference (set low for effective regression; override per-test if needed)
      maxDiffPixels: 200,
      // Threshold for pixel comparison (0-1, lower is stricter)
      // Increased to handle carousel and animated content
      threshold: 0.5,
      // Disable animations for consistent screenshots
      animations: "disabled" as const,
    },
  },
  // Reporter configuration
  // Both E2E and visual tests (including those in test/visual/ that override testDir)
  // will share the same output location ("playwright-report"). The visual regression settings above
  // (lines 18-28) apply to both E2E tests (when they use screenshots) and dedicated visual tests.
  // If you need to separate reports by test type in the future, adjust the outputFolder accordingly.
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: WEB_SERVER_COMMAND,
        url: BASE_URL,
        // Allow extra time for Next.js dev server cold start before visual tests
        timeout: 300_000,
        reuseExistingServer: true,
      },
});
