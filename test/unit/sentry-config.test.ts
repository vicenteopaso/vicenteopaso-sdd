import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_TRACES_SAMPLE_RATE,
  resolveTracesSampleRate,
} from "../../lib/sentry-config";

const sentryMock = vi.hoisted(() => ({
  init: vi.fn(),
  consoleLoggingIntegration: vi.fn((options: unknown) => ({
    name: "ConsoleLogs",
    options,
  })),
}));

vi.mock("@sentry/nextjs", () => sentryMock);

interface InitOptions {
  tracesSampleRate: number;
  integrations: { name: string; options: { levels: string[] } }[];
}

describe("resolveTracesSampleRate", () => {
  it("defaults when unset or empty", () => {
    expect(resolveTracesSampleRate(undefined)).toBe(DEFAULT_TRACES_SAMPLE_RATE);
    expect(resolveTracesSampleRate("")).toBe(DEFAULT_TRACES_SAMPLE_RATE);
  });

  it("parses valid rates, including 0 and 1", () => {
    expect(resolveTracesSampleRate("0")).toBe(0);
    expect(resolveTracesSampleRate("0.25")).toBe(0.25);
    expect(resolveTracesSampleRate("1")).toBe(1);
  });

  it("defaults for non-numeric or out-of-range values", () => {
    expect(resolveTracesSampleRate("abc")).toBe(DEFAULT_TRACES_SAMPLE_RATE);
    expect(resolveTracesSampleRate("-0.5")).toBe(DEFAULT_TRACES_SAMPLE_RATE);
    expect(resolveTracesSampleRate("1.5")).toBe(DEFAULT_TRACES_SAMPLE_RATE);
  });
});

describe.each([
  ["server", "../../sentry.server.config"],
  ["edge", "../../sentry.edge.config"],
])("sentry.%s.config", (_runtime, modulePath) => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Production-like env so the server config does not take its test skip.
    process.env = { ...originalEnv, NODE_ENV: "production" };
    delete process.env.VITEST;
    sentryMock.init.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("honours SENTRY_TRACES_SAMPLE_RATE", async () => {
    process.env.SENTRY_TRACES_SAMPLE_RATE = "0.5";
    await import(modulePath);
    const options = sentryMock.init.mock.calls[0][0] as InitOptions;
    expect(options.tracesSampleRate).toBe(0.5);
  });

  it("forwards console warnings and errors to Sentry Logs", async () => {
    await import(modulePath);
    const options = sentryMock.init.mock.calls[0][0] as InitOptions;
    expect(options.integrations).toEqual([
      { name: "ConsoleLogs", options: { levels: ["warn", "error"] } },
    ]);
  });
});
