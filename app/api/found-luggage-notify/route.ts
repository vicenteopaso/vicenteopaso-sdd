import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logWarning } from "@/lib/error-logging";
import { locales } from "@/lib/i18n";
import { checkRateLimitForKey } from "@/lib/rate-limit";

// Fires a best-effort notification (Telegram + Formspree) whenever the
// unlisted /found-luggage page is viewed, so a real visit reaches Vicente
// directly. Failures here never surface to the visitor.

const notifySchema = z.object({
  locale: z.enum(locales),
  referrer: z.string().url().max(500).optional(),
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FORMSPREE_KEY = process.env.NEXT_PUBLIC_FORMSPREE_KEY;

const MAX_FIELD_LENGTH = 200;

// Collapses newlines and bounds length so request-controlled fields (referrer,
// user-agent, geo headers) can't inject extra lines into the Telegram/Formspree
// message or blow past their size limits.
function sanitizeField(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, MAX_FIELD_LENGTH);
}

function buildMessage(params: {
  locale: string;
  referrer: string | undefined;
  userAgent: string;
  country: string;
  city: string;
  timestamp: string;
}): string {
  const { locale, referrer, userAgent, country, city, timestamp } = params;
  return [
    "Someone opened the found-luggage page.",
    `Time: ${timestamp}`,
    `Locale: ${locale}`,
    `Location: ${sanitizeField(city)}, ${sanitizeField(country)}`,
    `Referrer: ${referrer ? sanitizeField(referrer) : "(none)"}`,
    `User agent: ${sanitizeField(userAgent)}`,
  ].join("\n");
}

async function notifyTelegram(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Telegram notify failed with status ${response.status}`);
  }
}

async function notifyFormspree(message: string): Promise<void> {
  if (!FORMSPREE_KEY) {
    return;
  }

  const response = await fetch(`https://formspree.io/f/${FORMSPREE_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      subject: "Found luggage page viewed",
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Formspree notify failed with status ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  // Best-effort CSRF/spam guard: browsers send Origin on POST requests, so
  // reject cross-site callers when it's present but doesn't match the origin
  // the request actually arrived at (works across dev/preview/prod without
  // hardcoding a domain). Requests without an Origin header (e.g.
  // server-to-server) are unaffected.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ ok: true });
  }

  let parsed: z.infer<typeof notifySchema>;
  try {
    const json = await request.json();
    parsed = notifySchema.parse(json);
  } catch {
    // Malformed payloads are rejected before touching the rate limiter, so
    // they can't be used to burn a legitimate visitor's quota.
    return NextResponse.json({ ok: true });
  }

  const ipFromHeader =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    undefined;
  const clientIp = ipFromHeader?.split(",")[0].trim() ?? "unknown";

  const rateLimitResult = checkRateLimitForKey(`found-luggage:${clientIp}`);
  if (!rateLimitResult.allowed) {
    const { retryAfterSeconds } = rateLimitResult;
    return new NextResponse(JSON.stringify({ error: "Too many requests." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    });
  }

  const message = buildMessage({
    locale: parsed.locale,
    referrer: parsed.referrer,
    userAgent: request.headers.get("user-agent") || "(unknown)",
    country: request.headers.get("x-vercel-ip-country") || "(unknown)",
    city: request.headers.get("x-vercel-ip-city") || "(unknown)",
    timestamp: new Date().toISOString(),
  });

  const results = await Promise.allSettled([
    notifyTelegram(message),
    notifyFormspree(message),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      logWarning("Found luggage notify failed", {
        component: "found-luggage-notify",
        metadata: { reason: String(result.reason) },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
