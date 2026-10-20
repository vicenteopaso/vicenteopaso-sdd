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

  it("falls back to English site data for unsupported locales", () => {
    expect(getSiteData("fr" as never)).toEqual(enSiteData);
  });
});
