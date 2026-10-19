import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContrastIcon } from "../../app/components/icons";

describe("Icon components", () => {
  it("renders ContrastIcon as a decorative SVG that forwards props", () => {
    const { container } = render(
      <ContrastIcon className="icon" data-testid="contrast-icon" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("icon");
    expect(svg).toHaveAttribute("data-testid", "contrast-icon");
  });
});
