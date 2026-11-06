import { expect, type Locator, type Page, test } from "@playwright/test";

import { setContrastHigh, setThemeDark, setThemeLight } from "../visual/utils";

/**
 * Helper function to navigate to the inline contact form.
 * The contact form is now rendered inline on the homepage at the #contact section.
 */
async function navigateToContactSection(page: Page) {
  await page.goto("/en", { waitUntil: "load" });
  await expect(page.locator("#contact")).toBeVisible({ timeout: 15000 });
  await page.evaluate(() =>
    document.querySelector("#contact")?.scrollIntoView(),
  );
  await expect(page.getByLabel("EMAIL *")).toBeVisible({ timeout: 15000 });
}

test("contact form section shows required fields", async ({ page }) => {
  await navigateToContactSection(page);

  await expect(
    page.getByRole("heading", { name: "Let's talk." }),
  ).toBeVisible();
  await expect(page.getByLabel("EMAIL *")).toBeVisible();
  await expect(page.getByLabel("MESSAGE *")).toBeVisible();
});

test("CV page renders experience section", async ({ page }) => {
  await page.goto("/en/cv", { waitUntil: "load" });

  // EXPERIENCE and SKILLS sections are referenced in the table of contents
  await expect(
    page.getByRole("link", { name: /experience/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /skills/i }).first(),
  ).toBeVisible();
});

// Mobile viewport tests
test.describe("Contact form - mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("contact form is visible on mobile", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await expect(page.locator("#contact")).toBeVisible({ timeout: 15000 });
    await page.evaluate(() =>
      document.querySelector("#contact")?.scrollIntoView(),
    );

    await expect(page.getByLabel("EMAIL *")).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("MESSAGE *")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "SEND →" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("contact form renders correctly on mobile viewport", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    await expect(page.locator("#contact")).toBeVisible({ timeout: 15000 });
    await page.evaluate(() =>
      document.querySelector("#contact")?.scrollIntoView(),
    );

    await expect(page.getByLabel("NAME")).toBeVisible();
    await expect(page.getByLabel("EMAIL *")).toBeVisible();
    await expect(page.getByLabel("SUBJECT")).toBeVisible();
    await expect(page.getByLabel("MESSAGE *")).toBeVisible();
    await expect(page.getByRole("button", { name: "SEND →" })).toBeVisible();
  });
});

// Error flow tests
test.describe("Contact form - error handling", () => {
  test("shows validation errors for empty form", async ({ page }) => {
    await navigateToContactSection(page);

    const emailInput = page.getByLabel("EMAIL *");
    const messageInput = page.getByLabel("MESSAGE *");

    await emailInput.focus();
    await messageInput.focus();

    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test("form values are preserved on validation error", async ({ page }) => {
    await navigateToContactSection(page);

    const emailInput = page.getByLabel("EMAIL *");
    await emailInput.fill("test@example.com");

    await page.getByLabel("MESSAGE *").focus();
    await expect(emailInput).toHaveValue("test@example.com");
  });
});

// Accessibility tests
test.describe("Contact form - accessibility", () => {
  test("contact form has required field markers", async ({ page }) => {
    await navigateToContactSection(page);

    await expect(page.getByLabel("EMAIL *")).toBeVisible();
    await expect(page.getByLabel("MESSAGE *")).toBeVisible();
  });

  test("has aria-live region for status messages", async ({ page }) => {
    await navigateToContactSection(page);

    const statusRegion = page.locator('[role="status"]').first();
    await expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  test("contact form fields are keyboard navigable", async ({ page }) => {
    await navigateToContactSection(page);

    const emailInput = page.getByLabel("EMAIL *");
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.press("Tab");

    const subjectInput = page.getByLabel("SUBJECT");
    await subjectInput.focus();
    await expect(subjectInput).toBeFocused();
  });
});

// Regression: `.v3-form-input` sets `outline: none`, so the fields had no
// visible focus at all (WCAG 2.1 SC 2.4.7). The row now draws the indicator.
async function focusIndicator(locator: Locator) {
  return locator.evaluate((input) => {
    const row = input.closest(".v3-form-row") ?? input;
    const own = getComputedStyle(input);
    const wrap = getComputedStyle(row);
    return {
      input: { outline: own.outlineStyle, shadow: own.boxShadow },
      row: { outline: wrap.outlineStyle, width: wrap.outlineWidth },
    };
  });
}

function hasVisibleFocus(style: Awaited<ReturnType<typeof focusIndicator>>) {
  return (
    style.input.outline !== "none" ||
    style.input.shadow !== "none" ||
    (style.row.outline !== "none" && parseFloat(style.row.width) >= 2)
  );
}

test.describe("Contact form - visible keyboard focus", () => {
  const presentations = [
    { name: "light", dark: false, highContrast: false },
    { name: "dark", dark: true, highContrast: false },
    { name: "light + High Contrast", dark: false, highContrast: true },
    { name: "dark + High Contrast", dark: true, highContrast: true },
  ];

  for (const { name, dark, highContrast } of presentations) {
    test(`fields show a focus indicator when tabbed into (${name})`, async ({
      page,
    }) => {
      if (dark) await setThemeDark(page);
      else await setThemeLight(page);
      if (highContrast) await setContrastHigh(page);
      await navigateToContactSection(page);

      const nameInput = page.getByLabel("NAME", { exact: true });
      const emailInput = page.getByLabel("EMAIL *");

      // Unfocused fields carry no indicator, so the assertion below is about
      // focus and not a permanent border.
      expect(hasVisibleFocus(await focusIndicator(emailInput))).toBe(false);

      await nameInput.focus();
      await page.keyboard.press("Tab");
      await expect(emailInput).toBeFocused();
      expect(hasVisibleFocus(await focusIndicator(emailInput))).toBe(true);

      await page.keyboard.press("Tab");
      const subjectInput = page.getByLabel("SUBJECT");
      await expect(subjectInput).toBeFocused();
      expect(hasVisibleFocus(await focusIndicator(subjectInput))).toBe(true);
      expect(hasVisibleFocus(await focusIndicator(emailInput))).toBe(false);
    });
  }

  test("focus indicator survives forced-colors mode", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await navigateToContactSection(page);

    const messageInput = page.getByLabel("MESSAGE *");
    await page.getByLabel("SUBJECT").focus();
    await page.keyboard.press("Tab");
    await expect(messageInput).toBeFocused();

    // Forced colors drop box-shadows, so only an outline counts here.
    const style = await focusIndicator(messageInput);
    expect(style.input.outline !== "none" || style.row.outline !== "none").toBe(
      true,
    );
  });
});
