import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { setThemeDark, setThemeLight } from "../visual/utils";

// WCAG 2.1 A/AA — matches the conformance level claimed on the site's own
// Accessibility Statement page (app/[lang]/accessibility/page.tsx).
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const LOCALES = ["en", "es"] as const;

const ROUTES = [
  { name: "home", path: "" },
  { name: "cv", path: "/cv" },
  { name: "accessibility", path: "/accessibility" },
  { name: "cookie-policy", path: "/cookie-policy" },
  { name: "privacy-policy", path: "/privacy-policy" },
  { name: "tech-stack", path: "/tech-stack" },
  { name: "technical-governance", path: "/technical-governance" },
] as const;

const THEMES = [
  { name: "light", apply: setThemeLight },
  { name: "dark", apply: setThemeDark },
] as const;

function formatViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    - ${node.target.join(" ")}`)
        .join("\n");
      return (
        `[${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}\n` +
        `  ${violation.helpUrl}\n${nodes}`
      );
    })
    .join("\n\n");
}

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route.name} (${locale}, ${theme.name}) has no WCAG 2.1 A/AA violations`, async ({
        page,
      }) => {
        await theme.apply(page);
        await page.goto(`/${locale}${route.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("footer", {
          state: "visible",
          timeout: 10000,
        });

        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();

        expect(
          results.violations,
          formatViolations(results.violations),
        ).toEqual([]);
      });
    }
  }
}
