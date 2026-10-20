import { render, screen } from "@testing-library/react";
import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CVPage from "../../app/[lang]/cv/page";

const realReadFileSync = fs.readFileSync;

type CvFixture = Record<string, unknown> & {
  basics?: Record<string, unknown>;
};

/**
 * Mocks content/<locale>/cv.json. Object fixtures are merged onto the minimum
 * valid CV (lib/cv.ts schema) so each test only states the fields it covers;
 * string fixtures are served verbatim (e.g. to exercise invalid JSON).
 */
function mockCvFs({
  locale = "en",
  cvJson,
}: {
  locale?: string;
  cvJson: CvFixture | string;
}) {
  const cvContent =
    typeof cvJson === "string"
      ? cvJson
      : JSON.stringify({
          name: "Vicente Opaso",
          title: "Vicente Opaso",
          slug: "cv",
          work: [],
          ...cvJson,
          basics: {
            name: "Vicente Opaso",
            label: "Engineering leader",
            ...cvJson.basics,
          },
        });

  vi.spyOn(fs, "readFileSync").mockImplementation(
    (filePath, options): string => {
      const file = String(filePath);

      if (file.endsWith(`${locale}/cv.json`)) {
        return cvContent;
      }

      const fallbackContent = realReadFileSync(filePath, options as never);
      return typeof fallbackContent === "string"
        ? fallbackContent
        : fallbackContent.toString("utf8");
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CVPage", () => {
  it("fails the render (and therefore the build) when CV JSON is invalid", async () => {
    mockCvFs({
      locale: "en",
      cvJson: "this is not valid json",
    });

    await expect(
      CVPage({ params: Promise.resolve({ lang: "en" }) }),
    ).rejects.toThrow("Failed to read content/en/cv.json");
  });

  it("rejects HTML markup in CV text instead of rendering it", async () => {
    mockCvFs({
      locale: "en",
      cvJson: {
        basics: { summary: "<p>Summary</p><script>alert(1)</script>" },
      },
    });

    await expect(
      CVPage({ params: Promise.resolve({ lang: "en" }) }),
    ).rejects.toThrow(/basics\.summary — must be plain text/);
  });

  it("renders CV sections when JSON is valid", async () => {
    const cvJson = {
      basics: {
        name: "Vicente Opaso",
        label: "Engineering leader",
        summary: "Summary text",
        highlights: [
          "Led teams",
          {
            title: "Technical leadership",
            content: "Built modern web platforms",
          },
        ],
      },
      work: [
        {
          company: "Acme Corp",
          location: "Remote",
          positions: [
            {
              position: "Staff Engineer",
              summary: "Did important things",
              startDate: "2020",
              endDate: "2024",
              highlights: ["Shipped features"],
              skills: ["TypeScript", "Next.js"],
            },
          ],
        },
      ],
      education: [
        {
          institution: "Example University",
          area: "Computer Science",
          studyType: "BSc",
          startDate: "2010",
          endDate: "2014",
        },
      ],
      skills: [
        {
          name: "Languages",
          level: "Expert",
          keywords: ["TypeScript", "JavaScript"],
        },
      ],
      languages: [
        {
          language: "English",
          fluency: "Native",
        },
      ],
      interests: [
        {
          name: "Mentoring",
          keywords: ["Leadership", "Coaching"],
        },
      ],
      publications: [
        {
          name: "Great Article",
          publisher: "Tech Journal",
          releaseDate: "2023",
          url: "https://example.com/article",
        },
      ],
      references: [
        {
          name: "Someone",
          role: "Peer",
          url: "https://example.com/someone",
          paragraphs: ["Vicente is great to work with.", "Second paragraph."],
        },
      ],
    };

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    // Header
    expect(
      screen.getByRole("heading", { name: /Vicente\s*Opaso/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Engineering leader")).toBeInTheDocument();

    // Sections
    expect(screen.getAllByText("SUMMARY").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("EXPERIENCE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("SKILLS").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("EDUCATION · LANGUAGES").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("PUBLICATIONS").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("REFERENCES").length).toBeGreaterThanOrEqual(1);

    // Experience content
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("REMOTE")).toBeInTheDocument();

    // References carousel rendered (at least one visible copy)
    expect(
      screen.getAllByText(/Vicente is great to work with/i).length,
    ).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Summary text")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Someone" })[0]).toHaveAttribute(
      "href",
      "https://example.com/someone",
    );

    // ProfilePage JSON-LD is server-rendered with the page.
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    expect(
      JSON.parse(jsonLd?.textContent ?? "null")["@graph"][0],
    ).toMatchObject({ "@type": "ProfilePage", url: "https://opa.so/en/cv" });
  });

  it("renders governance and steering groups when provided", async () => {
    const cvJson = {
      basics: {
        name: "Vicente Opaso",
      },
      governance: [
        {
          group: "Software Engineering Leadership Team",
          organization: "Carlsberg Group, Growth Products & Data",
          summary:
            "Defined software design standards and architecture direction.",
        },
        {
          group: "Beacon Council",
        },
      ],
      references: [
        {
          name: "Reference Person",
          role: "Peer",
          paragraphs: ["Reference text"],
        },
      ],
    };

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(
      screen.getAllByText("GOVERNANCE & STEERING GROUPS").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Software Engineering Leadership Team"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("CARLSBERG GROUP, GROWTH PRODUCTS & DATA"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Defined software design standards/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Beacon Council")).toBeInTheDocument();
    expect(
      screen.getAllByText("Reference Person").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("handles minimal CV JSON and optional branches", async () => {
    const cvJson = {
      basics: {
        name: "SingleName",
      },
      work: [],
      education: [
        {
          institution: "Minimal University",
        },
      ],
      skills: [
        {
          name: "Tools",
        },
      ],
      languages: [
        {
          language: "Spanish",
        },
      ],
      interests: [
        {
          name: "Hiking",
        },
      ],
      publications: [
        {
          name: "Offline Article",
          publisher: "Print Journal",
        },
      ],
      references: [],
    };

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(
      screen.getByRole("heading", { name: /SingleName/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tech Corp")).toBeNull();
    expect(
      screen.getAllByText("EDUCATION · LANGUAGES").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Minimal University")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("Offline Article").closest("a")).not.toBeNull();
  });

  it("handles CV with all optional fields missing", async () => {
    mockCvFs({
      locale: "en",
      cvJson: { basics: { name: "Test Person" } },
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(
      screen.getByRole("heading", { name: /Test\s*Person/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("SUMMARY").length).toBeGreaterThanOrEqual(1);
    expect(document.getElementById("cv-experience")).toBeNull();
    expect(document.getElementById("cv-references")).toBeNull();
  });

  it("shows the localized label for an ongoing position", async () => {
    mockCvFs({
      locale: "es",
      cvJson: {
        work: [
          {
            company: "Acme",
            positions: [{ position: "Arquitecto", startDate: "2026-01" }],
          },
        ],
      },
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "es" }) });

    render(ui);

    expect(screen.getByText(/2026-01\s*→\s*Actualidad/)).toBeInTheDocument();
  });

  it("renders work experience with multiple positions", async () => {
    const cvJson = {
      basics: {
        name: "Test User",
      },
      work: [
        {
          company: "Tech Corp",
          location: "San Francisco",
          positions: [
            {
              position: "Senior Engineer",
              startDate: "2022",
              endDate: "2024",
              summary: "Current role",
              highlights: ["Built systems"],
              skills: ["React", "Node.js"],
            },
            {
              position: "Engineer",
              startDate: "2020",
              endDate: "2022",
              summary: "Previous role",
              highlights: [],
              skills: [],
            },
          ],
        },
      ],
    };

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("SAN FRANCISCO")).toBeInTheDocument();
  });

  it("renders the shared TLDR content when work highlights are absent", async () => {
    const cvJson = {
      basics: {
        name: "Test User",
      },
    };

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByText(/TL;DR —/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /I lead engineering teams and architect frontend platforms\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders skills sorted by proficiency rank then alphabetically", async () => {
    const cvJson = {
      basics: { name: "Test User" },
      skills: [
        { name: "Zsh", level: "Beginner" },
        { name: "TypeScript", level: "Master" },
        { name: "React", level: "Advanced" },
        { name: "Go", level: "Intermediate" },
        { name: "Rust", level: "Advanced" },
        { name: "Node.js", level: "Master" },
      ],
    };

    mockCvFs({ locale: "en", cvJson });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });
    render(ui);

    const skillNames = screen
      .getAllByText(/TypeScript|Node\.js|React|Rust|Go|Zsh/)
      .map((el) => el.textContent);

    // master level before advanced, advanced before intermediate, intermediate before beginner
    const tsIdx = skillNames.indexOf("TypeScript");
    const nodeIdx = skillNames.indexOf("Node.js");
    const reactIdx = skillNames.indexOf("React");
    const rustIdx = skillNames.indexOf("Rust");
    const goIdx = skillNames.indexOf("Go");
    const zshIdx = skillNames.indexOf("Zsh");

    // Both Master-level skills should appear before Advanced-level skills
    expect(Math.max(tsIdx, nodeIdx)).toBeLessThan(Math.min(reactIdx, rustIdx));
    // Both Advanced-level skills should appear before Intermediate
    expect(Math.max(reactIdx, rustIdx)).toBeLessThan(goIdx);
    // Intermediate before Beginner
    expect(goIdx).toBeLessThan(zshIdx);
    // Within Master: Node.js < TypeScript (alphabetical)
    expect(nodeIdx).toBeLessThan(tsIdx);
    // Within Advanced: React < Rust (alphabetical)
    expect(reactIdx).toBeLessThan(rustIdx);
  });
});

describe("CV Page Masthead Actions", () => {
  const mockCVData = {
    basics: {
      name: "Vicente Opaso",
    },
    education: [],
    work: [],
    skills: [],
    languages: [],
    publications: [],
    references: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the primary masthead actions", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByRole("link", { name: /DOWNLOAD PDF/i })).toHaveAttribute(
      "href",
      "/en/cv/download",
    );
    expect(
      screen.getByRole("link", { name: /jump to contact section/i }),
    ).toHaveAttribute("href", "#contact");
  });

  it("renders the end CTA links with the current labels", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByRole("link", { name: /GET IN TOUCH/i })).toHaveAttribute(
      "href",
      "/en#contact",
    );
    expect(screen.getByRole("link", { name: /LINKEDIN/i })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/vicenteopaso",
    );
  });

  it("renders the portrait image with descriptive alt text", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByAltText("Vicente Opaso")).toBeInTheDocument();
  });

  it("renders the LinkedIn CTA as an external link", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    const linkedin = screen.getByRole("link", { name: /LINKEDIN/i });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noreferrer");
  });

  it("renders the email CTA in the footer block", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(
      screen.getByRole("link", { name: /email vicente directly/i }),
    ).toHaveAttribute("href", "mailto:vicente@opa.so");
  });

  // WCAG 2.5.3 Label in Name (axe: label-content-name-mismatch): an aria-label
  // must contain the visible text, or voice-control users can't target it.
  it.each(["en", "es"])(
    "includes the visible email in the email CTAs' accessible names (%s)",
    async (lang) => {
      mockCvFs({
        locale: lang,
        cvJson: mockCVData,
      });

      const ui = await CVPage({ params: Promise.resolve({ lang }) });

      render(ui);

      const emailLinks = screen.getAllByRole("link", {
        name: /vicente@opa\.so/i,
      });
      expect(emailLinks.map((link) => link.getAttribute("href"))).toEqual(
        expect.arrayContaining(["#contact", "mailto:vicente@opa.so"]),
      );
      for (const link of emailLinks) {
        const visible = link.textContent?.replace(/[^\w@.]/g, "") ?? "";
        expect(link.getAttribute("aria-label")?.toLowerCase()).toContain(
          visible.toLowerCase(),
        );
      }
    },
  );
});
