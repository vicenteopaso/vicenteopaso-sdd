import { expect, test } from "@playwright/test";

import {
  setThemeDark,
  setThemeLight,
  waitForHomepage,
  waitForStableHeight,
} from "../utils";

test.describe("Impact Strip Visual Regression", () => {
  test("renders impact strip in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    const impactStrip = page.locator(".v3-impact-grid");
    await expect(impactStrip).toBeVisible();
    await waitForStableHeight(page);

    await expect(impactStrip).toHaveScreenshot("impact-strip-light.png", {
      animations: "disabled",
    });
  });

  test("renders impact strip in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    const impactStrip = page.locator(".v3-impact-grid");
    await expect(impactStrip).toBeVisible();
    await waitForStableHeight(page);

    await expect(impactStrip).toHaveScreenshot("impact-strip-dark.png", {
      animations: "disabled",
    });
  });

  test("renders impact strip on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    const impactStrip = page.locator(".v3-impact-grid");
    await expect(impactStrip).toBeVisible();
    await waitForStableHeight(page);

    await expect(impactStrip).toHaveScreenshot("impact-strip-mobile.png", {
      animations: "disabled",
    });
  });
});

test.describe("Impact Strip Individual Card Visual Regression", () => {
  test("renders single impact stat correctly", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    const impactStrip = page.locator(".v3-impact-grid");
    await expect(impactStrip).toBeVisible();

    const firstCard = impactStrip.locator(".v3-impact-stat").first();
    await expect(firstCard).toBeVisible();

    await expect(firstCard).toHaveScreenshot("impact-strip-single-light.png", {
      animations: "disabled",
    });
  });
});
