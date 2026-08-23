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
    const metadata = await generateMetadata();

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});
