import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import NotFound from "../../app/[lang]/not-found";
import { LocaleProvider } from "../../app/components/LocaleProvider";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  usePathname: vi.fn(() => null),
}));

function renderFor(lang: "en" | "es") {
  vi.mocked(useParams).mockReturnValue({ lang });
  return render(
    <LocaleProvider initialLocale={lang}>
      <NotFound />
    </LocaleProvider>,
  );
}

describe("Localized NotFound page", () => {
  it("renders the 404 heading and English text with a link home", () => {
    renderFor("en");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
    expect(screen.getByText("Page not found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/en",
    );
  });

  it("renders Spanish copy and links to the Spanish home page", () => {
    renderFor("es");

    expect(screen.getByText("Página no encontrada.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute(
      "href",
      "/es",
    );
  });
});
