"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { useTranslations } from "@/lib/i18n";
import { nextThemeChoice } from "@/lib/theme";

import { ContrastToggle } from "./ContrastToggle";
import { GitHubIcon } from "./icons";
import { useLocale } from "./LocaleProvider";

const imageCacheVersion = process.env.NEXT_PUBLIC_IMAGES_CACHE_DATE;
const imageCacheSuffix = imageCacheVersion ? `?v=${imageCacheVersion}` : "";
const DARK_LOGO = `/assets/images/logo_dark.png${imageCacheSuffix}`;
const LIGHT_LOGO = `/assets/images/logo.png${imageCacheSuffix}`;
const REPO_URL = "https://github.com/vicenteopaso/vicenteopaso-sdd";

export function BrutalistNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const { resolvedTheme, systemTheme, setTheme } = useTheme();
  const t = useTranslations();

  const toggleTheme = () =>
    setTheme(nextThemeChoice(resolvedTheme, systemTheme));

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
            {/* Both variants render; CSS shows the one matching the theme
                class next-themes sets on <html> before paint, so the logo
                is right on first paint, before hydration. */}
            <Image
              src={DARK_LOGO}
              alt=""
              width={40}
              height={40}
              priority
              className="v3-nav-logo-img v3-nav-logo-img--dark"
            />
            <Image
              src={LIGHT_LOGO}
              alt=""
              width={40}
              height={40}
              priority
              className="v3-nav-logo-img v3-nav-logo-img--light"
            />
          </Link>
          <span className="v3-nav-meta">{t("nav.version")}</span>
          <span className="v3-nav-meta">—</span>
          <span className="v3-nav-meta v3-accent-text">
            {t("nav.location")}
          </span>
        </div>

        {/* Primary nav */}
        <nav aria-label={t("nav.mainLabel")} className="v3-nav-links">
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
          <span className="v3-nav-sep">·</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="v3-nav-btn v3-nav-theme-btn"
            aria-label={t("nav.themeToggle")}
          >
            <span aria-hidden="true" className="v3-theme-glyph--sun">
              ☼
            </span>
            <span aria-hidden="true" className="v3-theme-glyph--moon">
              ☾
            </span>
          </button>
          <span aria-hidden="true" className="v3-nav-sep">
            ·
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="v3-nav-icon-link"
            aria-label={t("nav.sourceCode")}
          >
            <GitHubIcon className="v3-nav-icon" />
          </a>
        </div>
      </div>
    </header>
  );
}
