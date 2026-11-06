import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Contrast contract for the v3 palettes in styles/globals.css
 * (docs/adr/0003-high-contrast-mode-conforming-alternate.md).
 *
 * The default palettes carry the owner's deep reds and are allowed the
 * documented exceptions. High Contrast follows one set of rules in both
 * themes and never lowers a ratio the default has.
 */

type Palette = Record<string, string>;

const css = readFileSync(join(process.cwd(), "styles/globals.css"), "utf8");
const v3 = css.slice(css.indexOf("V3 Brutalist Design System — tokens"));

function block(selector: string): Palette {
  const start = v3.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Missing ${selector} block`);
  const body = v3
    .slice(start, v3.indexOf("}", start))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens: Palette = {};
  for (const [, name, value] of body.matchAll(/(--v3-[\w-]+):\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

function resolve(palette: Palette, name: string): string {
  const value = palette[name];
  if (!value) throw new Error(`Undefined token ${name}`);
  const ref = /^var\((--v3-[\w-]+)\)$/.exec(value);
  return ref ? resolve(palette, ref[1]) : value;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(palette: Palette, fg: string, bg: string): number {
  const [hi, lo] = [resolve(palette, fg), resolve(palette, bg)]
    .map(luminance)
    .sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const base = block(":root");
const darkOverrides = block(".dark");
const highContrast = block(':root[data-contrast="more"]');
const darkHighContrast = block(':root.dark[data-contrast="more"]');

const light: Palette = { ...base };
const dark: Palette = { ...base, ...darkOverrides };
const palettes = {
  light: { normal: light, high: { ...light, ...highContrast } },
  dark: {
    normal: dark,
    high: { ...dark, ...highContrast, ...darkHighContrast },
  },
};

// [text token, surface token]
const TEXT_PAIRS = [
  ["--v3-fg", "--v3-bg"],
  ["--v3-fg", "--v3-elevated"],
  ["--v3-muted", "--v3-bg"],
  ["--v3-muted", "--v3-elevated"],
  ["--v3-accent-text", "--v3-bg"],
  ["--v3-accent-text", "--v3-elevated"],
  ["--v3-on-accent", "--v3-accent"],
  ["--v3-accent-inverse", "--v3-fg"],
] as const;

describe.each(["light", "dark"] as const)("%s theme", (theme) => {
  const { normal, high } = palettes[theme];

  describe("High Contrast", () => {
    it.each(TEXT_PAIRS)("%s on %s meets 4.5:1", (fg, bg) => {
      expect(ratio(high, fg, bg)).toBeGreaterThanOrEqual(4.5);
    });

    it("muted text meets 7:1 (AAA) on the page background", () => {
      expect(ratio(high, "--v3-muted", "--v3-bg")).toBeGreaterThanOrEqual(7);
    });

    it("rules meet 3:1, so cards and form fields are outlined", () => {
      expect(ratio(high, "--v3-rule", "--v3-bg")).toBeGreaterThanOrEqual(3);
    });

    // Filled buttons are the one exception: the dark default puts cream on
    // the deep red (6.2:1), High Contrast puts black on the lighter red
    // (5.5:1). Both pass AA; matching 6.2:1 would need a pink fill.
    it.each([
      ...TEXT_PAIRS.filter(([fg]) => fg !== "--v3-on-accent"),
      ["--v3-rule", "--v3-bg"] as const,
    ])("%s on %s is never lower than the default", (fg, bg) => {
      expect(ratio(high, fg, bg)).toBeGreaterThanOrEqual(ratio(normal, fg, bg));
    });
  });

  describe("default", () => {
    it.each([
      ["--v3-fg", "--v3-bg"],
      ["--v3-muted", "--v3-bg"],
      ["--v3-muted", "--v3-elevated"],
      ["--v3-on-accent", "--v3-accent"],
    ] as const)("%s on %s meets 4.5:1", (fg, bg) => {
      expect(ratio(normal, fg, bg)).toBeGreaterThanOrEqual(4.5);
    });

    it("red on inverted blocks meets 3:1 (large headings only)", () => {
      expect(
        ratio(normal, "--v3-accent-inverse", "--v3-fg"),
      ).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("default accents", () => {
  it("keep the owner's deep reds", () => {
    expect(resolve(palettes.light.normal, "--v3-accent")).toBe("#9b1219");
    expect(resolve(palettes.dark.normal, "--v3-accent")).toBe("#b3141c");
  });

  it("meet 4.5:1 in light and 3:1 in dark, where High Contrast covers small text", () => {
    expect(
      ratio(palettes.light.normal, "--v3-accent", "--v3-bg"),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      ratio(palettes.dark.normal, "--v3-accent", "--v3-bg"),
    ).toBeGreaterThanOrEqual(3);
  });
});
