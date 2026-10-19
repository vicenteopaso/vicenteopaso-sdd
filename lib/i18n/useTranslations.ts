"use client";

import { useParams } from "next/navigation";

import { getTranslations } from "./getTranslations";
import type { Locale } from "./locales";
import { defaultLocale } from "./locales";

/**
 * Hook to access translations for the current locale.
 *
 * Returns a function that resolves a translation key to a string.
 * Supports simple string interpolation for dynamic values.
 *
 * Priority:
 * 1. Locale from URL params (when [lang] routing is fully implemented)
 * 2. Default locale (en)
 *
 * Note: To use client-side locale switching with context, import useClientTranslations from app/components/ClientTranslationProvider
 *
 * @example
 * const t = useTranslations();
 * return <p>{t("nav.contact")}</p>;
 *
 * @example
 * const t = useTranslations();
 * return <p>{t("contact.countdownMessage", { seconds: 5, secondsLabel: "seconds" })}</p>;
 */
export function useTranslations() {
  const params = useParams();
  // Extract locale from URL params, default to "en"
  // Note: When [lang] dynamic segment is fully implemented, params?.lang will be populated
  const locale = (params?.lang as Locale) || defaultLocale;

  // Use the server-side getTranslations function
  return getTranslations(locale);
}
