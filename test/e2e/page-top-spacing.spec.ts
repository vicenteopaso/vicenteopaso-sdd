import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// The home hero and CV masthead share --v3-page-top, so their first content
// sits the same distance below the nav rule.

async function gapBelowNav(page: Page, path: string): Promise<number> {
  await page.goto(path);
  return page.evaluate(() => {
    const header = document.querySelector("header");
    const first = document.querySelector(".v3-hero-label, .v3-cv-header-label");
    if (!header || !first) throw new Error("nav or first label not found");
    return Math.round(
      first.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
    );
  });
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 800, expected: 48 },
  { name: "mobile", width: 375, height: 812, expected: 16 },
]) {
  test(`home and CV start at the same height on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const home = await gapBelowNav(page, "/en");
    const cv = await gapBelowNav(page, "/en/cv");

    expect(home).toBe(viewport.expected);
    expect(cv).toBe(viewport.expected);
  });
}
