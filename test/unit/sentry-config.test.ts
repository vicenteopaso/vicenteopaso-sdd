import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveTracesSampleRate } from "../../lib/sentry-config";

const sentryMock = vi.hoisted(() => ({
  init: vi.fn(),
  consoleLoggingIntegration: vi.fn((options: unknown) => ({
    name: "ConsoleLogs",
    options,
  })),
}));

vi.mock("@sentry/nextjs", () => sentryMock);

interface InitOptions {
  tracesSampleRate: number | undefined;
  integrations: { name: string; options: { levels: string[] } }[];
}

describe("resolveTracesSampleRate", () => {
  it("turns tracing off when unset or empty", () => {
    expect(resolveTracesSampleRate(undefined)).toBeUndefined();
    expect(resolveTracesSampleRate("")).toBeUndefined();
  });

  it("turns tracing off for 0, since the SDK still creates spans at rate 0", () => {
    expect(resolveTracesSampleRate("0")).toBeUndefined();
  });

  it("parses rates above 0 and up to 1", () => {
    expect(resolveTracesSampleRate("0.25")).toBe(0.25);
    expect(resolveTracesSampleRate("1")).toBe(1);
  });

  it("turns tracing off for non-numeric or out-of-range values", () => {
    expect(resolveTracesSampleRate("abc")).toBeUndefined();
    expect(resolveTracesSampleRate("-0.5")).toBeUndefined();
    expect(resolveTracesSampleRate("1.5")).toBeUndefined();
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

  it("leaves tracing off when SENTRY_TRACES_SAMPLE_RATE is unset", async () => {
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
    await import(modulePath);
    const options = sentryMock.init.mock.calls[0][0] as InitOptions;
    expect(options.tracesSampleRate).toBeUndefined();
  });

  it("forwards console warnings and errors to Sentry Logs", async () => {
    await import(modulePath);
    const options = sentryMock.init.mock.calls[0][0] as InitOptions;
    expect(options.integrations).toEqual([
      { name: "ConsoleLogs", options: { levels: ["warn", "error"] } },
    ]);
  });
});
