import { expect, type Page, test } from "@playwright/test";

import {
  setThemeDark,
  setThemeLight,
  waitForHomepage,
  waitForStableHeight,
} from "../utils";

async function hideGlobalChrome(page: Page) {
  await page.evaluate(() => {
    document
      .querySelectorAll("body > header, a.skip-link")
      .forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.visibility = "hidden";
        htmlElement.style.pointerEvents = "none";
      });
  });
}

test.describe("Contact Section Visual Regression", () => {
  test("renders contact section in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await waitForStableHeight(page);
    await hideGlobalChrome(page);

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();

    await expect(contactSection).toHaveScreenshot("contact-section-light.png", {
      animations: "disabled",
    });
  });

  test("renders contact section in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await waitForStableHeight(page);
    await hideGlobalChrome(page);

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();

    await expect(contactSection).toHaveScreenshot("contact-section-dark.png", {
      animations: "disabled",
    });
  });

  test("renders contact section on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await waitForStableHeight(page);
    await hideGlobalChrome(page);

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();

    await expect(contactSection).toHaveScreenshot(
      "contact-section-mobile.png",
      { animations: "disabled" },
    );
  });
});
