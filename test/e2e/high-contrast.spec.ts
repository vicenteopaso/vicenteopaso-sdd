import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { setContrastHigh, setThemeDark } from "../visual/utils";

// Dark-theme palettes from styles/globals.css.
const DARK_DEFAULT = { accent: "#b3141c", muted: "#8a847a" };
const DARK_HIGH_CONTRAST = { accent: "#e13232", muted: "#aaa398" };

async function palette(page: Page): Promise<{ accent: string; muted: string }> {
  return page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      accent: styles.getPropertyValue("--v3-accent").trim(),
      muted: styles.getPropertyValue("--v3-muted").trim(),
    };
  });
}

test.describe("High Contrast mode", () => {
  test("keyboard users can switch it on from the navigation, and it persists", async ({
    page,
  }) => {
    await setThemeDark(page);
    await page.goto("/en");

    const toggle = page.getByRole("button", { name: "High contrast" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await palette(page)).toEqual(DARK_DEFAULT);

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
    expect(await palette(page)).toEqual(DARK_HIGH_CONTRAST);

    // Client-side navigation keeps it...
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "CV" })
      .click();
    await expect(page).toHaveURL(/\/en\/cv$/);
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");

    // ...and so does a full reload.
    await page.reload();
    const reloaded = page.getByRole("button", { name: "High contrast" });
    await expect(reloaded).toHaveAttribute("aria-pressed", "true");
    expect(await palette(page)).toEqual(DARK_HIGH_CONTRAST);

    await reloaded.focus();
    await page.keyboard.press("Space");
    await expect(reloaded).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-contrast",
      "more",
    );
    expect(await palette(page)).toEqual(DARK_DEFAULT);
  });

  test("follows the OS increase-contrast setting until the visitor chooses", async ({
    page,
  }) => {
    await setThemeDark(page);
    await page.emulateMedia({ contrast: "more" });
    await page.goto("/en");

    const toggle = page.getByRole("button", { name: "High contrast" });
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    // An explicit "off" wins over the OS setting from then on.
    await toggle.click();
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-contrast",
      "more",
    );
    await expect(
      page.getByRole("button", { name: "High contrast" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("applies a stored preference before the app hydrates", async ({
    page,
  }) => {
    await setContrastHigh(page);
    // With the app bundles blocked, only the inline <head> script can set it.
    await page.route("**/_next/static/chunks/**", (route) => route.abort());
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  });

  test("is labelled in Spanish on Spanish pages", async ({ page }) => {
    await page.goto("/es");

    await expect(
      page.getByRole("button", { name: "Alto contraste" }),
    ).toBeVisible();
  });

  test("stays visible at a 24px target size on a 320px screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/en");

    const toggle = page.getByRole("button", { name: "High contrast" });
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
  });
});
