import "../../styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import React from "react";

import { AnalyticsWrapper } from "@/app/components/AnalyticsWrapper";
import { BrutalistFooter } from "@/app/components/BrutalistFooter";
import { BrutalistNav } from "@/app/components/BrutalistNav";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { GlobalErrorHandler } from "@/app/components/GlobalErrorHandler";
import { JsonLd } from "@/app/components/JsonLd";
import { LocaleProvider } from "@/app/components/LocaleProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { WebMcpInit } from "@/app/components/WebMcpInit";
import { contrastInitScript } from "@/lib/contrast";
import { getLocaleFromParams, getTranslations, locales } from "@/lib/i18n";
import { baseMetadata, getWebsiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const iconsCacheVersion = process.env.NEXT_PUBLIC_ICONS_CACHE_DATE ?? "1";

// Root layout for every page. It lives under [lang] so <html lang> is correct
// in the prerendered HTML for each locale (ADR-0004). Unknown locales 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });
  return baseMetadata({
    icons: {
      icon: [
        {
          url: `/favicon.svg?v=${iconsCacheVersion}`,
          type: "image/svg+xml",
        },
        {
          url: `/favicon.ico?v=${iconsCacheVersion}`,
        },
        {
          url: `/assets/images/favicon-32x32.png?v=${iconsCacheVersion}`,
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: `/assets/images/favicon-16x16.png?v=${iconsCacheVersion}`,
          sizes: "16x16",
          type: "image/png",
        },
      ],
      apple: `/apple-touch-icon.png?v=${iconsCacheVersion}`,
      shortcut: `/favicon.ico?v=${iconsCacheVersion}`,
    },
    manifest: `/${locale}/manifest.webmanifest`,
    other: {
      "msapplication-config": "/browserconfig.xml",
      "msapplication-TileColor": "#0d0c0a",
    },
  });
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });
  const t = getTranslations(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          // Applies the High Contrast preference before paint, so those
          // visitors never see the default palette flash (lib/contrast.ts).
          dangerouslySetInnerHTML={{ __html: contrastInitScript }}
        />
      </head>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{ background: "var(--v3-bg)", color: "var(--v3-fg)" }}
      >
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <GlobalErrorHandler />
            <a href="#main-content" className="skip-link">
              {t("a11y.skipToContent")}
            </a>
            <style>{`::selection { background-color: var(--v3-accent); color: #fff; }`}</style>
            <JsonLd data={getWebsiteJsonLd(locale)} />
            <BrutalistNav />
            <ErrorBoundary>
              <main id="main-content" className="flex-1 w-full flex flex-col">
                {children}
              </main>
            </ErrorBoundary>
            <BrutalistFooter />
            <WebMcpInit />
          </LocaleProvider>
        </ThemeProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
