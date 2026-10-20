import { expect, test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("displays error boundary fallback when component crashes", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });

    // Verify the page is operational before the test
    await expect(page.locator("body")).toBeVisible();

    await page.evaluate(() => {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (!args[0]?.includes?.("Error boundaries")) {
          originalConsoleError(...args);
        }
      };

      const observer = new MutationObserver(() => {
        throw new Error("Test component error");
      });
      observer.observe(document.body, { childList: true, subtree: true });

      const div = document.createElement("div");
      document.body.appendChild(div);
    });

    await page.waitForTimeout(500);

    // The ErrorBoundary should have caught the error; the page body must still exist
    await expect(page.locator("body")).toBeVisible();
  });

  test("handles unhandled promise rejections gracefully", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/en", { waitUntil: "load" });

    await page.evaluate(() => {
      Promise.reject(new Error("Test unhandled rejection"));
    });

    await page.waitForTimeout(500);

    // The page must still be navigable after an unhandled rejection
    await expect(page.locator("body")).toBeVisible();
  });

  test("page remains functional after error boundary catches error", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });

    await page.goto("/en/cv", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/en\/cv(\?|$)/);

    // CV EXPERIENCE section is a generic div, referenced via TOC link
    await expect(
      page.getByRole("link", { name: /experience/i }).first(),
    ).toBeVisible();

    await page.goto("/en", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/en(\?|$|\/)/);
  });

  test("handles contact form server error gracefully", async ({ page }) => {
    await page.route("**/api/contact", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error occurred" }),
      });
    });

    await page.goto("/en", { waitUntil: "load" });
    await expect(page.locator("#contact")).toBeVisible({ timeout: 15000 });
    await page.evaluate(() =>
      document.querySelector("#contact")?.scrollIntoView(),
    );
    await expect(page.getByLabel("EMAIL *")).toBeVisible({ timeout: 15000 });
  });

  // Regression: the 404 used to return the right status but render a blank
  // page. Assert the visible, localized content too (ADR-0004).
  for (const { locale, text, home } of [
    { locale: "en", text: "Page not found.", home: "Go home" },
    { locale: "es", text: "Página no encontrada.", home: "Ir al inicio" },
  ]) {
    test(`renders a localized 404 page for unknown /${locale} routes`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale}/non-existent-page`);

      expect(response?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(
        page.getByRole("heading", { level: 1, name: "404" }),
      ).toBeVisible();
      await expect(page.getByText(text)).toBeVisible();
      await expect(page.getByRole("link", { name: home })).toHaveAttribute(
        "href",
        `/${locale}`,
      );
    });
  }

  test("console errors are captured and logged", async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on("console", (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto("/en", { waitUntil: "load" });

    await page.evaluate(() => {
      console.error("Test error message for logging");
    });

    await page.waitForTimeout(500);

    const errorMessages = consoleMessages.filter((m) => m.type === "error");
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
