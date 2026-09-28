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
    <footer className="v3-footer">
      <div className="v3-footer-inner">
        <div className="v3-footer-copyright">
          <span>{t("footer.copyrightName", { year })}</span>
          <span>{t("footer.copyrightTagline")}</span>
        </div>

        <div className="v3-footer-links">
          {footerLinks.map((l, i) => (
            <React.Fragment key={l.path}>
              <Link
                href={`/${locale}/${l.path}` as Route}
                className="v3-footer-link"
              >
                {t(l.labelKey)}
              </Link>
              {i < footerLinks.length - 1 && (
                <span className="v3-footer-sep">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}
