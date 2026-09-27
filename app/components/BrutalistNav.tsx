"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n";

import { ContrastToggle } from "./ContrastToggle";
import { useLocale } from "./LocaleProvider";

const imageCacheVersion = process.env.NEXT_PUBLIC_IMAGES_CACHE_DATE;
const imageCacheSuffix = imageCacheVersion ? `?v=${imageCacheVersion}` : "";
const DARK_LOGO = `/assets/images/logo_dark.png${imageCacheSuffix}`;
const LIGHT_LOGO = `/assets/images/logo.png${imageCacheSuffix}`;

export function BrutalistNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTheme = !mounted
    ? "dark"
    : resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : "dark";

  const toggleTheme = () =>
    setTheme(displayTheme === "dark" ? "light" : "dark");

  const logoSrc = displayTheme === "dark" ? DARK_LOGO : LIGHT_LOGO;

  const switchLocale = () => {
    const next = locale === "en" ? "es" : "en";
    const safe = pathname || `/${locale}`;
    router.push(safe.replace(`/${locale}`, `/${next}`) as `/${string}`);
  };

  const isActive = (href: string) => {
    if (!pathname || href.includes("#")) return false;
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: t("nav.about"), href: `/${locale}` },
    { label: t("nav.cv"), href: `/${locale}/cv` },
    { label: t("nav.contact"), href: `/${locale}#contact` },
  ];

  return (
    <header className="v3-nav">
      <div className="v3-nav-inner">
        {/* Brand */}
        <div className="v3-nav-brand">
          <Link
            href={`/${locale}` as Route}
            className="v3-nav-logo"
            aria-label={t("nav.brand")}
          >
            <Image
              src={logoSrc}
              alt=""
              width={40}
              height={40}
              priority
              className="v3-nav-logo-img"
            />
          </Link>
          <span className="v3-nav-meta">{t("nav.version")}</span>
          <span className="v3-nav-meta">—</span>
          <span className="v3-nav-meta v3-accent-text">
            {t("nav.location")}
          </span>
        </div>

        {/* Primary nav */}
        <nav aria-label="Main navigation" className="v3-nav-links">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href as Route}
              className="v3-nav-link"
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="v3-nav-controls">
          <ContrastToggle />
          <button
            type="button"
            onClick={switchLocale}
            className="v3-nav-btn"
            aria-label={`${t("nav.switchLanguage")}: ${locale === "en" ? t("language.es") : t("language.en")}`}
          >
            {locale === "en" ? t("language.es") : t("language.en")}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="v3-nav-btn v3-nav-theme-btn"
            aria-label={t("nav.themeToggle")}
          >
            {displayTheme === "dark" ? "☼" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}
