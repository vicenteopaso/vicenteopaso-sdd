import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ArrowUpIcon,
  ContrastIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from "../../app/components/icons";

describe("Icon components", () => {
  it("renders ContrastIcon as a decorative SVG that forwards props", () => {
    const { container } = render(<ContrastIcon className="icon" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("icon");
  });

  it("renders GitHubIcon with correct SVG", () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders LinkedInIcon with correct SVG", () => {
    const { container } = render(<LinkedInIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders XIcon with correct SVG", () => {
    const { container } = render(<XIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders DownloadIcon with correct SVG", () => {
    const { container } = render(<DownloadIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders SunIcon with correct character", () => {
    const { container } = render(<SunIcon />);
    expect(container.textContent).toBe("☼");
    const span = container.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("renders MoonIcon with correct character", () => {
    const { container } = render(<MoonIcon />);
    expect(container.textContent).toBe("☾");
    const span = container.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("renders ArrowUpIcon with correct character", () => {
    const { container } = render(<ArrowUpIcon />);
    expect(container.textContent).toBe("↑");
    const span = container.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts custom props for SVG icons", () => {
    const { container } = render(
      <GitHubIcon className="custom-class" data-testid="custom-icon" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
    expect(svg).toHaveAttribute("data-testid", "custom-icon");
  });
});
