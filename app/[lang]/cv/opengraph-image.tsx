import { type Locale, locales } from "../../../lib/i18n/locales";
import { createCvOgImage, getOgHomeSize } from "../../../lib/og-home-image";

export const runtime = "nodejs";
// Rendered once per locale at build time. Its inputs only change on deploy,
// and the previous hourly revalidate re-rendered it (Satori + PNG encoding,
// a costly Vercel Function call) whenever a crawler hit it. Invalidation is
// handled by bumping NEXT_PUBLIC_OG_CACHE_DATE (see ogCacheVersion in
// lib/seo.ts).
export const revalidate = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const size = getOgHomeSize();

export const contentType = "image/png";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Image({ params }: Props) {
  const { lang } = await params;
  return createCvOgImage(lang, "dark");
}
