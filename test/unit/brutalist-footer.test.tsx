import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const params: { lang?: string } = { lang: "en" };

vi.mock("next/navigation", () => ({
  useParams: () => params,
}));

vi.mock("../../app/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: params.lang }),
}));

import { BrutalistFooter } from "../../app/components/BrutalistFooter";

describe("BrutalistFooter heart", () => {
  it("renders the heart as a labelled, theme-coloured text glyph", () => {
    params.lang = "en";
    render(<BrutalistFooter />);

    const heart = screen.getByRole("img", { name: "love" });
    expect(heart).toHaveClass("v3-footer-heart");
    // Text presentation selector, so CSS colour applies instead of emoji colour.
    expect(heart.textContent).toBe("❤︎");
    expect(
      screen.getByText(/DESIGNED AND DEVELOPED WITH AI, SDD, AND/),
    ).toContainElement(heart);
  });

  it("localises the heart's accessible name", () => {
    params.lang = "es";
    render(<BrutalistFooter />);

    expect(screen.getByRole("img", { name: "amor" })).toBeInTheDocument();
  });
});
