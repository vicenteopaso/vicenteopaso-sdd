import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AgentJobSearchArticlePage, {
  generateMetadata,
} from "../../app/[lang]/articles/8-agent-job-search-system/page";

describe("AgentJobSearchArticlePage", () => {
  it("renders the article title and body for the English locale", async () => {
    const ui = await AgentJobSearchArticlePage({
      params: Promise.resolve({ lang: "en" }),
    });

    render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Inside an 8-Agent System Running My Job Search/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Concierge/).length).toBeGreaterThan(0);
  });

  it("renders the translated article for the Spanish locale", async () => {
    const ui = await AgentJobSearchArticlePage({
      params: Promise.resolve({ lang: "es" }),
    });

    render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Dentro de un sistema de 8 agentes/i,
      }),
    ).toBeInTheDocument();
  });

  it("marks the page as noindex so it stays unlisted", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: "en" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("uses the localized frontmatter title with canonical and hreflang", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: "es" }),
    });

    expect(metadata.title).toMatch(/Dentro de un sistema de 8 agentes/);
    expect(metadata.alternates?.canonical).toBe(
      "/es/articles/8-agent-job-search-system",
    );
    expect(metadata.alternates?.languages).toMatchObject({
      en: "/en/articles/8-agent-job-search-system",
      "x-default": "/en/articles/8-agent-job-search-system",
    });
  });

  it("server-renders Article JSON-LD", async () => {
    const ui = await AgentJobSearchArticlePage({
      params: Promise.resolve({ lang: "en" }),
    });
    const { container } = render(ui);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );

    expect(JSON.parse(script?.textContent ?? "null")).toMatchObject({
      "@type": "Article",
      url: "https://opa.so/en/articles/8-agent-job-search-system",
    });
  });
});
