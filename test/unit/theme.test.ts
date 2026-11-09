import { describe, expect, it } from "vitest";

import { nextThemeChoice } from "../../lib/theme";

describe("nextThemeChoice", () => {
  it("pins the opposite theme when it differs from the OS", () => {
    expect(nextThemeChoice("dark", "dark")).toBe("light");
    expect(nextThemeChoice("light", "light")).toBe("dark");
  });

  it("returns to following the OS when switching back to the OS theme", () => {
    expect(nextThemeChoice("light", "dark")).toBe("system");
    expect(nextThemeChoice("dark", "light")).toBe("system");
  });

  it("treats an unresolved theme as dark and pins light", () => {
    expect(nextThemeChoice(undefined, undefined)).toBe("light");
  });
});
