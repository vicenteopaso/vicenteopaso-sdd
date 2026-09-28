import { act, fireEvent, render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContrastToggle } from "../../app/components/ContrastToggle";
import { CONTRAST_ATTRIBUTE, CONTRAST_STORAGE_KEY } from "../../lib/contrast";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ lang: "en" })),
}));

type ChangeListener = (event: MediaQueryListEvent) => void;

// Controllable stand-in for matchMedia("(prefers-contrast: more)"). The
// component reaches it through document.defaultView, so install it there.
function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const media = {
    matches: initialMatches,
    media: "(prefers-contrast: more)",
    addEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      listeners.delete(listener);
    }),
  };
  Object.defineProperty(document.defaultView as Window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(() => media),
  });
  return {
    media,
    change(matches: boolean) {
      media.matches = matches;
      act(() => {
        for (const listener of listeners) {
          listener({ matches } as MediaQueryListEvent);
        }
      });
    },
  };
}

const html = () => document.documentElement;
const getToggle = () => screen.getByRole("button", { name: "High contrast" });

afterEach(() => {
  localStorage.clear();
  html().removeAttribute(CONTRAST_ATTRIBUTE);
  Reflect.deleteProperty(document.defaultView as Window, "matchMedia");
  vi.mocked(useParams).mockReturnValue({ lang: "en" });
  vi.restoreAllMocks();
});

describe("ContrastToggle", () => {
  it("renders an unpressed toggle button named by its visible label", () => {
    render(<ContrastToggle />);

    const toggle = getToggle();
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveTextContent("High contrast");
  });

  it("hides the decorative icon from assistive technology", () => {
    render(<ContrastToggle />);

    expect(getToggle().querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("reflects a preference the head script applied before hydration", () => {
    html().setAttribute(CONTRAST_ATTRIBUTE, "more");

    render(<ContrastToggle />);

    expect(getToggle()).toHaveAttribute("aria-pressed", "true");
  });

  it("switches High Contrast on and off, saving each choice", () => {
    render(<ContrastToggle />);

    fireEvent.click(getToggle());
    expect(getToggle()).toHaveAttribute("aria-pressed", "true");
    expect(html()).toHaveAttribute(CONTRAST_ATTRIBUTE, "more");
    expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe("more");

    fireEvent.click(getToggle());
    expect(getToggle()).toHaveAttribute("aria-pressed", "false");
    expect(html()).not.toHaveAttribute(CONTRAST_ATTRIBUTE);
    expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe("default");
  });

  it("uses the Spanish label on Spanish pages", () => {
    vi.mocked(useParams).mockReturnValue({ lang: "es" });

    render(<ContrastToggle />);

    expect(
      screen.getByRole("button", { name: "Alto contraste" }),
    ).toBeInTheDocument();
  });

  it("follows OS contrast changes until the visitor makes a choice", () => {
    const os = installMatchMedia(false);
    render(<ContrastToggle />);

    os.change(true);
    expect(getToggle()).toHaveAttribute("aria-pressed", "true");
    expect(html()).toHaveAttribute(CONTRAST_ATTRIBUTE, "more");

    fireEvent.click(getToggle());
    os.change(true);
    expect(getToggle()).toHaveAttribute("aria-pressed", "false");
    expect(html()).not.toHaveAttribute(CONTRAST_ATTRIBUTE);
  });

  it("stops listening for OS changes when unmounted", () => {
    const os = installMatchMedia(false);
    const { unmount } = render(<ContrastToggle />);

    unmount();

    expect(os.media.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("still switches, and logs a warning, when the choice cannot be saved", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ContrastToggle />);

    fireEvent.click(getToggle());

    expect(getToggle()).toHaveAttribute("aria-pressed", "true");
    expect(html()).toHaveAttribute(CONTRAST_ATTRIBUTE, "more");
    expect(warn).toHaveBeenCalledWith(
      "Application Warning:",
      expect.stringContaining("ContrastToggle"),
    );
  });
});
