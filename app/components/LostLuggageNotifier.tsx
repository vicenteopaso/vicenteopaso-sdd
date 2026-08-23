"use client";

import { useEffect } from "react";

import type { Locale } from "@/lib/i18n";

// Matches the server's `referrer` max length (app/api/lost-luggage-notify/
// route.ts). Omitting an oversized referrer instead of truncating it avoids
// sending a malformed URL that would fail server-side validation and drop
// the whole notification.
const MAX_REFERRER_LENGTH = 500;

// Fires a best-effort beacon to /api/lost-luggage-notify on page view so a
// real visit pages Vicente. Keeps the page itself statically generated —
// only this client component runs per-visit.
export function LostLuggageNotifier({ locale }: { locale: Locale }) {
  useEffect(() => {
    const referrer =
      document.referrer && document.referrer.length <= MAX_REFERRER_LENGTH
        ? document.referrer
        : undefined;

    fetch("/api/lost-luggage-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, referrer }),
      keepalive: true,
    }).catch(() => {
      // Best-effort only — a failed notify should never affect the visitor.
    });
  }, [locale]);

  return null;
}
