import { expect, test } from "@playwright/test";

import {
  cvPageMasks,
  setThemeDark,
  setThemeLight,
  waitForCVPage,
} from "../utils";

test.describe("CV Page Visual Regression", () => {
  test("renders CV page in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    await expect(page).toHaveScreenshot("cv-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await cvPageMasks(page),
    });
  });

  test("renders CV page in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    await expect(page).toHaveScreenshot("cv-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await cvPageMasks(page),
    });
  });

  test("renders CV page on mobile viewport", async ({ page }) => {
    // Pin the theme: the site now follows the OS, and Playwright defaults to light.
    await setThemeDark(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cv");
    await waitForCVPage(page);

    await expect(page).toHaveScreenshot("cv-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await cvPageMasks(page),
    });
  });
});
