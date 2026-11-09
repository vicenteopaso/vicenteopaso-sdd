import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// Visitors land on their OS theme; see lib/theme.ts.

async function visibleLogo(page: Page): Promise<string> {
  const src = await page
    .locator(".v3-nav-logo-img:visible")
    .getAttribute("src");
  return src ?? "";
}

for (const scheme of ["light", "dark"] as const) {
  test(`lands on the OS ${scheme} theme with no stored choice`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/en");

    await expect(page.locator("html")).toHaveClass(
      scheme === "dark" ? /\bdark\b/ : /\blight\b/,
    );
    expect(await visibleLogo(page)).toContain(
      scheme === "dark" ? "logo_dark.png" : "logo.png",
    );
  });
}

test("shows the light logo and moon glyph before hydration on a light OS", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  // Block the app's JS chunks so React never hydrates (CSS shares the chunks
  // path, so only .js is blocked). The inline next-themes script in the
  // server HTML still sets the theme class, which is all the CSS needs.
  await page.route(
    (url) =>
      url.pathname.startsWith("/_next/static/chunks/") &&
      url.pathname.endsWith(".js"),
    (route) => route.abort(),
  );
  await page.goto("/en");

  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await expect(page.locator(".v3-nav-logo-img--light")).toBeVisible();
  await expect(page.locator(".v3-nav-logo-img--dark")).toBeHidden();
  await expect(page.locator(".v3-theme-glyph--moon")).toBeVisible();
  await expect(page.locator(".v3-theme-glyph--sun")).toBeHidden();
});

test("the toggle pins the opposite theme, and switching back follows the OS again", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en");
  const toggle = page.getByRole("button", { name: "Toggle color theme" });

  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
    "light",
  );

  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
    "system",
  );

  // Following the OS again: an OS change now carries through.
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
});
