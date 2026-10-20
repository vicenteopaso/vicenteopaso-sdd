import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import {
  INDEXABLE_PATHS,
  localizedAlternates,
  localizedPath,
  siteConfig,
} from "@/lib/seo";

// One <url> per locale and page, each listing its hreflang alternates, so
// search engines can pair /en/* and /es/* versions. lastModified is omitted
// on purpose: build time isn't content-change time, and an inaccurate value
// is worse than none.
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: string) => `${siteConfig.url}${path}`;

  return INDEXABLE_PATHS.flatMap((path) =>
    locales.map((locale) => {
      const { languages } = localizedAlternates(locale, path);
      return {
        url: absolute(localizedPath(locale, path)),
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1 : path === "/cv" ? 0.9 : 0.5,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languages ?? {}).map(([lang, href]) => [
              lang,
              absolute(String(href)),
            ]),
          ),
        },
      };
    }),
  );
}
