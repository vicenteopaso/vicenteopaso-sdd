import { expect, test } from "@playwright/test";

import {
  setThemeDark,
  setThemeLight,
  waitForHomepage,
  waitForStableHeight,
} from "../utils";

test.describe("Navigation Menu Visual Regression", () => {
  test("renders navigation correctly in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    // Get the main navigation element (the header shell container)
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    // Take a screenshot of just the navigation
    await expect(nav).toHaveScreenshot("navigation-light.png", {
      animations: "disabled",
    });
  });

  test("renders navigation correctly in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-dark.png", {
      animations: "disabled",
    });
  });

  test("renders navigation with CV active state in light mode", async ({
    page,
  }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("h1", { state: "visible" });
    await waitForStableHeight(page);

    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-cv-active-light.png", {
      animations: "disabled",
    });
  });

  test("renders navigation with CV active state in dark mode", async ({
    page,
  }) => {
    await setThemeDark(page);
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("h1", { state: "visible" });
    await waitForStableHeight(page);

    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-cv-active-dark.png", {
      animations: "disabled",
    });
  });

  test("renders navigation on mobile viewport", async ({ page }) => {
    // Pin the theme: the site now follows the OS, and Playwright defaults to light.
    await setThemeDark(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-mobile.png", {
      animations: "disabled",
    });
  });
});
