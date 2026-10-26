import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sentryMock = vi.hoisted(() => ({
  init: vi.fn(),
  getCurrentHub: vi.fn(() => ({
    getClient: () => null,
  })),
  captureRequestError: vi.fn(),
  consoleLoggingIntegration: vi.fn(() => ({ name: "ConsoleLogs" })),
}));

vi.mock("@sentry/nextjs", () => sentryMock);

// Helper to import the module fresh so it sees updated env vars between tests.
async function importInstrumentation() {
  // Ensure a fresh module instance for each test
  vi.resetModules();
  return import("../../instrumentation");
}

describe("instrumentation register()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    sentryMock.init.mockClear();
    sentryMock.getCurrentHub.mockClear();
    sentryMock.captureRequestError.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  it("imports server Sentry config when NEXT_RUNTIME is nodejs in production", async () => {
    process.env = {
      ...process.env,
      NEXT_RUNTIME: "nodejs",
      NODE_ENV: "production",
    };

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });

  it("does not import server Sentry config when NEXT_RUNTIME is nodejs outside production", async () => {
    process.env = {
      ...process.env,
      NEXT_RUNTIME: "nodejs",
      NODE_ENV: "development",
    };

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });

  it("imports edge Sentry config when NEXT_RUNTIME is edge", async () => {
    process.env.NEXT_RUNTIME = "edge";

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });

  it("is a no-op when NEXT_RUNTIME is not set", async () => {
    delete process.env.NEXT_RUNTIME;

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });

  it("re-exports captureRequestError as onRequestError", async () => {
    const mod = await importInstrumentation();

    expect(mod.onRequestError).toBe(sentryMock.captureRequestError);
  });
});
