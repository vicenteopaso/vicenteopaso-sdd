import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sentryClientMock = vi.hoisted(() => ({
  init: vi.fn(),
  addIntegration: vi.fn(),
  lazyLoadIntegration: vi.fn(),
  captureRouterTransitionStart: vi.fn(() => ({ type: "router-transition" })),
}));

vi.mock("@sentry/nextjs", () => sentryClientMock);

type SentryClientMock = typeof sentryClientMock;
interface InitOptions {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  integrations?: unknown;
}

// Helper to import the client instrumentation fresh per test with new env.
async function importClientInstrumentation() {
  vi.resetModules();
  return import("../../instrumentation-client");
}

describe("instrumentation-client Sentry init", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;
  // Each fresh import adds window listeners; track them so one test's
  // listeners can't fire during the next.
  const windowListeners: [string, EventListenerOrEventListenerObject][] = [];
  const realAddEventListener = window.addEventListener.bind(window);

  beforeEach(() => {
    vi.spyOn(window, "addEventListener").mockImplementation(
      (type, listener, options) => {
        windowListeners.push([type, listener]);
        realAddEventListener(type, listener, options);
      },
    );
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    sentryClientMock.init.mockClear();
    sentryClientMock.addIntegration.mockClear();
    sentryClientMock.lazyLoadIntegration.mockReset();
    sentryClientMock.captureRouterTransitionStart.mockClear();
    delete process.env.VITEST;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.SENTRY_ENVIRONMENT;
    delete process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
  });

  afterEach(() => {
    for (const [type, listener] of windowListeners.splice(0)) {
      window.removeEventListener(type, listener);
    }
    vi.mocked(window.addEventListener).mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.VITEST;
    delete process.env.SENTRY_ENVIRONMENT;
    delete process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
  });

  it("exports onRouterTransitionStart hook", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    const mod = await importClientInstrumentation();
    expect(mod.onRouterTransitionStart).toBeDefined();
    mod.onRouterTransitionStart("/from", "/to");
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.captureRouterTransitionStart).toHaveBeenCalled();
  });

  it("skips init and warns when NEXT_PUBLIC_SENTRY_DSN is missing (dev)", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("No NEXT_PUBLIC_SENTRY_DSN provided"),
    );
  });

  it("skips init and warns when DSN looks invalid", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://INVALID_DSN_NOT_PUBLIC";

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("does not look like a public client key"),
    );
  });

  it("skips init silently in production when DSN missing (no leak)", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("initializes Sentry with valid public DSN, without bundling Replay", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = "prod-env";

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).toHaveBeenCalledTimes(1);
    const initArg = sentry.init.mock.calls[0][0] as InitOptions;
    expect(initArg.dsn).toBe(process.env.NEXT_PUBLIC_SENTRY_DSN);
    expect(initArg.environment).toBe("prod-env");
    expect(initArg.tracesSampleRate).toBe(0.1);
    expect(initArg.replaysSessionSampleRate).toBe(0.1);
    expect(initArg.replaysOnErrorSampleRate).toBe(1.0);
    expect(initArg.integrations).toBeUndefined();
    expect(sentry.lazyLoadIntegration).not.toHaveBeenCalled();
  });

  it("tags events with the inlined public environment, not SENTRY_ENVIRONMENT", async () => {
    // Regression: the client read SENTRY_ENVIRONMENT, which Next.js never
    // exposes to the browser, so preview deployments reported "production".
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";
    process.env.SENTRY_ENVIRONMENT = "server-only-value";

    await importClientInstrumentation();
    const initArg = sentryClientMock.init.mock.calls[0][0] as InitOptions;
    expect(initArg.environment).toBe("production");

    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = "preview";
    sentryClientMock.init.mockClear();
    await importClientInstrumentation();
    const previewArg = sentryClientMock.init.mock.calls[0][0] as InitOptions;
    expect(previewArg.environment).toBe("preview");
  });

  it("lazy-loads Session Replay once, on the first interaction", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";
    const replay = { name: "Replay" };
    const replayIntegration = vi.fn(() => replay);
    sentryClientMock.lazyLoadIntegration.mockResolvedValue(replayIntegration);

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;

    window.dispatchEvent(new Event("pointerdown"));
    window.dispatchEvent(new Event("keydown"));
    await vi.waitFor(() => {
      expect(sentry.addIntegration).toHaveBeenCalledWith(replay);
    });
    expect(sentry.lazyLoadIntegration).toHaveBeenCalledTimes(1);
    expect(sentry.lazyLoadIntegration).toHaveBeenCalledWith(
      "replayIntegration",
    );
  });

  it("warns instead of throwing when Session Replay fails to load", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";
    const failure = new Error("blocked");
    sentryClientMock.lazyLoadIntegration.mockRejectedValue(failure);

    await importClientInstrumentation();
    window.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        "[Sentry] Session Replay failed to load.",
        failure,
      );
    });
    expect(sentryClientMock.addIntegration).not.toHaveBeenCalled();
  });

  it("initializes Sentry with a region-scoped DSN (e.g. EU/DE data residency)", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.de.sentry.io/9999999";

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).toHaveBeenCalledTimes(1);
    const initArg = sentry.init.mock.calls[0][0] as InitOptions;
    expect(initArg.dsn).toBe(process.env.NEXT_PUBLIC_SENTRY_DSN);
  });

  it("prints debug message when VITEST flag is set and actually skips Sentry.init", async () => {
    process.env = { ...process.env, NODE_ENV: "test" };
    process.env.VITEST = "true";
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";

    await importClientInstrumentation();
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining("Skipping client init in tests"),
    );
    // Regression: the "skip in tests" branch used to be a no-op that only
    // logged, then fell through and still validated/initialized Sentry.
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
  });
});
