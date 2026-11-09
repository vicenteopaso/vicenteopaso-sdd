import { expect, test } from "@playwright/test";

import { waitForHomepage, waitForStableHeight } from "../utils";
import { setThemeDark, setThemeLight } from "../utils";

test.describe("Footer Visual Regression", () => {
  test("renders footer in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    await expect(footer).toHaveScreenshot("footer-light.png", {
      animations: "disabled",
    });
  });

  test("renders footer in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    await expect(footer).toHaveScreenshot("footer-dark.png", {
      animations: "disabled",
    });
  });

  test("renders footer on mobile viewport", async ({ page }) => {
    // Pin the theme: the site now follows the OS, and Playwright defaults to light.
    await setThemeDark(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    await expect(footer).toHaveScreenshot("footer-mobile.png", {
      animations: "disabled",
    });
  });

  test("renders footer on CV page", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("footer", { state: "visible" });
    await waitForStableHeight(page);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Footer should be consistent across pages
    await expect(footer).toHaveScreenshot("footer-cv-light.png", {
      animations: "disabled",
    });
  });
});
