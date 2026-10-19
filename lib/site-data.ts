// Static site data used by the brutalist v3 design (landing + CV)
// These values come from the approved design prototype and complement content/*/cv.json

import enSiteData from "@/i18n/en/site-data.json";
import esSiteData from "@/i18n/es/site-data.json";
import type { Locale } from "@/lib/i18n";

type SiteDataJson = typeof enSiteData;

const siteDataByLocale: Record<Locale, SiteDataJson> = {
  en: enSiteData,
  es: esSiteData as SiteDataJson,
};

/** Get locale-specific site data (TL;DR, Focus areas, Impact stats, TOC entries). */
export function getSiteData(locale: Locale = "en"): SiteDataJson {
  return siteDataByLocale[locale] ?? siteDataByLocale.en;
}
