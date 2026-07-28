import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CvRefsGrid } from "../../app/components/CvRefCard";

const longText =
  "Vicente helped bring structure, clarity, and momentum to complex frontend work. ".repeat(
    5,
  );

const refs = [
  {
    name: "Ada Lovelace",
    role: "Staff Engineer",
    href: "https://example.com/ada",
    fullText: longText,
  },
  { name: "Grace Hopper", role: "Architect", fullText: longText },
  { name: "Margaret Hamilton", role: "Director", fullText: longText },
  { name: "Katherine Johnson", role: "VP Engineering", fullText: longText },
];

function getCards() {
  return screen.getAllByTestId("cv-ref-card");
}

function getTruncated(card: HTMLElement) {
  return within(card).getByTestId("cv-ref-card-truncated");
}

function getOverlay(card: HTMLElement) {
  return within(card).getByTestId("cv-ref-card-overlay");
}

describe("CvRefsGrid", () => {
  it("renders cards with the expected column and last-row layout branches", () => {
    render(<CvRefsGrid refs={refs} />);

    const cards = getCards();
    expect(cards).toHaveLength(4);

    // jsdom's computed-style resolution doesn't reliably preserve var() inside
    // shorthand-adjacent properties like border-right, so check the raw style
    // attribute string directly rather than jest-dom's toHaveStyle here.
    expect(cards[0].getAttribute("style")).toContain(
      "border-right: 1px solid var(--v3-rule)",
    );
    expect(cards[0].getAttribute("style")).toContain(
      "border-bottom: 1px solid var(--v3-rule)",
    );
    expect(cards[0]).toHaveStyle({ opacity: "1" });
    // Card 1: right col (no right border), top row (has bottom border)
    expect(cards[1].getAttribute("style")).not.toContain(
      "border-right: 1px solid",
    );
    expect(cards[1].getAttribute("style")).toContain(
      "border-bottom: 1px solid var(--v3-rule)",
    );
    // Card 2: left col (has right border), last row (no bottom border)
    expect(cards[2].getAttribute("style")).toContain(
      "border-right: 1px solid var(--v3-rule)",
    );
    expect(cards[2].getAttribute("style")).not.toContain(
      "border-bottom: 1px solid",
    );
    // Card 3: right col + last row (no right or bottom border)
    expect(cards[3].getAttribute("style")).not.toContain(
      "border-right: 1px solid",
    );
    expect(cards[3].getAttribute("style")).not.toContain(
      "border-bottom: 1px solid",
    );

    const firstOverlay = getOverlay(cards[0]);
    expect(firstOverlay).toHaveStyle({ top: "0px" });
    expect(firstOverlay).toHaveStyle({
      transform: "translateY(-6px) scale(0.99)",
    });

    const lastRowOverlay = getOverlay(cards[2]);
    expect(lastRowOverlay).toHaveStyle({ bottom: "0px" });
    expect(lastRowOverlay).toHaveStyle({
      transform: "translateY(6px) scale(0.99)",
    });

    expect(cards[0]).toHaveTextContent("❝ REF · 01");
    expect(cards[0]).toHaveTextContent("Ada Lovelace");
    expect(cards[0]).toHaveTextContent("Staff Engineer");
    expect(cards[0]).toHaveTextContent("…");
  });

  it("expands on hover and focus, and dims sibling cards while active", () => {
    render(<CvRefsGrid refs={refs} />);

    const cards = getCards();
    const firstCard = cards[0];
    const secondCard = cards[1];

    fireEvent.mouseEnter(firstCard);
    expect(getTruncated(firstCard)).toHaveAttribute("aria-hidden", "true");
    expect(getOverlay(firstCard)).not.toHaveAttribute("aria-hidden");
    expect(firstCard).toHaveStyle({ zIndex: "10", opacity: "1" });
    expect(secondCard).toHaveStyle({ opacity: "0.35" });

    // Collapse happens when mouse leaves the grid, not individual cards
    fireEvent.mouseLeave(
      firstCard.closest('[class*="v3-cv-refs"]') ?? firstCard.parentElement!,
    );
    expect(getTruncated(firstCard)).not.toHaveAttribute("aria-hidden");
    expect(secondCard).toHaveStyle({ opacity: "1" });

    fireEvent.focus(firstCard);
    expect(getTruncated(firstCard)).toHaveAttribute("aria-hidden", "true");
    expect(secondCard).toHaveStyle({ opacity: "0.35" });

    fireEvent.blur(firstCard);
    expect(getTruncated(firstCard)).not.toHaveAttribute("aria-hidden");
    expect(secondCard).toHaveStyle({ opacity: "1" });
  });

  it("toggles expanded state via the show more/less controls", () => {
    render(<CvRefsGrid refs={refs} />);

    const card = getCards()[0];

    fireEvent.click(
      within(getTruncated(card)).getByText("Read full reference"),
    );
    expect(getTruncated(card)).toHaveAttribute("aria-hidden", "true");
    expect(getOverlay(card)).not.toHaveAttribute("aria-hidden");

    fireEvent.click(within(getOverlay(card)).getByText("Show less"));
    expect(getTruncated(card)).not.toHaveAttribute("aria-hidden");
    expect(getOverlay(card)).toHaveAttribute("aria-hidden", "true");
  });

  it("renders referee name as a link when href is provided, and link click does not toggle card", () => {
    render(<CvRefsGrid refs={refs} />);

    // First ref has href — name should be a link. Only the visible
    // (non-aria-hidden) copy is queryable by role by default.
    const link = screen.getByRole("link", { name: "Ada Lovelace" });
    expect(link).toHaveAttribute("href", "https://example.com/ada");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");

    // Second ref has no href — name should be plain text, not a link
    expect(screen.queryByRole("link", { name: "Grace Hopper" })).toBeNull();

    // Clicking the link should not toggle the card (stopPropagation)
    const card = getCards()[0];
    expect(getTruncated(card)).not.toHaveAttribute("aria-hidden");
    fireEvent.click(link);
    expect(getTruncated(card)).not.toHaveAttribute("aria-hidden");
  });
});
