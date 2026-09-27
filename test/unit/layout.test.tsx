import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/font/google", () => ({
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

vi.mock("../../app/components/SeoJsonLd", () => ({
  SeoJsonLd: () => <div data-testid="seo-jsonld" />,
}));

vi.mock("../../app/components/WebMcpInit", () => ({
  WebMcpInit: () => <div data-testid="webmcp-init" />,
}));

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: (key: string) => (key === "x-locale" ? "en" : null),
    }),
}));

import RootLayout from "../../app/layout";
import { contrastInitScript } from "../../lib/contrast";

describe("RootLayout", () => {
  it("applies the High Contrast preference with an inline head script", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(await RootLayout({ children: <div /> }));
    consoleSpy.mockRestore();

    const scripts = Array.from(document.querySelectorAll("script"));
    expect(
      scripts.some((script) => script.textContent === contrastInitScript),
    ).toBe(true);
  });

  it("wraps children in main content area and includes shell components", async () => {
    // Suppress hydration warning for <html> element in test environment
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // RootLayout is an async Server Component; call it directly to get resolved JSX,
    // then render synchronously (JSDOM doesn't support async components natively).
    const jsx = await RootLayout({
      children: <div data-testid="child">Hello world</div>,
    });
    render(jsx);

    consoleSpy.mockRestore();

    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("locale-provider")).toBeInTheDocument();
    expect(screen.getByTestId("global-error-handler")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("seo-jsonld")).toBeInTheDocument();
    expect(screen.getByTestId("webmcp-init")).toBeInTheDocument();
    expect(screen.getByTestId("analytics")).toBeInTheDocument();

    const main = document.querySelector("main");
    expect(main).not.toBeNull();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
