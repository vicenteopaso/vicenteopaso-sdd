import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_ORIGIN = "http://localhost:3000";

interface MockRequestInit {
  json: () => Promise<unknown>;
  headers?: Headers;
  nextUrl: { origin: string };
}

async function createPostHandler() {
  // Reload module fresh for each test so env changes are picked up.
  vi.resetModules();
  const mod = await import("../../app/api/lost-luggage-notify/route");
  return mod.POST as (req: NextRequest) => Promise<Response>;
}

function createRequest(body: unknown, headers?: Record<string, string>) {
  const h = new Headers(headers);
  const init: MockRequestInit = {
    json: async () => body,
    headers: h,
    nextUrl: { origin: TEST_ORIGIN },
  };

  return init as unknown as NextRequest;
}

function isRequestToHost(call: unknown[], hostname: string): boolean {
  return new URL(String(call[0])).hostname === hostname;
}

const basePayload = {
  locale: "en",
  referrer: "https://example.com/qr",
};

describe("app/api/lost-luggage-notify/route POST", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "bot-token";
    process.env.TELEGRAM_CHAT_ID = "chat-id";
    process.env.NEXT_PUBLIC_FORMSPREE_KEY = "forms-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("notifies Telegram and Formspree and returns ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.5",
      "user-agent": "test-agent",
      "x-vercel-ip-country": "ES",
      "x-vercel-ip-city": "Madrid",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const telegramCall = fetchMock.mock.calls.find((call) =>
      isRequestToHost(call, "api.telegram.org"),
    );
    expect(telegramCall).toBeDefined();
    expect(String(telegramCall?.[0])).toContain("bot-token");
    const telegramBody = JSON.parse(
      (telegramCall?.[1] as { body: string }).body,
    );
    expect(telegramBody.chat_id).toBe("chat-id");
    expect(telegramBody.text).toContain("Locale: en");
    expect(telegramBody.text).toContain("Madrid, ES");
    expect(telegramBody.text).toContain("https://example.com/qr");
    expect(telegramBody.text).toContain("test-agent");

    const formspreeCall = fetchMock.mock.calls.find((call) =>
      isRequestToHost(call, "formspree.io"),
    );
    expect(formspreeCall).toBeDefined();
    expect(String(formspreeCall?.[0])).toContain("forms-key");
  });

  it("truncates an oversized request-controlled field before sending", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    // The Headers API itself rejects raw CR/LF in header values (per the
    // Fetch spec), so header-sourced fields can't carry literal newlines —
    // the exploitable part of an oversized/attacker-controlled header is
    // unbounded length, which this test covers.
    const oversizedUserAgent = `evil-agent-${"x".repeat(400)}`;
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.12",
      "user-agent": oversizedUserAgent,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const telegramCall = fetchMock.mock.calls.find((call) =>
      isRequestToHost(call, "api.telegram.org"),
    );
    const telegramBody = JSON.parse(
      (telegramCall?.[1] as { body: string }).body,
    );

    const userAgentLine = telegramBody.text
      .split("\n")
      .find((line: string) => line.startsWith("User agent:"));
    expect(userAgentLine).toBeDefined();
    expect(userAgentLine.length).toBeLessThanOrEqual(
      "User agent: ".length + 200,
    );
    expect(oversizedUserAgent.length).toBeGreaterThan(200);
  });

  it("skips Telegram when credentials are not configured", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.6",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // Only Formspree should have been called.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(isRequestToHost(fetchMock.mock.calls[0], "formspree.io")).toBe(
      true,
    );
  });

  it("skips Formspree when the key is not configured", async () => {
    delete process.env.NEXT_PUBLIC_FORMSPREE_KEY;

    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.7",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(isRequestToHost(fetchMock.mock.calls[0], "api.telegram.org")).toBe(
      true,
    );
  });

  it("logs a warning but still returns ok when a notifier fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const errorLogging = await import("../../lib/error-logging");
    const warnSpy = vi
      .spyOn(errorLogging, "logWarning")
      .mockImplementation(() => {});

    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.8",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns ok without calling any service when locale is not a valid type", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(
      { locale: 12345 },
      { "x-forwarded-for": "203.0.113.9" },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns ok without calling any service when locale is not a supported locale", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(
      { locale: "fr" },
      { "x-forwarded-for": "203.0.113.10" },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns ok without calling any service when referrer is not a valid URL", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(
      { locale: "en", referrer: "not-a-url" },
      { "x-forwarded-for": "203.0.113.11" },
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns ok without calling any service when Origin doesn't match the request host", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.13",
      origin: "https://evil.example.com",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("notifies as usual when Origin matches the request host", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.14",
      origin: TEST_ORIGIN,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("notifies as usual when no Origin header is present (server-to-server)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.15",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 429 with Retry-After once the per-IP rate limit is exceeded", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const POST = await createPostHandler();
    const ip = "198.51.100.20";

    for (let i = 0; i < 5; i += 1) {
      const res = await POST(
        createRequest(basePayload, { "x-forwarded-for": ip }),
      );
      expect(res.status).toBe(200);
    }

    const callsAfterFive = fetchMock.mock.calls.length;

    const blockedRes = await POST(
      createRequest(basePayload, { "x-forwarded-for": ip }),
    );
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    const blockedJson = (await blockedRes.json()) as { error: string };
    expect(blockedJson.error.toLowerCase()).toContain("too many requests");
    // No additional external calls once rate-limited.
    expect(fetchMock.mock.calls.length).toBe(callsAfterFive);
  });
});
