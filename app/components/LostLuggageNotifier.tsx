"use client";

import { useEffect } from "react";

// Fires a best-effort beacon to /api/lost-luggage-notify on page view so a
// real visit pages Vicente. Keeps the page itself statically generated —
// only this client component runs per-visit.
export function LostLuggageNotifier({ locale }: { locale: string }) {
  useEffect(() => {
    fetch("/api/lost-luggage-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        referrer: document.referrer || undefined,
      }),
      keepalive: true,
    }).catch(() => {
      // Best-effort only — a failed notify should never affect the visitor.
    });
  }, [locale]);

  return null;
}
