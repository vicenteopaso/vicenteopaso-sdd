import type { Metadata } from "next";

import { loadContentPage } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

/**
 * Metadata for a markdown-backed page under app/[lang]/<slug>: title and
 * description come from the localized frontmatter, so they can't drift from
 * the rendered page and are never English-only on /es.
 */
export function contentPageMetadata(
  locale: Locale,
  slug: string,
  options: { path?: string; robots?: Metadata["robots"] } = {},
): Metadata {
  const { data } = loadContentPage(locale, slug);
  return pageMetadata({
    locale,
    path: options.path ?? `/${slug}`,
    title: data.title,
    description: data.description ?? data.title,
    robots: options.robots,
  });
}
