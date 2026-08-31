import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../app/components/FoundLuggageNotifier", () => ({
  FoundLuggageNotifier: ({ locale }: { locale: string }) => (
    <div data-testid="notifier" data-locale={locale} />
  ),
}));

import FoundLuggagePage, {
  generateMetadata,
} from "../../app/[lang]/found-luggage/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FoundLuggagePage", () => {
  it("renders the English contact details and fires the notifier", async () => {
    const ui = await FoundLuggagePage({
      params: Promise.resolve({ lang: "en" }),
    });

    render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /you found my luggage/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /vicente@opa\.so/i })).toHaveAttribute(
      "href",
      "mailto:vicente@opa.so",
    );
    expect(
      screen.getByRole("link", { name: /\+34 684 00 52 62/i }),
    ).toHaveAttribute("href", "tel:+34684005262");
    expect(
      screen.getByRole("link", { name: /message on whatsapp/i }),
    ).toHaveAttribute("href", "https://wa.me/34684005262");

    const notifier = screen.getByTestId("notifier");
    expect(notifier).toHaveAttribute("data-locale", "en");
  });

  it("renders the Spanish contact details", async () => {
    const ui = await FoundLuggagePage({
      params: Promise.resolve({ lang: "es" }),
    });

    render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /encontraste mi equipaje/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("notifier")).toHaveAttribute(
      "data-locale",
      "es",
    );
  });

  it("marks the page as noindex so it stays unlisted", async () => {
    const metadata = await generateMetadata();

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
