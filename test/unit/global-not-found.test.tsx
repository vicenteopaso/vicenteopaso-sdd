import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

import GlobalNotFound, { metadata } from "../../app/global-not-found";

afterEach(() => {
  requestHeaders.delete("x-opaso-locale");
});

describe("GlobalNotFound", () => {
  it("is non-indexable", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("localizes from the locale header set by proxy.ts", async () => {
    requestHeaders.set("x-opaso-locale", "es");
    const html = renderToStaticMarkup(await GlobalNotFound());

    expect(html).toContain('<html lang="es">');
    expect(html).toContain("Página no encontrada.");
    expect(html).toContain('href="/es"');
    expect(html).toContain("Ir al inicio");
  });

  it.each([[undefined], ["fr"]])(
    "falls back to English when the header is %s",
    async (value) => {
      if (value) requestHeaders.set("x-opaso-locale", value);
      const html = renderToStaticMarkup(await GlobalNotFound());

      expect(html).toContain('<html lang="en">');
      expect(html).toContain("Page not found.");
      expect(html).toContain('href="/en"');
    },
  );
});
