import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter" }),
  Instrument_Serif: () => ({ variable: "font-instrument-serif" }),
  JetBrains_Mono: () => ({ variable: "font-jetbrains-mono" }),
}));

vi.mock("../../app/components/AnalyticsWrapper", () => ({
  AnalyticsWrapper: () => <div data-testid="analytics" />,
}));

vi.mock("../../app/components/BrutalistNav", () => ({
  BrutalistNav: () => <header data-testid="header" />,
}));

vi.mock("../../app/components/BrutalistFooter", () => ({
  BrutalistFooter: () => <footer data-testid="footer" />,
}));

vi.mock("../../app/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock("../../app/components/LocaleProvider", () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="locale-provider">{children}</div>
  ),
}));

vi.mock("../../app/components/GlobalErrorHandler", () => ({
  GlobalErrorHandler: () => <div data-testid="global-error-handler" />,
}));

vi.mock("../../app/components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock("../../app/components/WebMcpInit", () => ({
  WebMcpInit: () => <div data-testid="webmcp-init" />,
}));

import { renderToStaticMarkup } from "react-dom/server";

import RootLayout, {
  generateMetadata,
  generateStaticParams,
} from "../../app/[lang]/layout";
import { contrastInitScript } from "../../lib/contrast";

async function renderLayout(lang: string, children: React.ReactNode = <div />) {
  return RootLayout({ children, params: Promise.resolve({ lang }) });
}

describe("RootLayout ([lang])", () => {
  it("prerenders one root layout per supported locale", () => {
    expect(generateStaticParams()).toEqual([{ lang: "en" }, { lang: "es" }]);
  });

  it.each([
    ["en", "Skip to main content"],
    ["es", "Saltar al contenido principal"],
  ])(
    "serves <html lang=%s> and a localized skip link in the static HTML",
    async (lang, skipText) => {
      const html = renderToStaticMarkup(await renderLayout(lang));

      expect(html).toContain(`<html lang="${lang}"`);
      expect(html).toContain(`>${skipText}</a>`);
    },
  );

  it("server-renders WebSite JSON-LD for the active locale", async () => {
    const html = renderToStaticMarkup(await renderLayout("es"));
    const match = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/,
    );

    const data = JSON.parse(match?.[1] ?? "null");
    expect(data["@type"]).toBe("WebSite");
    expect(data.inLanguage).toBe("es");
    expect(data.url).toBe("https://opa.so/es");
  });

  it("points the manifest at the locale-specific route", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: "es" }),
    });

    expect(metadata.manifest).toBe("/es/manifest.webmanifest");
  });

  it("applies the High Contrast preference with an inline head script", async () => {
    const html = renderToStaticMarkup(await renderLayout("en"));

    expect(html).toContain(contrastInitScript);
  });

  it("wraps children in main content area and includes shell components", async () => {
    // Suppress hydration warning for <html> element in test environment
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      await renderLayout("en", <div data-testid="child">Hello world</div>),
    );
    consoleSpy.mockRestore();

    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("locale-provider")).toBeInTheDocument();
    expect(screen.getByTestId("global-error-handler")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("webmcp-init")).toBeInTheDocument();
    expect(screen.getByTestId("analytics")).toBeInTheDocument();

    const main = document.querySelector("main");
    expect(main).not.toBeNull();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
