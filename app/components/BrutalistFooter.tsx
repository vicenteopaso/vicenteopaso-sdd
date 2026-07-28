"use client";

import type { Route } from "next";
import Link from "next/link";
import React from "react";

import { useTranslations } from "@/lib/i18n";

import { useLocale } from "./LocaleProvider";

export function BrutalistFooter() {
  const t = useTranslations();
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  const footerLinks = [
    { labelKey: "footer.privacyPolicy" as const, path: "privacy-policy" },
    { labelKey: "footer.cookiePolicy" as const, path: "cookie-policy" },
    { labelKey: "footer.accessibility" as const, path: "accessibility" },
    {
      labelKey: "footer.technicalGovernance" as const,
      path: "technical-governance",
    },
    { labelKey: "footer.techStack" as const, path: "tech-stack" },
  ];

  return (
    <footer
      style={{
        background: "var(--v3-bg)",
        color: "var(--v3-fg)",
        fontFamily: "var(--f-mono)",
        borderTop: "2px solid var(--v3-fg)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "24px 32px 28px",
          display: "grid",
          gap: 14,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--v3-muted)",
            letterSpacing: "0.14em",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
          className="v3-footer-copyright"
        >
          <span>{t("footer.copyrightName", { year })}</span>
          <span>{t("footer.copyrightTagline")}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 14px",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="v3-footer-links"
        >
          {footerLinks.map((l, i) => (
            <React.Fragment key={l.path}>
              <Link
                href={`/${locale}/${l.path}` as Route}
                style={{
                  fontSize: 10.5,
                  color: "var(--v3-accent-text)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  letterSpacing: "0.06em",
                  fontFamily: "var(--f-mono)",
                }}
              >
                {t(l.labelKey)}
              </Link>
              {i < footerLinks.length - 1 && (
                <span
                  style={{
                    fontSize: 10.5,
                    color: "var(--v3-muted)",
                    fontFamily: "var(--f-mono)",
                  }}
                >
                  |
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}
