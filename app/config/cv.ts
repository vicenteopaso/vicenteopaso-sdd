import type { Locale } from "@/lib/i18n";

export function getCvDownloadPath(locale: Locale): `/${Locale}/cv/download` {
  return `/${locale}/cv/download`;
}

export function getCvDownloadFilename(locale: Locale): string {
  return `vicente-opaso-cv-${locale}.pdf`;
}
