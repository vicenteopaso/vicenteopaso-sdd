import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WebMcpInit } from "../../app/components/WebMcpInit";

const { loadWebMcpPolyfill, logError } = vi.hoisted(() => ({
  loadWebMcpPolyfill: vi.fn<() => Promise<void>>(),
  logError: vi.fn(),
}));

vi.mock("../../lib/webmcp", () => ({ loadWebMcpPolyfill }));
vi.mock("../../lib/error-logging", () => ({ logError }));

type RegisteredTool = {
  name: string;
  execute: (input: unknown) => Promise<unknown> | unknown;
};

describe("WebMcpInit", () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    loadWebMcpPolyfill.mockReset();
    loadWebMcpPolyfill.mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "fetch", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    if (globalThis.window) {
      delete (globalThis.window as Window & { __opaWebMcpRegistered?: boolean })
        .__opaWebMcpRegistered;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
  });

  it("registers tools once and skips when already registered", async () => {
    const registered: RegisteredTool[] = [];
    const registerTool = vi.fn((tool) => {
      registered.push(tool);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool } },
      configurable: true,
    });

    render(<WebMcpInit />);
    expect(registerTool).toHaveBeenCalled();
    expect(
      (globalThis.window as Window & { __opaWebMcpRegistered?: boolean })
        .__opaWebMcpRegistered,
    ).toBe(true);
    const callCount = registerTool.mock.calls.length;

    render(<WebMcpInit />);
    expect(registerTool).toHaveBeenCalledTimes(callCount);
    expect(registered.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "get_site_overview",
        "get_site_context",
        "get_content",
        "get_profile",
        "list_content_slugs",
      ]),
    );
  });

  it("loads the polyfill when idle and registers once it installs modelContext", async () => {
    let modelContext: unknown = null;
    const registerTool = vi.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: {
        get modelContext() {
          return modelContext;
        },
      },
      configurable: true,
    });
    loadWebMcpPolyfill.mockImplementation(async () => {
      modelContext = { registerTool };
    });

    render(<WebMcpInit />);
    // Nothing loads during the initial render; it waits for an idle slot.
    expect(loadWebMcpPolyfill).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(loadWebMcpPolyfill).toHaveBeenCalledTimes(1);
    expect(registerTool).toHaveBeenCalled();
    expect(
      (globalThis.window as Window & { __opaWebMcpRegistered?: boolean })
        .__opaWebMcpRegistered,
    ).toBe(true);
  });

  it("does not load the polyfill when WebMCP is native", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool: vi.fn() } },
      configurable: true,
    });

    render(<WebMcpInit />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(loadWebMcpPolyfill).not.toHaveBeenCalled();
  });

  it("skips the polyfill on phones reported by User-Agent Client Hints", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null, userAgentData: { mobile: true } },
      configurable: true,
    });

    render(<WebMcpInit />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(loadWebMcpPolyfill).not.toHaveBeenCalled();
  });

  it("skips the polyfill on touch-only devices without Client Hints", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null },
      configurable: true,
    });
    const matchMedia = vi.fn((query: string) => ({
      matches: query === "(hover: none) and (pointer: coarse)",
    }));
    vi.stubGlobal("matchMedia", matchMedia);

    try {
      render(<WebMcpInit />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      expect(matchMedia).toHaveBeenCalled();
      expect(loadWebMcpPolyfill).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("still loads the polyfill on desktop per Client Hints", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null, userAgentData: { mobile: false } },
      configurable: true,
    });

    render(<WebMcpInit />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(loadWebMcpPolyfill).toHaveBeenCalledTimes(1);
  });

  it("cancels the pending polyfill load on unmount", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null },
      configurable: true,
    });

    const { unmount } = render(<WebMcpInit />);
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(loadWebMcpPolyfill).not.toHaveBeenCalled();
  });

  it("skips registration when the polyfill leaves no usable modelContext", async () => {
    const registerTool = vi.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool: "not-a-function" } },
      configurable: true,
    });

    render(<WebMcpInit />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(loadWebMcpPolyfill).toHaveBeenCalledTimes(1);
    expect(registerTool).not.toHaveBeenCalled();
    expect(
      (globalThis.window as Window & { __opaWebMcpRegistered?: boolean })
        .__opaWebMcpRegistered,
    ).toBeUndefined();
  });

  it("schedules the polyfill with requestIdleCallback when available", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null },
      configurable: true,
    });
    const requestIdleCallback = vi.fn(() => 7);
    const cancelIdleCallback = vi.fn();
    Object.assign(window, { requestIdleCallback, cancelIdleCallback });

    try {
      const { unmount } = render(<WebMcpInit />);
      expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
        timeout: 5000,
      });
      unmount();
      expect(cancelIdleCallback).toHaveBeenCalledWith(7);
    } finally {
      const idleWindow = window as Partial<
        Pick<Window, "requestIdleCallback" | "cancelIdleCallback">
      >;
      delete idleWindow.requestIdleCallback;
      delete idleWindow.cancelIdleCallback;
    }
  });

  it("logs when the polyfill fails to load", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null },
      configurable: true,
    });
    const failure = new Error("chunk failed");
    loadWebMcpPolyfill.mockRejectedValue(failure);

    render(<WebMcpInit />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(logError).toHaveBeenCalledWith(failure, {
      component: "WebMcpInit",
      action: "loadWebMcpPolyfill",
    });
  });

  it("tool handlers return expected responses for success and error paths", async () => {
    const registered: RegisteredTool[] = [];
    const registerTool = vi.fn((tool) => {
      registered.push(tool);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool } },
      configurable: true,
    });

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "overview",
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => "context",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hello: "world" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ name: "Vicente Opaso" }),
      });

    render(<WebMcpInit />);

    const tools = Object.fromEntries(
      registered.map((tool) => [tool.name, tool]),
    );

    const overview = (await tools.get_site_overview.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(overview.isError).toBe(false);
    expect(overview.content[0].text).toBe("overview");

    const context = (await tools.get_site_context.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(context.isError).toBe(true);
    expect(context.content[0].text).toBe("context");

    const invalidInput = (await tools.get_content.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(invalidInput.isError).toBe(true);
    expect(invalidInput.content[0].text).toContain("invalid input");

    const missingInput = (await tools.get_content.execute({ lang: "en" })) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(missingInput.isError).toBe(true);
    expect(missingInput.content[0].text).toContain("lang and slug");

    const okContent = (await tools.get_content.execute({
      lang: "en",
      slug: "about",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(okContent.isError).toBe(false);
    expect(okContent.content[0].text).toContain('"ok": true');

    const errorContent = (await tools.get_content.execute({
      lang: "es",
      slug: "privacy-policy",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(errorContent.isError).toBe(true);
    expect(errorContent.content[0].text).toContain('"ok": false');

    const missingProfileInput = (await tools.get_profile.execute({})) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(missingProfileInput.isError).toBe(true);
    expect(missingProfileInput.content[0].text).toContain("lang is required");

    const okProfile = (await tools.get_profile.execute({
      lang: "en",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(okProfile.isError).toBe(false);
    expect(okProfile.content[0].text).toContain('"name": "Vicente Opaso"');

    const list = tools.list_content_slugs.execute(null) as {
      content: { text: string }[];
    };
    expect(list.content[0].text).toContain("about");
    expect(list.content[0].text).toContain("privacy-policy");
  });

  it("tool handlers cover parse and network fallback branches", async () => {
    const registered: RegisteredTool[] = [];
    const registerTool = vi.fn((tool) => {
      registered.push(tool);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool } },
      configurable: true,
    });

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockRejectedValueOnce("overview-failed")
      .mockRejectedValueOnce(new Error("context-failed"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("bad-json");
        },
        text: async () => "raw-json-text",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw "parse-string-error";
        },
        text: async () => {
          throw new Error("cannot-read-body");
        },
      })
      .mockRejectedValueOnce(new Error("network-down"))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "profile-down" }),
      })
      .mockRejectedValueOnce("network-string-error");

    render(<WebMcpInit />);

    const tools = Object.fromEntries(
      registered.map((tool) => [tool.name, tool]),
    );

    const overview = (await tools.get_site_overview.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(overview.isError).toBe(true);
    expect(overview.content[0].text).toContain("Unknown network error.");

    const context = (await tools.get_site_context.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(context.isError).toBe(true);
    expect(context.content[0].text).toContain("context-failed");

    const invalidJsonWithRawText = (await tools.get_content.execute({
      lang: "en",
      slug: "about",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(invalidJsonWithRawText.isError).toBe(true);
    expect(invalidJsonWithRawText.content[0].text).toContain(
      "Invalid JSON response.",
    );
    expect(invalidJsonWithRawText.content[0].text).toContain("raw-json-text");
    expect(invalidJsonWithRawText.content[0].text).toContain("bad-json");

    const invalidJsonWithoutRawText = (await tools.get_content.execute({
      lang: "es",
      slug: "about",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(invalidJsonWithoutRawText.isError).toBe(true);
    expect(invalidJsonWithoutRawText.content[0].text).toContain(
      "Unknown parse error.",
    );
    expect(invalidJsonWithoutRawText.content[0].text).toContain(
      '"rawText": ""',
    );

    const networkErrorObject = (await tools.get_content.execute({
      lang: "en",
      slug: "privacy-policy",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(networkErrorObject.isError).toBe(true);
    expect(networkErrorObject.content[0].text).toContain("Network error.");
    expect(networkErrorObject.content[0].text).toContain("network-down");

    const profileError = (await tools.get_profile.execute({
      lang: "es",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(profileError.isError).toBe(true);
    expect(profileError.content[0].text).toContain("profile-down");

    const networkErrorString = (await tools.get_content.execute({
      lang: "es",
      slug: "privacy-policy",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(networkErrorString.isError).toBe(true);
    expect(networkErrorString.content[0].text).toContain(
      "Unknown network error.",
    );
  });
});
