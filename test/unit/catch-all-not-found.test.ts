import { describe, expect, it, vi } from "vitest";

const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({ notFound: () => notFoundMock() }));

describe("[lang]/[...rest] catch-all", () => {
  it("delegates every unmatched path to the localized not-found boundary", async () => {
    const { default: CatchAll } =
      await import("../../app/[lang]/[...rest]/page");

    expect(() => CatchAll()).toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
