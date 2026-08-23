import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logWarning } from "@/lib/error-logging";
import { checkRateLimitForKey } from "@/lib/rate-limit";

// Fires a best-effort notification (Telegram + Formspree) whenever the
// unlisted /lost-luggage page is viewed, so a real visit reaches Vicente
// directly. Failures here never surface to the visitor.

const notifySchema = z.object({
  locale: z.string().max(10),
  referrer: z.string().max(500).optional(),
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FORMSPREE_KEY = process.env.NEXT_PUBLIC_FORMSPREE_KEY;

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
    "Someone opened the lost-luggage page.",
    `Time: ${timestamp}`,
    `Locale: ${locale}`,
    `Location: ${city}, ${country}`,
    `Referrer: ${referrer || "(none)"}`,
    `User agent: ${userAgent}`,
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
      subject: "Lost luggage page viewed",
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Formspree notify failed with status ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  const ipFromHeader =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    undefined;
  const clientIp = ipFromHeader?.split(",")[0].trim() ?? "unknown";

  const rateLimitResult = checkRateLimitForKey(`lost-luggage:${clientIp}`);
  if (!rateLimitResult.allowed) {
    // Silently accept — a rate-limited notify attempt shouldn't error out
    // for the visitor, it just won't page Vicente again this window.
    return NextResponse.json({ ok: true });
  }

  let parsed: z.infer<typeof notifySchema>;
  try {
    const json = await request.json();
    parsed = notifySchema.parse(json);
  } catch {
    return NextResponse.json({ ok: true });
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
      logWarning("Lost luggage notify failed", {
        component: "lost-luggage-notify",
        metadata: { reason: String(result.reason) },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
