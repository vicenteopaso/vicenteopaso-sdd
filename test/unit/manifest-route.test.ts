import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({
  NextRequest: class NextRequest extends Request {},
}));

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/[lang]/manifest.webmanifest/route");
  return mod.GET as (
    req: Request,
    ctx: { params: Promise<{ lang: string }> },
  ) => Promise<Response>;
}

function makeContext(lang: string) {
  return { params: Promise.resolve({ lang }) };
}

describe("app/[lang]/manifest.webmanifest GET", () => {
  it("returns an English manifest with start_url /en for the en locale", async () => {
    const GET = await createGetHandler();
    const res = await GET(
      new Request("http://localhost/en/manifest.webmanifest"),
      makeContext("en"),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/manifest+json");

    const manifest = (await res.json()) as Record<string, unknown>;
    expect(manifest.start_url).toBe("/en");
    expect(manifest.description).toContain("Frontend Architect");
  });

  it("returns a Spanish manifest with start_url /es for the es locale", async () => {
    const GET = await createGetHandler();
    const res = await GET(
      new Request("http://localhost/es/manifest.webmanifest"),
      makeContext("es"),
    );

    const manifest = (await res.json()) as Record<string, unknown>;
    expect(manifest.start_url).toBe("/es");
    expect(manifest.description).toContain("Arquitecto Frontend");
  });

  it("falls back to the en locale for an invalid lang param", async () => {
    const GET = await createGetHandler();
    const res = await GET(
      new Request("http://localhost/xx/manifest.webmanifest"),
      makeContext("xx"),
    );

    const manifest = (await res.json()) as Record<string, unknown>;
    expect(manifest.start_url).toBe("/en");
    expect(manifest.description).toContain("Frontend Architect");
  });

  it("is prerendered once per locale", async () => {
    vi.resetModules();
    const mod = await import("../../app/[lang]/manifest.webmanifest/route");
    expect(mod.dynamic).toBe("force-static");
    expect(mod.generateStaticParams()).toEqual([
      { lang: "en" },
      { lang: "es" },
    ]);
  });
});
