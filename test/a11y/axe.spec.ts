import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import enUI from "../../i18n/en/ui.json";
import esUI from "../../i18n/es/ui.json";
import { setContrastHigh, setThemeDark, setThemeLight } from "../visual/utils";

// WCAG 2.1 A/AA — matches the conformance level claimed on the site's own
// Accessibility Statement page (app/[lang]/accessibility/page.tsx).
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const LOCALES = ["en", "es"] as const;

const HIGH_CONTRAST_LABEL = {
  en: enUI["nav.highContrast"],
  es: esUI["nav.highContrast"],
} as const;

const ROUTES = [
  { name: "home", path: "" },
  { name: "cv", path: "/cv" },
  { name: "accessibility", path: "/accessibility" },
  { name: "cookie-policy", path: "/cookie-policy" },
  { name: "privacy-policy", path: "/privacy-policy" },
  { name: "tech-stack", path: "/tech-stack" },
  { name: "technical-governance", path: "/technical-governance" },
] as const;

// Each theme is scanned in the default palette and in High Contrast mode.
// The dark default accent is deliberately below 4.5:1 for small text, so, per
// WCAG technique G174 (docs/adr/0003-high-contrast-mode-conforming-alternate.md),
// color contrast is gated on the dark High Contrast presentation instead. That
// presentation shares every non-accent token with the default one, so any
// other contrast regression still fails here.
const PRESENTATIONS = [
  {
    name: "light",
    applyTheme: setThemeLight,
    highContrast: false,
    checkColorContrast: true,
  },
  {
    name: "dark",
    applyTheme: setThemeDark,
    highContrast: false,
    checkColorContrast: false,
  },
  {
    name: "light, high contrast",
    applyTheme: setThemeLight,
    highContrast: true,
    checkColorContrast: true,
  },
  {
    name: "dark, high contrast",
    applyTheme: setThemeDark,
    highContrast: true,
    checkColorContrast: true,
  },
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
    for (const presentation of PRESENTATIONS) {
      test(`${route.name} (${locale}, ${presentation.name}) has no WCAG 2.1 A/AA violations`, async ({
        page,
      }) => {
        await presentation.applyTheme(page);
        if (presentation.highContrast) {
          await setContrastHigh(page);
        }
        await page.goto(`/${locale}${route.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("footer", {
          state: "visible",
          timeout: 10000,
        });

        const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
        if (!presentation.checkColorContrast) {
          builder.disableRules(["color-contrast"]);
        }
        const results = await builder.analyze();

        expect(
          results.violations,
          formatViolations(results.violations),
        ).toEqual([]);

        // G174: the switch to the conforming palette is on every page, reports
        // its state, and itself meets WCAG 2.1 AA, contrast included, in every
        // presentation.
        const toggle = page.getByRole("button", {
          name: HIGH_CONTRAST_LABEL[locale],
        });
        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute(
          "aria-pressed",
          String(presentation.highContrast),
        );

        const toggleResults = await new AxeBuilder({ page })
          .include(".v3-contrast-toggle")
          .withTags(WCAG_TAGS)
          .analyze();

        expect(
          toggleResults.violations,
          formatViolations(toggleResults.violations),
        ).toEqual([]);
      });
    }
  }
}
