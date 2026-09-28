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

    // Layout modifier classes drive the grid's right/bottom borders in CSS
    // (styles/v3/cv-ref-card.css); assert the class, not computed style —
    // jsdom doesn't apply external stylesheets.
    // Card 0: left col (has right border), top row (has bottom border)
    expect(cards[0]).toHaveClass("is-right-col");
    expect(cards[0]).not.toHaveClass("is-last-row");
    expect(cards[0]).not.toHaveClass("is-dimmed");
    // Card 1: right col (no right border), top row (has bottom border)
    expect(cards[1]).not.toHaveClass("is-right-col");
    expect(cards[1]).not.toHaveClass("is-last-row");
    // Card 2: left col (has right border), last row (no bottom border)
    expect(cards[2]).toHaveClass("is-right-col");
    expect(cards[2]).toHaveClass("is-last-row");
    // Card 3: right col + last row (no right or bottom border)
    expect(cards[3]).not.toHaveClass("is-right-col");
    expect(cards[3]).toHaveClass("is-last-row");

    const firstOverlay = getOverlay(cards[0]);
    expect(firstOverlay).not.toHaveClass("is-last-row");

    const lastRowOverlay = getOverlay(cards[2]);
    expect(lastRowOverlay).toHaveClass("is-last-row");

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
    expect(firstCard).toHaveClass("is-expanded");
    expect(secondCard).toHaveClass("is-dimmed");

    // Collapse happens when mouse leaves the grid, not individual cards
    fireEvent.mouseLeave(
      firstCard.closest(".v3-cv-refs-grid") ??
        (firstCard.parentElement as HTMLElement),
    );
    expect(getTruncated(firstCard)).not.toHaveAttribute("aria-hidden");
    expect(secondCard).not.toHaveClass("is-dimmed");

    fireEvent.focus(firstCard);
    expect(getTruncated(firstCard)).toHaveAttribute("aria-hidden", "true");
    expect(secondCard).toHaveClass("is-dimmed");

    fireEvent.blur(firstCard);
    expect(getTruncated(firstCard)).not.toHaveAttribute("aria-hidden");
    expect(secondCard).not.toHaveClass("is-dimmed");
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
