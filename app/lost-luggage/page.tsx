import type { Route } from "next";
import { redirect } from "next/navigation";

// /lost-luggage was the original no-locale entry point for the QR code on
// the luggage tag, renamed to /found-luggage since the page is addressed to
// whoever *found* the bag. Kept as a permanent redirect so tags already
// printed with the old URL keep working; /found-luggage still does the
// Accept-Language-based locale detection.
export const dynamic = "force-static";

export default function LostLuggageRedirectPage() {
  redirect("/found-luggage" as Route);
}
