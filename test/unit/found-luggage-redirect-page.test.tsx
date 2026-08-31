import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

function mockAcceptLanguage(value: string | null) {
  headersMock.mockResolvedValue({
    get: (key: string) => (key === "accept-language" ? value : null),
  });
}

async function loadPage() {
  vi.resetModules();
  const mod = await import("../../app/found-luggage/page");
  return mod.default;
}

afterEach(() => {
  vi.restoreAllMocks();
  headersMock.mockReset();
  redirectMock.mockClear();
});

describe("FoundLuggageRedirectPage", () => {
  it("redirects to the Spanish page when es is preferred", async () => {
    mockAcceptLanguage("es-ES,es;q=0.9,en;q=0.8");
    const Page = await loadPage();

    await expect(Page()).rejects.toThrow("REDIRECT:/es/found-luggage");
  });

  it("redirects to English by default when no header is present", async () => {
    mockAcceptLanguage(null);
    const Page = await loadPage();

    await expect(Page()).rejects.toThrow("REDIRECT:/en/found-luggage");
  });

  it("falls back to English for unsupported languages", async () => {
    mockAcceptLanguage("fr-FR,fr;q=0.9");
    const Page = await loadPage();

    await expect(Page()).rejects.toThrow("REDIRECT:/en/found-luggage");
  });
});
