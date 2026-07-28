import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 10000,
    setupFiles: ["./test/setup-vitest.ts"],
    exclude: [
      ...configDefaults.exclude,
      "test/e2e/**",
      "test/visual/**",
      "test/a11y/**",
      "next-sitemap.config.*",
      ".claude/worktrees/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html", "json-summary", "json"],
      reportsDirectory: "./coverage",
      exclude: [
        "test/**",
        "playwright.config.*",
        "next.config.*",
        "next-sitemap.config.*",
        "tailwind.config.*",
        "lighthouserc.*",
        "**/*.d.ts",
        "**/*.json",
        "**/*.css",
        // Build artifacts and generated content
        ".next/**",
        "coverage/**",
        // Project scripts and tooling
        "scripts/**",
        // Low-value or infra files that we don't track coverage for
        "app/config/**",
        "app/components/Header.tsx",
        "app/components/Footer.tsx",
        "app/components/ThemeProvider.tsx",
        // Static content and policy surfaces that are covered indirectly via E2E
        "app/api/content/**",

        "app/components/ImpactCards.tsx",
        "app/components/GetInTouchSection.tsx",
        "app/**/cookie-policy/**",
        "app/**/privacy-policy/**",
        "app/**/accessibility/**",
        "app/**/tech-stack/**",
        "app/**/technical-governance/**",
        "app/**/opengraph-image.*",
        "app/**/layout.tsx",
        "app/**/page.tsx",
        "app/**/cv/**",
        "app/global-error.tsx",
        "lib/analytics.*",
        "lib/i18n/index.ts",
        "postcss.config.*",
        "vitest.config.*",
        "sentry.*.config.*",
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        branches: 90,
        functions: 90,
      },
    },
  },
});
