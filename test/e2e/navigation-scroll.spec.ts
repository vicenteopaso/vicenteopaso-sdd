import { expect, test } from "@playwright/test";

// Route changes land at the very top of the new page. globals.css sets
// `scroll-behavior: smooth`; without data-scroll-behavior="smooth" on <html>,
// Next 16 animates the scroll-to-top, cuts it short, and the page lands
// 70px down with its first line under the sticky nav.

test("a footer link from the bottom of the page lands at the top", async ({
  page,
}) => {
  await page.goto("/en");
  await page
    .locator("footer")
    .getByRole("link", { name: "Privacy Policy" })
    .click();

  await expect(page).toHaveURL(/\/en\/privacy-policy$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("CV after Contact lands at the top of the CV", async ({ page }) => {
  await page.goto("/en");
  const nav = page.getByRole("navigation", { name: "Main navigation" });

  await nav.getByRole("link", { name: "Contact" }).click();
  // Let the smooth in-page scroll to #contact finish, as a reader would.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const before = window.scrollY;
        await new Promise((resolve) => setTimeout(resolve, 200));
        return before > 0 && window.scrollY === before;
      }),
    )
    .toBe(true);

  await nav.getByRole("link", { name: "CV" }).click();
  await expect(page).toHaveURL(/\/en\/cv$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
