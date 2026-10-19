import { expect, test } from "@playwright/test";

import {
  getPortraitMask,
  setThemeDark,
  setThemeLight,
  waitForCVPage,
  waitForHomepage,
} from "../utils";

test.describe("Hero & CV Masthead Visual Regression", () => {
  test.describe("Homepage hero", () => {
    test("renders profile card in light mode", async ({ page }) => {
      await setThemeLight(page);
      await page.goto("/");
      await waitForHomepage(page);

      // Target the hero header which contains the ProfileCard on the homepage
      const profileSection = page.locator(".v3-hero-section");
      await expect(profileSection).toBeVisible();

      // Mask the portrait image since it's randomly selected
      const portraitMask = getPortraitMask(page);

      await expect(profileSection).toHaveScreenshot("hero-light.png", {
        animations: "disabled",
        mask: [portraitMask],
      });
    });

    test("renders profile card in dark mode", async ({ page }) => {
      await setThemeDark(page);
      await page.goto("/");
      await waitForHomepage(page);

      const profileSection = page.locator(".v3-hero-section");
      await expect(profileSection).toBeVisible();

      const portraitMask = getPortraitMask(page);

      await expect(profileSection).toHaveScreenshot("hero-dark.png", {
        animations: "disabled",
        mask: [portraitMask],
      });
    });

    test("renders profile card on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await waitForHomepage(page);

      const profileSection = page.locator(".v3-hero-section");
      await expect(profileSection).toBeVisible();

      const portraitMask = getPortraitMask(page);

      await expect(profileSection).toHaveScreenshot("hero-mobile.png", {
        animations: "disabled",
        mask: [portraitMask],
      });
    });
  });

  test.describe("CV masthead", () => {
    test("renders CV header profile card in light mode", async ({ page }) => {
      await setThemeLight(page);
      await page.goto("/cv");
      await waitForCVPage(page);

      // CV page has a header section-card with ProfileCard (no avatar)
      const profileSection = page.locator(".v3-cv-masthead-section");
      await expect(profileSection).toBeVisible();

      await expect(profileSection).toHaveScreenshot("cv-masthead-light.png", {
        animations: "disabled",
      });
    });

    test("renders CV header profile card in dark mode", async ({ page }) => {
      await setThemeDark(page);
      await page.goto("/cv");
      await waitForCVPage(page);

      const profileSection = page.locator(".v3-cv-masthead-section");
      await expect(profileSection).toBeVisible();

      await expect(profileSection).toHaveScreenshot("cv-masthead-dark.png", {
        animations: "disabled",
      });
    });

    test("renders CV header profile card on mobile viewport", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/cv");
      await waitForCVPage(page);

      const profileSection = page.locator(".v3-cv-masthead-section");
      await expect(profileSection).toBeVisible();

      await expect(profileSection).toHaveScreenshot("cv-masthead-mobile.png", {
        animations: "disabled",
      });
    });
  });
});
