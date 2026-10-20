import enUI from "@/i18n/en/ui.json";
import esUI from "@/i18n/es/ui.json";

import type { Locale } from "./locales";
import { defaultLocale, isValidLocale } from "./locales";

type UITranslations = typeof enUI;
type TranslationKey = keyof UITranslations;

const dictionaries: Record<Locale, UITranslations> = {
  en: enUI,
  es: esUI as UITranslations,
};

/**
 * Simple string interpolation helper.
 * Replaces {key} placeholders with values from the replacements object.
 *
 * @example
 * interpolate("Hello {name}!", { name: "World" }) // "Hello World!"
 */
function interpolate(
  template: string,
  replacements?: Record<string, string | number>,
): string {
  if (!replacements) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = replacements[key.trim()];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get the current locale from URL params (for server components).
 * Falls back to default locale if not found or invalid.
 */
export function getLocaleFromParams(
  params: { lang?: string } | undefined,
): Locale {
  if (!params?.lang) {
    return defaultLocale;
  }

  // Validate the locale parameter
  const locale = params.lang as Locale;
  return isValidLocale(locale) ? locale : defaultLocale;
}

/**
 * Get translations dictionary for a specific locale (for server components).
 */
export function getTranslations(locale: Locale = defaultLocale) {
  const dict = dictionaries[locale] || dictionaries[defaultLocale];

  return function t(
    key: TranslationKey,
    replacements?: Record<string, string | number>,
  ): string {
    // Try to get value from current locale dictionary
    let value = dict[key];

    // Fallback to default locale (English) if translation is missing
    if (value === undefined && locale !== defaultLocale) {
      value = dictionaries[defaultLocale][key];
    }

    if (value === undefined) {
      // Fallback to key if translation is missing in both locales
      // eslint-disable-next-line no-console
      console.warn(`Missing translation for key: ${String(key)}`);
      return String(key);
    }
    return interpolate(value, replacements);
  };
}

export type { TranslationKey };
export type { Locale } from "./locales";
