"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n";

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

  const s = {
    root: {
      borderBottom: "2px solid var(--v3-fg)",
      fontFamily: "var(--f-mono)",
      fontSize: 11,
      letterSpacing: "0.12em",
      background: "var(--v3-bg)",
      color: "var(--v3-fg)",
      position: "sticky" as const,
      top: 0,
      zIndex: 50,
    },
    inner: {
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      maxWidth: 1180,
      margin: "0 auto",
      padding: "14px 32px",
      width: "100%",
    },
  };

  return (
    <header style={s.root}>
      <div style={s.inner} className="v3-nav-inner">
        {/* Brand */}
        <div
          style={{
            display: "flex",
            gap: 18,
            color: "var(--v3-muted)",
            alignItems: "center",
          }}
        >
          <Link
            href={`/${locale}` as Route}
            style={{
              display: "inline-flex",
              alignItems: "center",
              width: 40,
              height: 40,
              textDecoration: "none",
            }}
            aria-label={t("nav.brand")}
          >
            <Image
              src={logoSrc}
              alt=""
              width={40}
              height={40}
              priority
              style={{ transform: "translateY(-4px)" }}
            />
          </Link>
          <span className="v3-nav-meta">{t("nav.version")}</span>
          <span className="v3-nav-meta">—</span>
          <span
            className="v3-nav-meta"
            style={{ color: "var(--v3-accent-text)" }}
          >
            {t("nav.location")}
          </span>
        </div>

        {/* Primary nav */}
        <nav
          aria-label="Main navigation"
          className="v3-nav-links"
          style={{ display: "flex", gap: 24, color: "var(--v3-muted)" }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href as Route}
              style={{
                color: isActive(l.href) ? "var(--v3-fg)" : "inherit",
                textDecoration: "none",
                fontWeight: isActive(l.href) ? 600 : 400,
                borderBottom: isActive(l.href)
                  ? "2px solid var(--v3-accent)"
                  : "none",
                paddingBottom: 2,
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            color: "var(--v3-muted)",
          }}
        >
          <button
            type="button"
            onClick={switchLocale}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "var(--v3-muted)",
              padding: 0,
            }}
            aria-label={`${t("nav.switchLanguage")}: ${locale === "en" ? t("language.es") : t("language.en")}`}
          >
            {locale === "en" ? t("language.es") : t("language.en")}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--f-mono)",
              fontSize: 14,
              color: "var(--v3-muted)",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label={t("nav.themeToggle")}
          >
            {displayTheme === "dark" ? "☼" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}
