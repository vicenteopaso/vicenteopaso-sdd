import { describe, expect, it, vi } from "vitest";

describe("seo utilities", () => {
  it("returns localized CV description", async () => {
    const { getCvDescription } = await import("../../lib/seo");
    expect(getCvDescription("es")).toMatch("Roles Seleccionados");
    expect(getCvDescription("en")).toMatch("Selected Technical Leadership");
  });

  it("builds base metadata and applies overrides", async () => {
    const { baseMetadata, siteConfig } = await import("../../lib/seo");
    const metadata = baseMetadata({ title: "Custom Title" });

    expect(metadata.description).toBe(siteConfig.description);
    expect(metadata.openGraph?.url).toBe(siteConfig.url);
    expect(metadata.title).toBe("Custom Title");
  });

  it("preserves openGraph images when overriding only title and description", async () => {
    vi.resetModules();
    const { baseMetadata } = await import("../../lib/seo");
    const metadata = baseMetadata({
      openGraph: {
        title: "Custom OG Title",
        description: "Custom OG description",
      },
    });

    const images = metadata.openGraph?.images as { url: string }[];
    expect(images).toBeDefined();
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].url).toContain("opengraph-image");
    expect(metadata.openGraph?.title).toBe("Custom OG Title");
  });

  it("preserves twitter images when overriding only title", async () => {
    vi.resetModules();
    const { baseMetadata } = await import("../../lib/seo");
    const metadata = baseMetadata({
      twitter: { title: "Custom Twitter Title" },
    });

    const images = metadata.twitter?.images as string[];
    expect(images).toBeDefined();
    expect(images.length).toBeGreaterThan(0);
    expect(String(images[0])).toContain("opengraph-image");
    expect(metadata.twitter?.title).toBe("Custom Twitter Title");
  });

  it("uses default og cache version when env is unset", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    delete process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    vi.resetModules();

    const { baseMetadata } = await import("../../lib/seo");
    const metadata = baseMetadata();
    const images = metadata.openGraph?.images as { url: string }[];

    expect(images[0].url).toContain("v=1");

    if (originalEnv) {
      process.env.NEXT_PUBLIC_OG_CACHE_DATE = originalEnv;
    }
  });

  it("uses env-provided og cache version", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    process.env.NEXT_PUBLIC_OG_CACHE_DATE = "123";
    vi.resetModules();

    const { baseMetadata } = await import("../../lib/seo");
    const metadata = baseMetadata();
    const images = metadata.openGraph?.images as { url: string }[];

    expect(images[0].url).toContain("v=123");

    if (originalEnv) {
      process.env.NEXT_PUBLIC_OG_CACHE_DATE = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    }
  });

  it("builds canonical + hreflang alternates for every locale", async () => {
    const { localizedAlternates } = await import("../../lib/seo");

    expect(localizedAlternates("es", "/cv")).toEqual({
      canonical: "/es/cv",
      languages: { en: "/en/cv", es: "/es/cv", "x-default": "/en/cv" },
    });
    expect(localizedAlternates("en").canonical).toBe("/en");
  });

  it("builds locale-aware page metadata", async () => {
    const { pageMetadata } = await import("../../lib/seo");
    const metadata = pageMetadata({
      locale: "es",
      path: "/tech-stack",
      title: "Tech Stack",
      description: "Descripción",
      robots: { index: false, follow: true },
    });

    expect(metadata.title).toBe("Tech Stack");
    expect(metadata.description).toBe("Descripción");
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe("/es/tech-stack");
    expect(metadata.openGraph).toMatchObject({
      url: "https://opa.so/es/tech-stack",
      locale: "es_ES",
      alternateLocale: ["en_US"],
      title: "Tech Stack · Vicente Opaso",
    });
    // Falls back to the base social image when none is given.
    const images = metadata.openGraph?.images as { url: string }[];
    expect(images[0].url).toContain("/opengraph-image");
  });

  it("uses an explicit social image when provided", async () => {
    const { pageMetadata } = await import("../../lib/seo");
    const metadata = pageMetadata({
      locale: "en",
      description: "Home",
      images: "/en/opengraph-image?v=2",
    });

    // No page title → the root default title applies.
    expect(metadata.title).toMatchObject({
      default: expect.stringContaining("Vicente Opaso"),
    });
    expect(metadata.openGraph?.images).toEqual([
      { url: "/en/opengraph-image?v=2", width: 1200, height: 630 },
    ]);
    expect(metadata.twitter?.images).toEqual(["/en/opengraph-image?v=2"]);
  });

  it("escapes '<' when serializing JSON-LD so it cannot close the script tag", async () => {
    const { serializeJsonLd } = await import("../../lib/seo");
    const out = serializeJsonLd({ name: "</script><script>alert(1)" });

    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)");
  });

  it("returns localized WebSite JSON-LD", async () => {
    const { getWebsiteJsonLd } = await import("../../lib/seo");
    const website = getWebsiteJsonLd("es");

    expect(website["@type"]).toBe("WebSite");
    expect(website.url).toBe("https://opa.so/es");
    expect(website.inLanguage).toBe("es");
  });

  it("derives Person JSON-LD from the localized CV", async () => {
    const { getPersonJsonLd } = await import("../../lib/seo");
    const { loadCv } = await import("../../lib/cv");

    const en = getPersonJsonLd("en", loadCv("en"));
    expect(en["@type"]).toBe("Person");
    expect(en.name).toBe("Vicente Opaso");
    expect(en.jobTitle).toBe("Frontend Architect & Technical Leader");
    expect(en.knowsAbout.length).toBeGreaterThan(0);
    expect(en.sameAs.length).toBeGreaterThan(0);

    const es = getPersonJsonLd("es", loadCv("es"));
    expect(es.jobTitle).toBe("Arquitecto Frontend y Líder Técnico");
    expect(es.url).toBe("https://opa.so/es");
  });

  it("sets worksFor only while the latest position is current", async () => {
    const { getPersonJsonLd } = await import("../../lib/seo");
    const { loadCv } = await import("../../lib/cv");
    const cv = loadCv("en");
    const withEnd = (endDate: string | undefined) => ({
      ...cv,
      work: [
        {
          company: "Acme",
          positions: [{ position: "Architect", startDate: "2026-01", endDate }],
        },
        ...cv.work,
      ],
    });

    expect(getPersonJsonLd("en", withEnd(undefined)).worksFor).toEqual({
      "@type": "Organization",
      name: "Acme",
    });
    expect(getPersonJsonLd("en", withEnd("Present")).worksFor).toEqual({
      "@type": "Organization",
      name: "Acme",
    });
    // Every position in the real CV has ended, so nothing is claimed.
    expect(getPersonJsonLd("en", cv)).not.toHaveProperty("worksFor");
  });

  it("returns a CV page graph with ProfilePage, Person and publications", async () => {
    const { getCvPageJsonLd } = await import("../../lib/seo");
    const { loadCv } = await import("../../lib/cv");
    const cv = loadCv("en");
    const graph = getCvPageJsonLd("en", cv)["@graph"];

    expect(graph[0]).toMatchObject({
      "@type": "ProfilePage",
      url: "https://opa.so/en/cv",
      mainEntity: { "@id": "https://opa.so/#person" },
    });
    expect(graph[1]).toMatchObject({ "@type": "Person" });
    expect(graph[1]).not.toHaveProperty("@context");
    const articles = graph.filter(
      (node) => (node as { "@type": string })["@type"] === "Article",
    );
    expect(articles).toHaveLength(cv.publications.length);
  });

  it("returns Article JSON-LD for a localized path", async () => {
    const { getArticleJsonLd } = await import("../../lib/seo");

    expect(
      getArticleJsonLd({ locale: "es", path: "/articles/x", headline: "H" }),
    ).toMatchObject({
      "@type": "Article",
      headline: "H",
      url: "https://opa.so/es/articles/x",
      inLanguage: "es",
    });
  });
});
