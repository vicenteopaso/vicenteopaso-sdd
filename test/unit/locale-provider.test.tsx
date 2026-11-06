import { act, render, screen, waitFor } from "@testing-library/react";
import { useParams, usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider, useLocale } from "../../app/components/LocaleProvider";

vi.mock("next/navigation");

function TestComponent() {
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <div data-testid="locale-display">{locale}</div>
      <button onClick={() => setLocale("es")} data-testid="set-locale-btn">
        Set Spanish
      </button>
    </div>
  );
}

describe("LocaleProvider and useLocale", () => {
  let store: Record<string, string>;

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    store = {};
    vi.mocked(usePathname).mockReturnValue("/en");
    vi.mocked(useParams).mockReturnValue({ lang: "en" });
    // jsdom exposes localStorage as a getter-only property, so stub it via
    // defineProperty rather than assigning to it.
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    } as unknown as Storage);
  });

  describe("LocaleProvider initialization", () => {
    it("should render children", () => {
      render(
        <LocaleProvider initialLocale="en">
          <div data-testid="child-element">Test Child</div>
        </LocaleProvider>,
      );
      expect(screen.getByTestId("child-element")).toBeInTheDocument();
    });

    it("should initialize with default locale when no initialLocale provided", () => {
      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
    });

    it("should initialize with en locale from prop", () => {
      render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
    });

    it("should initialize with es locale from prop", () => {
      vi.mocked(usePathname).mockReturnValue("/es");
      vi.mocked(useParams).mockReturnValue({ lang: "es" });
      render(
        <LocaleProvider initialLocale="es">
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
    });

    it("should prefer a valid locale route param over the initial locale", () => {
      vi.mocked(usePathname).mockReturnValue("/es");
      vi.mocked(useParams).mockReturnValue({ lang: "es" });

      render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );

      expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
    });

    it("should ignore an invalid locale route param and keep the initial locale", () => {
      vi.mocked(usePathname).mockReturnValue("/fr");
      vi.mocked(useParams).mockReturnValue({ lang: "fr" });

      render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );

      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
    });
  });

  describe("useLocale hook", () => {
    it("should provide locale and setLocale function", () => {
      render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toBeInTheDocument();
    });

    it("should return default locale when context is not available", () => {
      const TestComponentOutsideProvider = () => {
        const { locale } = useLocale();
        return <div data-testid="locale">{locale}</div>;
      };
      render(<TestComponentOutsideProvider />);
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
    });

    it("should have a no-op setLocale without side effects when context is unavailable", () => {
      const TestComponentOutsideProvider = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <button data-testid="change-btn" onClick={() => setLocale("es")}>
              Change
            </button>
          </div>
        );
      };
      const { getByTestId } = render(<TestComponentOutsideProvider />);
      expect(getByTestId("locale")).toHaveTextContent("en");
      expect(() => getByTestId("change-btn").click()).not.toThrow();
      expect(getByTestId("locale")).toHaveTextContent("en");
    });
  });

  describe("localStorage synchronization", () => {
    it("should save locale to localStorage on mount", async () => {
      vi.mocked(usePathname).mockReturnValue("/es");
      vi.mocked(useParams).mockReturnValue({ lang: "es" });
      render(
        <LocaleProvider initialLocale="es">
          <TestComponent />
        </LocaleProvider>,
      );
      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          "preferred-locale",
          "es",
        );
      });
    });

    it("should save locale to localStorage when setLocale is called", async () => {
      const { getByTestId } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );
      getByTestId("set-locale-btn").click();
      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          "preferred-locale",
          "es",
        );
      });
    });
  });

  describe("Provider always renders", () => {
    it("should always render children synchronously (no mount gate)", () => {
      const { container } = render(
        <LocaleProvider initialLocale="en">
          <div data-testid="test-content">Content</div>
        </LocaleProvider>,
      );
      // Children are available immediately — no pre-mounted gate
      expect(
        container.querySelector('[data-testid="test-content"]'),
      ).toBeInTheDocument();
    });

    it("should expose correct locale immediately without waiting for effects", () => {
      vi.mocked(usePathname).mockReturnValue("/es");
      vi.mocked(useParams).mockReturnValue({ lang: "es" });
      render(
        <LocaleProvider initialLocale="es">
          <TestComponent />
        </LocaleProvider>,
      );
      // Synchronous — no need for waitFor
      expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
    });

    it("should not update locale when rerendered with different initialLocale prop (initialLocale is mount-only)", async () => {
      const { rerender } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");

      rerender(
        <LocaleProvider initialLocale="es">
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
    });

    it("should sync locale from pathname after client-side navigation", async () => {
      const mockUsePathname = vi.mocked(usePathname);
      const { rerender } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );

      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");

      mockUsePathname.mockReturnValue("/es/cv");
      rerender(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });
    });

    it("should ignore pathname changes that do not include a supported locale", async () => {
      const mockUsePathname = vi.mocked(usePathname);
      const mockUseParams = vi.mocked(useParams);
      const { rerender } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );

      mockUsePathname.mockReturnValue("/contact");
      mockUseParams.mockReturnValue({});

      rerender(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });
  });

  describe("setLocale behavior", () => {
    it("should update locale state when setLocale is called with valid locale", async () => {
      const { getByTestId } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      getByTestId("set-locale-btn").click();
      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });
    });

    it("should persist locale to localStorage when setLocale is called", async () => {
      const { getByTestId } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>,
      );
      getByTestId("set-locale-btn").click();
      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          "preferred-locale",
          "es",
        );
      });
    });

    it("should reflect multiple setLocale calls", async () => {
      const MultiChangeComponent = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale-display">{locale}</div>
            <button onClick={() => setLocale("es")} data-testid="set-es-btn">
              Set ES
            </button>
            <button onClick={() => setLocale("en")} data-testid="set-en-btn">
              Set EN
            </button>
          </div>
        );
      };
      const { getByTestId } = render(
        <LocaleProvider initialLocale="en">
          <MultiChangeComponent />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      getByTestId("set-es-btn").click();
      await waitFor(() =>
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es"),
      );
      getByTestId("set-en-btn").click();
      await waitFor(() =>
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en"),
      );
    });

    it("should ignore invalid locale values", async () => {
      const InvalidLocaleComponent = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale-display">{locale}</div>
            <button
              data-testid="set-invalid-btn"
              onClick={() => setLocale("fr" as never)}
            >
              Set invalid
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <LocaleProvider initialLocale="en">
          <InvalidLocaleComponent />
        </LocaleProvider>,
      );

      getByTestId("set-invalid-btn").click();

      await waitFor(() => {
        expect(global.localStorage.setItem).not.toHaveBeenCalledWith(
          "preferred-locale",
          "fr",
        );
      });
      expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
    });

    it("should allow setLocale to be called multiple times without errors", async () => {
      const TestComponentWithMultipleCalls = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <button
              onClick={() => {
                setLocale("es");
                setLocale("en");
                setLocale("es");
              }}
              data-testid="rapid-changes"
            >
              Rapid Changes
            </button>
          </div>
        );
      };
      const { getByTestId } = render(
        <LocaleProvider initialLocale="en">
          <TestComponentWithMultipleCalls />
        </LocaleProvider>,
      );
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
      act(() => {
        getByTestId("rapid-changes").click();
      });
      await waitFor(() =>
        expect(screen.getByTestId("locale")).toHaveTextContent("es"),
      );
    });
  });
});
