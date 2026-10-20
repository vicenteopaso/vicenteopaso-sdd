import { describe, expect, it } from "vitest";

import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { INDEXABLE_PATHS } from "../../lib/seo";

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every indexable page once per locale", () => {
    expect(entries).toHaveLength(INDEXABLE_PATHS.length * 2);
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain("https://opa.so/en");
    expect(urls).toContain("https://opa.so/es/cv");
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("pairs each URL with absolute hreflang alternates", () => {
    const esCv = entries.find((entry) => entry.url === "https://opa.so/es/cv");

    expect(esCv?.alternates?.languages).toEqual({
      en: "https://opa.so/en/cv",
      es: "https://opa.so/es/cv",
      "x-default": "https://opa.so/en/cv",
    });
  });

  it("excludes unlisted pages", () => {
    const urls = entries.map((entry) => entry.url).join(" ");

    expect(urls).not.toMatch(/found-luggage|lost-luggage|articles/);
  });
});

describe("robots", () => {
  it("allows crawling and points at the generated sitemap", () => {
    const result = robots();

    expect(result.sitemap).toBe("https://opa.so/sitemap.xml");
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });
});
