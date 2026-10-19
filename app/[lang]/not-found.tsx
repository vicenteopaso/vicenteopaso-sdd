"use client";

import type { Route } from "next";
import Link from "next/link";

import { useLocale } from "@/app/components/LocaleProvider";
import { useTranslations } from "@/lib/i18n";

// Client component: not-found boundaries don't receive route params, so the
// locale comes from the provider the [lang] layout already renders.
export default function NotFound() {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <section className="v3-not-found">
      <h1 className="v3-not-found-code">404</h1>
      <p className="v3-not-found-text">{t("notFound.text")}</p>
      <Link href={`/${locale}` as Route} className="v3-not-found-link">
        {t("notFound.home")}
      </Link>
    </section>
  );
}
