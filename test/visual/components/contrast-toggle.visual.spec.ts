import { expect, test } from "@playwright/test";

import {
  setContrastHigh,
  setThemeDark,
  setThemeLight,
  waitForHomepage,
} from "../utils";

const THEMES = [
  { name: "light", apply: setThemeLight },
  { name: "dark", apply: setThemeDark },
] as const;

test.describe("High Contrast toggle visual regression", () => {
  for (const theme of THEMES) {
    for (const highContrast of [false, true]) {
      const variant = highContrast ? "high-contrast" : "default";

      test(`renders the header in ${theme.name} mode (${variant})`, async ({
        page,
      }) => {
        await theme.apply(page);
        if (highContrast) {
          await setContrastHigh(page);
        }
        await page.goto("/");
        await waitForHomepage(page);

        await expect(
          page.getByRole("button", { name: "High contrast" }),
        ).toHaveAttribute("aria-pressed", String(highContrast));
        await expect(page.locator("header").first()).toHaveScreenshot(
          `header-${theme.name}-${variant}.png`,
          { animations: "disabled" },
        );
      });
    }
  }

  test("renders the icon-only toggle on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    await expect(page.locator("header").first()).toHaveScreenshot(
      "header-mobile.png",
      { animations: "disabled" },
    );
  });
});
