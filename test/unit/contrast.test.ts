import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyContrastPreference,
  CONTRAST_ATTRIBUTE,
  CONTRAST_STORAGE_KEY,
  contrastInitScript,
  isContrastPreference,
  persistContrastPreference,
  readAppliedContrast,
  readStoredContrast,
  resolveContrastPreference,
} from "../../lib/contrast";

const root = () => document.documentElement;

function unavailableStorage(): { localStorage: Storage } {
  return {
    get localStorage(): Storage {
      throw new DOMException("Storage is disabled", "SecurityError");
    },
  };
}

// jsdom has no matchMedia; the init script reads it as a global.
function setPrefersMoreContrast(matches: boolean) {
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn((media: string) => ({ matches, media })),
  });
}

afterEach(() => {
  localStorage.clear();
  root().removeAttribute(CONTRAST_ATTRIBUTE);
  Reflect.deleteProperty(globalThis, "matchMedia");
  vi.restoreAllMocks();
});

describe("isContrastPreference", () => {
  it("accepts the two supported preferences", () => {
    expect(isContrastPreference("more")).toBe(true);
    expect(isContrastPreference("default")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of [null, undefined, "", "high", "MORE", 1]) {
      expect(isContrastPreference(value)).toBe(false);
    }
  });
});

describe("resolveContrastPreference", () => {
  it.each([
    [null, false, "default"],
    [null, true, "more"],
    ["more", false, "more"],
    ["default", true, "default"],
  ] as const)(
    "stored %s with OS more-contrast %s resolves to %s",
    (stored, prefersMore, expected) => {
      expect(resolveContrastPreference(stored, prefersMore)).toBe(expected);
    },
  );
});

describe("readStoredContrast", () => {
  it("returns a stored preference", () => {
    localStorage.setItem(CONTRAST_STORAGE_KEY, "more");
    expect(readStoredContrast(window)).toBe("more");
  });

  it("ignores unknown stored values", () => {
    localStorage.setItem(CONTRAST_STORAGE_KEY, "high");
    expect(readStoredContrast(window)).toBeNull();
  });

  it("treats unavailable storage as no stored choice", () => {
    expect(readStoredContrast(unavailableStorage())).toBeNull();
  });
});

describe("persistContrastPreference", () => {
  it("stores the preference", () => {
    expect(persistContrastPreference(window, "more")).toBe(true);
    expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe("more");
  });

  it("reports failure instead of throwing when storage is unavailable", () => {
    expect(persistContrastPreference(unavailableStorage(), "more")).toBe(false);
  });
});

describe("applyContrastPreference and readAppliedContrast", () => {
  it("sets and clears the attribute on the root element", () => {
    applyContrastPreference(root(), "more");
    expect(root().getAttribute(CONTRAST_ATTRIBUTE)).toBe("more");
    expect(readAppliedContrast(root())).toBe("more");

    applyContrastPreference(root(), "default");
    expect(root().hasAttribute(CONTRAST_ATTRIBUTE)).toBe(false);
    expect(readAppliedContrast(root())).toBe("default");
  });
});

describe("contrastInitScript", () => {
  const runInitScript = () => new Function(contrastInitScript)();

  it.each([
    [null, false],
    [null, true],
    ["more", false],
    ["default", true],
    ["unknown", true],
  ] as const)(
    "agrees with resolveContrastPreference for stored %s and OS more-contrast %s",
    (stored, prefersMore) => {
      if (stored !== null) localStorage.setItem(CONTRAST_STORAGE_KEY, stored);
      setPrefersMoreContrast(prefersMore);

      runInitScript();

      const expected = resolveContrastPreference(
        isContrastPreference(stored) ? stored : null,
        prefersMore,
      );
      expect(readAppliedContrast(root())).toBe(expected);
    },
  );

  it("still honors the OS setting when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is disabled", "SecurityError");
    });
    setPrefersMoreContrast(true);

    runInitScript();

    expect(readAppliedContrast(root())).toBe("more");
  });

  it("keeps the default palette when matchMedia is unavailable", () => {
    runInitScript();

    expect(readAppliedContrast(root())).toBe("default");
  });
});
