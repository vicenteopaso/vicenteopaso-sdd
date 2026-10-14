import { describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => [] as string[]);

vi.mock("zod/v4/core", () => ({
  config: (options: { jitless?: boolean }) => {
    calls.push(`config:${JSON.stringify(options)}`);
  },
}));

vi.mock("@mcp-b/global", () => {
  calls.push("polyfill");
  return {};
});

import { loadWebMcpPolyfill } from "../../lib/webmcp";

describe("loadWebMcpPolyfill", () => {
  it("disables zod's eval-based JIT before the polyfill evaluates", async () => {
    await loadWebMcpPolyfill();

    expect(calls).toEqual(['config:{"jitless":true}', "polyfill"]);
  });
});
