import { expect, test } from "@playwright/test";

import {
  setThemeDark,
  setThemeLight,
  waitForCVPage,
  waitForStableHeight,
} from "../utils";

const REFS_GRID_SELECTOR = ".v3-cv-refs-grid";

test.describe("References Grid Visual Regression", () => {
  test("renders references grid in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const refsGrid = page.locator(REFS_GRID_SELECTOR);
    await expect(refsGrid).toBeVisible();
    await waitForStableHeight(page);

    await expect(refsGrid).toHaveScreenshot("references-carousel-light.png", {
      animations: "disabled",
    });
  });

  test("renders references grid in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const refsGrid = page.locator(REFS_GRID_SELECTOR);
    await expect(refsGrid).toBeVisible();
    await waitForStableHeight(page);

    await expect(refsGrid).toHaveScreenshot("references-carousel-dark.png", {
      animations: "disabled",
    });
  });

  test("renders references grid on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setThemeLight(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const refsGrid = page.locator(REFS_GRID_SELECTOR);
    await expect(refsGrid).toBeVisible();
    await waitForStableHeight(page);

    await expect(refsGrid).toHaveScreenshot("references-carousel-mobile.png", {
      animations: "disabled",
    });
  });
});

test.describe("References Grid Card Visual Regression", () => {
  test("renders single reference card correctly", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const firstCard = page
      .locator(`${REFS_GRID_SELECTOR} [data-testid="cv-ref-card"]`)
      .first();
    await expect(firstCard).toBeVisible();

    await expect(firstCard).toHaveScreenshot("references-carousel-dots.png", {
      animations: "disabled",
    });
  });
});
