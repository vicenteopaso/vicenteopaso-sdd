import { describe, expect, it } from "vitest";

import enSiteData from "../../i18n/en/site-data.json";
import { getSiteData } from "../../lib/site-data";

describe("site data helpers", () => {
  it("returns English site data by default", () => {
    expect(getSiteData()).toEqual(enSiteData);
  });

  it("returns Spanish site data when requested", () => {
    const data = getSiteData("es");

    expect(data).not.toEqual(enSiteData);
    expect(data.cvToc.length).toBeGreaterThan(0);
    expect(data.tldr.length).toBeGreaterThan(0);
  });

  it.each(["en", "es"] as const)(
    "gives every %s TL;DR row a label, with AI second and Hands-on third",
    (locale) => {
      const { tldr, tldrLabels } = getSiteData(locale);

      expect(tldrLabels).toHaveLength(tldr.length);
      expect(tldrLabels[1]).toBe(locale === "en" ? "AI" : "IA");
      expect(tldrLabels[2]).toBe(locale === "en" ? "HANDS-ON" : "PRÁCTICA");
    },
  );

  it.each(["en", "es"] as const)(
    "leads the %s focus areas with AI-native engineering",
    (locale) => {
      expect(getSiteData(locale).focus[0]?.h).toMatch(/AI-Native|nativa en IA/);
    },
  );

  it.each(["en", "es"] as const)(
    "keeps telecom out of the %s experience stats",
    (locale) => {
      const stats = getSiteData(locale)
        .impact.map((item) => item.v)
        .join(" ");

      expect(stats).not.toMatch(/telecom|telco/i);
    },
  );

  it("falls back to English site data for unsupported locales", () => {
    expect(getSiteData("fr" as never)).toEqual(enSiteData);
  });
});
