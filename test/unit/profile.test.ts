import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const logErrorMock = vi.hoisted(() => vi.fn());

vi.mock("../../lib/error-logging", () => ({
  logError: logErrorMock,
}));

type JsonRecord = Record<string, unknown>;

function toJson(value: JsonRecord): string {
  return JSON.stringify(value);
}

async function importProfileModule() {
  vi.resetModules();
  return import("../../lib/profile");
}

describe("lib/profile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    logErrorMock.mockReset();
  });

  it("derives years experience as 0 when work history has no start dates", async () => {
    const originalReadFileSync = fs.readFileSync.bind(fs);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath, options) => {
      const pathText = String(filePath);

      if (pathText.endsWith("/content/en/cv.json")) {
        return toJson({
          name: "Vicente Opaso",
          title: "Vicente Opaso",
          slug: "cv",
          basics: { name: "Vicente Opaso", label: "Frontend Architect" },
          work: [
            {
              company: "Example Co",
              positions: [{ position: "Lead Engineer" }],
            },
          ],
          skills: [],
          languages: [],
        });
      }

      if (pathText.endsWith("/content/en/profile-preferences.json")) {
        return toJson({
          meta: {
            current_title: "Web Engineering Manager",
            seniority: "lead-manager",
            actively_looking: true,
          },
          role_preferences: {
            target_titles: ["Engineering Manager"],
            excluded_titles: ["Intern"],
            min_seniority: "senior",
            management_interest: "manager_or_individual_contributor",
            open_to_individual_contributor: true,
          },
          domains: {
            preferred_industries: ["SaaS"],
            excluded_industries: ["Gambling"],
          },
          skills: {
            core_technical_additions: ["Node.js"],
            architecture_additions: ["Component libraries"],
            platform_and_devex_additions: ["Internal platforms"],
            cloud_and_infra: ["Vercel"],
            language_levels: {},
          },
          experience_highlights: ["Built platforms."],
          location_preferences: {
            primary_locations: ["Remote"],
            acceptable_regions: ["EU"],
            restrictions: ["No relocation"],
            work_authorization: ["Spain"],
          },
          work_model_preferences: {
            preferred: ["Remote"],
            excluded: ["On-site only"],
          },
          compensation_and_level: {
            level_target: ["Lead"],
            notes: "Impact over title.",
          },
          company_preferences: {
            size_preference: ["Mid-size"],
            must_haves: ["Healthy culture"],
            red_flags: ["Waterfall"],
          },
          hard_constraints: {
            exclude_open_opportunities: true,
            exclude_designer_roles: true,
            excluded_keywords_in_title: ["Designer"],
            required_language: ["English"],
          },
          links: {
            cv_url: "https://opa.so/en/cv",
            website: "https://opa.so/",
            linkedin: "https://www.linkedin.com/in/vicenteopaso",
            github: "https://github.com/vicenteopaso",
          },
        });
      }

      return originalReadFileSync(
        filePath as Parameters<typeof fs.readFileSync>[0],
        options as Parameters<typeof fs.readFileSync>[1],
      );
    });

    const { getCanonicalProfile } = await importProfileModule();
    const profile = getCanonicalProfile("en");

    expect(profile.meta.years_experience).toBe(0);
    expect(profile.skills.core_technical).toContain("Node.js");
    expect(profile.skills.architecture).toContain("Component libraries");
    expect(profile.skills.platform_and_devex).toContain("Internal platforms");
  });

  it("falls back to cv fluency and then unknown for languages when preferences are missing", async () => {
    const originalReadFileSync = fs.readFileSync.bind(fs);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath, options) => {
      const pathText = String(filePath);

      if (pathText.endsWith("/content/en/cv.json")) {
        return toJson({
          name: "Vicente Opaso",
          title: "Vicente Opaso",
          slug: "cv",
          basics: { name: "Vicente Opaso", label: "Frontend Architect" },
          work: [
            {
              company: "Example Co",
              positions: [{ position: "Lead Engineer", startDate: "2015-01" }],
            },
          ],
          skills: [
            {
              name: "Developer Experience",
              keywords: ["Documentation standards"],
            },
            {
              name: "Design Systems",
              keywords: ["Accessibility"],
            },
            {
              name: "Frontend Architecture",
              keywords: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
            },
          ],
          languages: [
            { language: "English", fluency: "C2" },
            { language: "Spanish" },
          ],
        });
      }

      if (pathText.endsWith("/content/en/profile-preferences.json")) {
        return toJson({
          meta: {
            current_title: "Web Engineering Manager",
            seniority: "lead-manager",
            actively_looking: true,
          },
          role_preferences: {
            target_titles: ["Engineering Manager"],
            excluded_titles: ["Intern"],
            min_seniority: "senior",
            management_interest: "manager_or_individual_contributor",
            open_to_individual_contributor: true,
          },
          domains: {
            preferred_industries: ["SaaS"],
            excluded_industries: ["Gambling"],
          },
          skills: {
            core_technical_additions: [],
            architecture_additions: [],
            platform_and_devex_additions: [],
            cloud_and_infra: ["Vercel"],
            language_levels: {},
          },
          experience_highlights: ["Built platforms."],
          location_preferences: {
            primary_locations: ["Remote"],
            acceptable_regions: ["EU"],
            restrictions: ["No relocation"],
            work_authorization: ["Spain"],
          },
          work_model_preferences: {
            preferred: ["Remote"],
            excluded: ["On-site only"],
          },
          compensation_and_level: {
            level_target: ["Lead"],
            notes: "Impact over title.",
          },
          company_preferences: {
            size_preference: ["Mid-size"],
            must_haves: ["Healthy culture"],
            red_flags: ["Waterfall"],
          },
          hard_constraints: {
            exclude_open_opportunities: true,
            exclude_designer_roles: true,
            excluded_keywords_in_title: ["Designer"],
            required_language: ["English"],
          },
          links: {
            cv_url: "https://opa.so/en/cv",
            website: "https://opa.so/",
            linkedin: "https://www.linkedin.com/in/vicenteopaso",
            github: "https://github.com/vicenteopaso",
          },
        });
      }

      return originalReadFileSync(
        filePath as Parameters<typeof fs.readFileSync>[0],
        options as Parameters<typeof fs.readFileSync>[1],
      );
    });

    const { getCanonicalProfile } = await importProfileModule();
    const profile = getCanonicalProfile("en");

    expect(profile.skills.languages).toEqual([
      { name: "English", level: "C2" },
      { name: "Spanish", level: "unknown" },
    ]);
    expect(profile.skills.platform_and_devex).toContain("Developer experience");
    expect(profile.skills.architecture).toEqual(
      expect.arrayContaining(["Design systems", "Frontend architecture"]),
    );
    expect(profile.skills.core_technical).toEqual(
      expect.arrayContaining([
        "TypeScript",
        "React",
        "Next.js",
        "Tailwind CSS",
      ]),
    );
  });

  it("logs and rethrows when source data cannot be parsed", async () => {
    const originalReadFileSync = fs.readFileSync.bind(fs);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath, options) => {
      const pathText = String(filePath);

      if (pathText.endsWith("/content/en/cv.json")) {
        return "{invalid-json";
      }

      if (pathText.endsWith("/content/en/profile-preferences.json")) {
        return "{}";
      }

      return originalReadFileSync(
        filePath as Parameters<typeof fs.readFileSync>[0],
        options as Parameters<typeof fs.readFileSync>[1],
      );
    });

    const { getCanonicalProfile } = await importProfileModule();

    expect(() => getCanonicalProfile("en")).toThrow();
    expect(logErrorMock).toHaveBeenCalledTimes(1);
  });
});
