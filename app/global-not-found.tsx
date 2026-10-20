import "../styles/globals.css";

import type { Metadata, Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import {
  defaultLocale,
  getTranslations,
  isValidLocale,
  type Locale,
  LOCALE_REQUEST_HEADER,
} from "@/lib/i18n";

// 404 page for every unmatched URL. The root layout lives under app/[lang]
// (per-locale <html lang>), and Next.js does not attach a not-found boundary
// at that level, so notFound()/unmatched routes render here instead
// (experimental.globalNotFound; see ADR-0004). It bypasses the layout, so it
// imports global styles itself and localizes from the header proxy.ts sets.
export const metadata: Metadata = {
  title: "404 — Vicente Opaso",
  robots: { index: false, follow: false },
};

async function requestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_REQUEST_HEADER);
  return value && isValidLocale(value) ? value : defaultLocale;
}

export default async function GlobalNotFound() {
  const locale = await requestLocale();
  const t = getTranslations(locale);

  return (
    <html lang={locale}>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{ background: "var(--v3-bg)", color: "var(--v3-fg)" }}
      >
        <main id="main-content" className="flex-1 w-full flex flex-col">
          <section className="v3-not-found">
            <h1 className="v3-not-found-code">404</h1>
            <p className="v3-not-found-text">{t("notFound.text")}</p>
            <Link href={`/${locale}` as Route} className="v3-not-found-link">
              {t("notFound.home")}
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
