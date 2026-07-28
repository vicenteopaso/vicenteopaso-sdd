import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { setThemeLight } from "../visual/utils";

const LOCALES = ["en", "es"] as const;

const ROUTES = [
  { name: "home", path: "" },
  { name: "cv", path: "/cv" },
  { name: "accessibility", path: "/accessibility" },
  { name: "cookie-policy", path: "/cookie-policy" },
  { name: "privacy-policy", path: "/privacy-policy" },
  { name: "tech-stack", path: "/tech-stack" },
  { name: "technical-governance", path: "/technical-governance" },
] as const;

// Advisory-only floor: below ~12px text becomes difficult to read for most
// users regardless of contrast/weight. Logged as a warning, not a hard fail —
// this site's design intentionally uses small mono labels/meta text in places.
const MIN_FONT_SIZE_PX = 12;

// Advisory-only floor: comfortable body-reading size. Logged as a warning,
// does not fail the build — 12-16px is common for captions/labels/UI chrome.
const RECOMMENDED_BODY_FONT_SIZE_PX = 16;

// WCAG 1.4.8 (AAA, not a hard AA requirement) recommends line spacing of at
// least 1.5x within paragraphs. Advisory-only for the same reason.
const RECOMMENDED_LINE_HEIGHT_RATIO = 1.5;

// Below this size, sub-regular font weights (thin/light) hurt legibility.
// Advisory-only: no WCAG success criterion mandates a minimum font-weight.
const THIN_WEIGHT_SIZE_THRESHOLD_PX = 14;
const THIN_WEIGHT_MIN = 400;

interface TextSample {
  text: string;
  fontSizePx: number;
  lineHeightPx: number | null;
  fontWeight: number;
  tag: string;
}

async function collectVisibleTextSamples(page: Page): Promise<TextSample[]> {
  return page.evaluate(() => {
    const samples: {
      text: string;
      fontSizePx: number;
      lineHeightPx: number | null;
      fontWeight: number;
      tag: string;
    }[] = [];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const text = node.textContent?.trim();
          if (!text) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(parent);
          if (style.display === "none" || style.visibility === "hidden") {
            return NodeFilter.FILTER_REJECT;
          }
          const rect = parent.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let node: Node | null;
    // eslint-disable-next-line no-cond-assign
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent) continue;
      const style = window.getComputedStyle(parent);
      const fontSizePx = parseFloat(style.fontSize);
      const lineHeightRaw = style.lineHeight;
      const lineHeightPx =
        lineHeightRaw === "normal" ? null : parseFloat(lineHeightRaw);

      samples.push({
        text: (node.textContent ?? "").trim().slice(0, 80),
        fontSizePx,
        lineHeightPx: Number.isNaN(lineHeightPx as number)
          ? null
          : lineHeightPx,
        fontWeight: parseInt(style.fontWeight, 10) || 400,
        tag: parent.tagName.toLowerCase(),
      });
    }

    return samples;
  });
}

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    test.describe(`typography — ${route.name} (${locale})`, () => {
      test("readability warnings (font size, line-height, weight) are surfaced", async ({
        page,
      }) => {
        await setThemeLight(page);
        await page.goto(`/${locale}${route.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("footer", {
          state: "visible",
          timeout: 10000,
        });

        const samples = await collectVisibleTextSamples(page);
        expect(samples.length).toBeGreaterThan(0);

        // Everything below is advisory-only (logged, not failed). This site's
        // "brutalist" design system intentionally uses small mono labels/meta
        // text (down to ~9px) in places, so a hard floor here would fight the
        // design rather than catch a bug — unlike the WCAG 1.4.10/1.4.12 checks
        // below, which are real AA success criteria.
        const tooSmall = samples.filter((s) => s.fontSizePx < MIN_FONT_SIZE_PX);
        const belowRecommended = samples.filter(
          (s) =>
            s.fontSizePx >= MIN_FONT_SIZE_PX &&
            s.fontSizePx < RECOMMENDED_BODY_FONT_SIZE_PX,
        );
        const tightLineHeight = samples.filter(
          (s) =>
            s.lineHeightPx !== null &&
            s.lineHeightPx / s.fontSizePx < RECOMMENDED_LINE_HEIGHT_RATIO,
        );
        const thinSmallText = samples.filter(
          (s) =>
            s.fontSizePx < THIN_WEIGHT_SIZE_THRESHOLD_PX &&
            s.fontWeight < THIN_WEIGHT_MIN,
        );

        if (tooSmall.length > 0) {
          console.warn(
            `[readability] ${tooSmall.length} text node(s) below the ${MIN_FONT_SIZE_PX}px legibility floor on ${locale}${route.path || "/"}`,
          );
        }
        if (belowRecommended.length > 0) {
          console.warn(
            `[readability] ${belowRecommended.length} text node(s) below the recommended ${RECOMMENDED_BODY_FONT_SIZE_PX}px body size on ${locale}${route.path || "/"}`,
          );
        }
        if (tightLineHeight.length > 0) {
          console.warn(
            `[readability] ${tightLineHeight.length} text node(s) with line-height under ${RECOMMENDED_LINE_HEIGHT_RATIO}x font-size on ${locale}${route.path || "/"}`,
          );
        }
        if (thinSmallText.length > 0) {
          console.warn(
            `[readability] ${thinSmallText.length} small text node(s) under font-weight ${THIN_WEIGHT_MIN} at <${THIN_WEIGHT_SIZE_THRESHOLD_PX}px on ${locale}${route.path || "/"}`,
          );
        }
      });

      test("reflows to 320px width without horizontal scrolling (WCAG 1.4.10)", async ({
        page,
      }) => {
        await setThemeLight(page);
        await page.setViewportSize({ width: 320, height: 900 });
        await page.goto(`/${locale}${route.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("footer", {
          state: "visible",
          timeout: 10000,
        });

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        // Small tolerance for sub-pixel rounding.
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });

      test("survives the WCAG 1.4.12 text-spacing override without clipping content", async ({
        page,
      }) => {
        await setThemeLight(page);
        await page.goto(`/${locale}${route.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("footer", {
          state: "visible",
          timeout: 10000,
        });

        // The standard WCAG 1.4.12 test override: user agents must let users
        // apply this stylesheet without loss of content or functionality.
        await page.addStyleTag({
          content: `
            * {
              line-height: 1.5 !important;
              letter-spacing: 0.12em !important;
              word-spacing: 0.16em !important;
            }
            p {
              margin-bottom: 2em !important;
            }
          `,
        });

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

        // Footer/nav should remain visible and not have collapsed to zero size.
        await expect(page.locator("footer")).toBeVisible();
      });
    });
  }
}
