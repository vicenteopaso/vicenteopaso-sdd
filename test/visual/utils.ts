import type { Locator, Page } from "@playwright/test";

// Shared selectors for visual tests
export const PORTRAIT_SELECTOR = 'img[alt*="Portrait"]';
export const REFERENCES_SECTION_SELECTOR = "#cv-references";
const NEXT_DEVTOOLS_HOST_SELECTORS =
  "nextjs-portal, script[data-nextjs-dev-overlay]";

// Theme helpers for next-themes: ensure deterministic light/dark
export async function setThemeLight(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("theme", "light");
    // Set flag to indicate Playwright test environment
    // This will be checked by AnalyticsWrapper to prevent Speed Insights from loading
    (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ = true;
  });
  await page.emulateMedia({ colorScheme: "light" });
}

export async function setThemeDark(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
    // Set flag to indicate Playwright test environment
    // This will be checked by AnalyticsWrapper to prevent Speed Insights from loading
    (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ = true;
  });
  await page.emulateMedia({ colorScheme: "dark" });
}

// High Contrast mode (lib/contrast.ts): seed the stored preference before load,
// the way a returning visitor who switched it on arrives.
export async function setContrastHigh(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("contrast", "more");
  });
}

export async function setFixedProfilePhotoIndex(
  page: Page,
  index: number,
): Promise<void> {
  await page.addInitScript((fixedIndex) => {
    (
      window as Window & {
        __PROFILE_PHOTO_INDEX__?: number;
      }
    ).__PROFILE_PHOTO_INDEX__ = fixedIndex;
  }, index);
}

// Wait until document height is stable for N consecutive checks
export async function waitForStableHeight(
  page: Page,
  consecutive: number = 3,
  intervalMs: number = 100,
): Promise<void> {
  await page.evaluate(
    (args) => {
      const { consecutive, intervalMs } = args as {
        consecutive: number;
        intervalMs: number;
      };
      return new Promise<void>((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let stableCount = 0;
        let iterations = 0;
        const maxIterations = 50; // Max 5 seconds with 100ms interval
        const checkHeight = setInterval(() => {
          iterations++;
          const currentHeight = document.body.scrollHeight;
          if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= consecutive) {
              clearInterval(checkHeight);
              resolve();
            }
          } else {
            stableCount = 0;
            lastHeight = currentHeight;
          }
          if (iterations >= maxIterations) {
            clearInterval(checkHeight);
            resolve();
          }
        }, intervalMs);
      });
    },
    { consecutive, intervalMs },
  );
}

// Disable pointer events on carousels to prevent user-driven changes
export async function freezeCarouselInteractions(
  page: Page,
  selector: string,
): Promise<void> {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const buttons = el.querySelectorAll("button");
    buttons.forEach((btn) => (btn.style.pointerEvents = "none"));
  }, selector);
}

// Wait for a target element's transform to remain stable
export async function waitForStableTransform(
  page: Page,
  selector: string,
  consecutive: number = 3,
  intervalMs: number = 100,
): Promise<void> {
  await page.evaluate(
    (args) => {
      const { selector, consecutive, intervalMs } = args as {
        selector: string;
        consecutive: number;
        intervalMs: number;
      };
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return;
      return new Promise<void>((resolve) => {
        let lastTransform = getComputedStyle(el).transform;
        let stableCount = 0;
        let iterations = 0;
        const maxIterations = 50; // Max 5 seconds with 100ms interval
        const check = setInterval(() => {
          iterations++;
          const currentTransform = getComputedStyle(el).transform;
          if (currentTransform === lastTransform) {
            stableCount++;
            if (stableCount >= consecutive) {
              clearInterval(check);
              resolve();
            }
          } else {
            stableCount = 0;
            lastTransform = currentTransform;
          }
          if (iterations >= maxIterations) {
            clearInterval(check);
            resolve();
          }
        }, intervalMs);
      });
    },
    { selector, consecutive, intervalMs },
  );
}

// Freeze references carousel buttons to prevent auto-rotation during screenshots
export async function freezeReferencesCarousel(page: Page): Promise<void> {
  await page.evaluate((selector) => {
    const section = document.querySelector(selector);
    if (!section) return;
    const buttons = section.querySelectorAll("button");
    buttons.forEach((btn) => {
      (btn as HTMLButtonElement).style.pointerEvents = "none";
    });
  }, REFERENCES_SECTION_SELECTOR);
}

// Get portrait mask locator for visual tests
export function getPortraitMask(page: Page): Locator {
  return page.locator(PORTRAIT_SELECTOR);
}

// Shared masks for pages
export async function homepageMasks(page: Page): Promise<Locator[]> {
  return [
    page.locator(PORTRAIT_SELECTOR),
    page.locator('[data-testid="impact-cards"]'),
  ];
}

export async function cvPageMasks(page: Page): Promise<Locator[]> {
  return [page.locator(REFERENCES_SECTION_SELECTOR)];
}

// Hide the Next.js devtools/issues indicator and overlay host during screenshots.
// This keeps visual baselines stable even if dev-only tooling appears.
export async function hideNextDevtools(page: Page): Promise<void> {
  await page.evaluate((selectors) => {
    const globalWindow = window as Window & {
      __VISUAL_TEST_NEXTJS_UI_HIDDEN__?: boolean;
    };

    if (globalWindow.__VISUAL_TEST_NEXTJS_UI_HIDDEN__) {
      document.querySelectorAll(selectors).forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
      return;
    }

    const hideElements = () => {
      document.querySelectorAll(selectors).forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
    };

    hideElements();

    const observer = new MutationObserver(() => {
      hideElements();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    globalWindow.__VISUAL_TEST_NEXTJS_UI_HIDDEN__ = true;
  }, NEXT_DEVTOOLS_HOST_SELECTORS);
}

// Wait for CV page to be fully loaded and ready for screenshot
export async function waitForCVPage(page: Page): Promise<void> {
  // Wait for basic page load
  await page.waitForLoadState("domcontentloaded");

  // Wait for CV heading to be visible
  await page.waitForSelector("h1", { state: "visible", timeout: 10000 });

  // Wait for footer to ensure page is mostly rendered
  await page.waitForSelector("footer", { state: "visible", timeout: 10000 });

  // Hide any Next.js dev overlay/devtools UI that could otherwise pollute snapshots
  await hideNextDevtools(page);

  // Short delay to let things settle
  await page.waitForTimeout(200);
}

// Wait for homepage to be fully loaded and ready for screenshot
export async function waitForHomepage(page: Page): Promise<void> {
  // Wait for basic page load
  await page.waitForLoadState("domcontentloaded");

  // Wait for footer to ensure page is mostly rendered
  await page.waitForSelector("footer", { state: "visible", timeout: 10000 });

  // Hide any Next.js dev overlay/devtools UI that could otherwise pollute snapshots
  await hideNextDevtools(page);

  // Freeze carousel if it exists
  await page
    .evaluate(() => {
      const carousel = document.querySelector('[data-testid="impact-cards"]');
      if (carousel) {
        const buttons = carousel.querySelectorAll("button");
        buttons.forEach(
          (btn) => ((btn as HTMLButtonElement).style.pointerEvents = "none"),
        );
      }
    })
    .catch(() => {});

  // Short delay to let things settle
  await page.waitForTimeout(200);
}
