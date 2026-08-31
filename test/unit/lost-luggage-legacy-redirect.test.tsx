import { afterEach, describe, expect, it, vi } from "vitest";

const permanentRedirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  permanentRedirect: (url: string) => permanentRedirectMock(url),
}));

afterEach(() => {
  vi.restoreAllMocks();
  permanentRedirectMock.mockClear();
});

describe("LostLuggageRedirectPage (no-locale)", () => {
  it("redirects /lost-luggage to /found-luggage", async () => {
    vi.resetModules();
    const { default: Page } = await import("../../app/lost-luggage/page");

    expect(() => Page()).toThrow("REDIRECT:/found-luggage");
  });
});

describe("LostLuggageRedirectPage ([lang])", () => {
  it("redirects /en/lost-luggage to /en/found-luggage", async () => {
    vi.resetModules();
    const { default: Page } = await import("../../app/[lang]/lost-luggage/page");

    await expect(
      Page({ params: Promise.resolve({ lang: "en" }) }),
    ).rejects.toThrow("REDIRECT:/en/found-luggage");
  });

  it("redirects /es/lost-luggage to /es/found-luggage", async () => {
    vi.resetModules();
    const { default: Page } = await import("../../app/[lang]/lost-luggage/page");

    await expect(
      Page({ params: Promise.resolve({ lang: "es" }) }),
    ).rejects.toThrow("REDIRECT:/es/found-luggage");
  });

  it("falls back to the default locale for an invalid lang param", async () => {
    vi.resetModules();
    const { default: Page } = await import("../../app/[lang]/lost-luggage/page");

    await expect(
      Page({ params: Promise.resolve({ lang: "fr" }) }),
    ).rejects.toThrow("REDIRECT:/en/found-luggage");
  });
});
