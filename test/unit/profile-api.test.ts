import { beforeEach, describe, expect, it, vi } from "vitest";

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/api/profile/[lang]/route");
  return mod.GET as (
    req: Request,
    ctx: { params: Promise<{ lang: string }> },
  ) => Promise<Response>;
}

describe("app/api/profile/[lang] GET", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 404 for invalid locales", async () => {
    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/profile/fr"), {
      params: Promise.resolve({ lang: "fr" }),
    });

    expect(res.status).toBe(404);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Not found");
  });

  it("returns the canonical localized profile", async () => {
    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/profile/en"), {
      params: Promise.resolve({ lang: "en" }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      meta: { name: string; current_title: string; years_experience: number };
      skills: {
        core_technical: string[];
        cloud_and_infra: string[];
        languages: Array<{ name: string; level: string }>;
      };
      links: { website: string; cv_url: string };
    };

    expect(json.meta.name).toBe("Vicente Opaso");
    expect(json.meta.current_title).toBe("Frontend Architect & Technical Leader");
    expect(json.meta.years_experience).toBeGreaterThanOrEqual(20);
    expect(json.skills.core_technical).toEqual(
      expect.arrayContaining(["JavaScript", "React", "Next.js", "Node.js"]),
    );
    expect(json.skills.cloud_and_infra).toContain("Cloudflare");
    expect(json.skills.languages).toEqual(
      expect.arrayContaining([
        { name: "Spanish", level: "native" },
        { name: "English", level: "native-like" },
      ]),
    );
    expect(json.links.website).toBe("https://opa.so/");
    expect(json.links.cv_url).toBe("https://opa.so/en/cv");
  });

  it("returns 500 when canonical profile loading fails", async () => {
    vi.doMock("../../lib/profile", () => ({
      getCanonicalProfile: vi.fn(() => {
        throw new Error("profile-load-failed");
      }),
    }));

    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/profile/en"), {
      params: Promise.resolve({ lang: "en" }),
    });

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Internal server error");
  });
});
