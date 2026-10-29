import type { NextRequest } from "next/server";

import type { Locale } from "../../../lib/i18n/locales";
import { locales } from "../../../lib/i18n/locales";

const icons = [
  {
    src: "/png/light-bg/icon-light-bg-192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/png/light-bg/icon-light-bg-512.png",
    sizes: "512x512",
    type: "image/png",
  },
  {
    src: "/maskable/maskable-512-light.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

// Built once per locale at deploy time. Browsers fetch the manifest from
// every page, so a dynamic handler cost a Vercel Function call each time.
export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ lang: string }> },
) {
  const { lang: rawLang } = await context.params;
  const lang: Locale = locales.includes(rawLang as Locale)
    ? (rawLang as Locale)
    : "en";

  const manifest = {
    name: "opa.so — Vicente Opaso",
    short_name: "opa.so",
    description:
      lang === "es"
        ? "Vicente Opaso · Arquitecto Frontend"
        : "Vicente Opaso · Frontend Architect",
    start_url: `/${lang}`,
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#0d0c0a",
    icons,
  };

  return Response.json(manifest, {
    headers: { "content-type": "application/manifest+json" },
  });
}
