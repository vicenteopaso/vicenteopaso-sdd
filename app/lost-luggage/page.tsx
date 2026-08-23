import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLocale, isValidLocale, type Locale } from "@/lib/i18n";

// No-locale entry point for the QR code on the luggage tag. Detects the
// visitor's preferred locale from Accept-Language and redirects into the
// localized page; falls back to English when nothing matches.
export const dynamic = "force-dynamic";

function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase().slice(0, 2));

  for (const lang of preferred) {
    if (isValidLocale(lang)) {
      return lang;
    }
  }

  return defaultLocale;
}

export default async function LostLuggageRedirectPage() {
  const headerList = await headers();
  const locale = pickLocale(headerList.get("accept-language"));

  redirect(`/${locale}/lost-luggage` as Route);
}
