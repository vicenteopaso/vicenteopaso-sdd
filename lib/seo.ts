import type { Metadata } from "next";

import type { Cv } from "@/lib/cv";
import type { Locale } from "@/lib/i18n/locales";
import { defaultLocale, locales } from "@/lib/i18n/locales";

export const siteConfig = {
  name: "Vicente Opaso",
  domain: "opa.so",
  url: "https://opa.so",
  description:
    "Frontend Architect & Technical Leader specializing in Composable Platforms, Design Systems and Developer Experience (DevEx). View the CV and contact details for Vicente Opaso.",
};

/**
 * Standardized description for CV-related Open Graph metadata.
 * Used in CV page metadata and OG image generation.
 * @param locale - The locale to use for the description
 * @returns Localized CV description
 */
export function getCvDescription(locale: string): string {
  return locale === "es"
    ? "Roles Seleccionados de Liderazgo Técnico: Experiencia del Desarrollador (DevEx), Impacto en Ingeniería de Software, y Liderazgo en Design Systems."
    : "Selected Technical Leadership Roles: Developer Experience (DevEx), Software Engineering Impact, and Design Systems Leadership.";
}

export const ogCacheVersion = process.env.NEXT_PUBLIC_OG_CACHE_DATE ?? "1";

export function baseMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const base: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — Software Engineering Leader & Frontend Architect`,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `/opengraph-image?v=${ogCacheVersion}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      site: "@vicenteopaso",
      creator: "@vicenteopaso",
      images: [`/opengraph-image?v=${ogCacheVersion}`],
    },
  };

  const {
    openGraph: overrideOg,
    twitter: overrideTwitter,
    ...restOverrides
  } = overrides;

  return {
    ...base,
    ...restOverrides,
    openGraph: {
      ...(base.openGraph ?? {}),
      ...(overrideOg ?? {}),
    },
    twitter: {
      ...(base.twitter ?? {}),
      ...(overrideTwitter ?? {}),
    },
  };
}

// ─── Localized URLs ──────────────────────────────────────────────────────────

const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_ES" };

/** Locale-prefixed, root-relative path, e.g. ("es", "/cv") → "/es/cv". */
export function localizedPath(locale: Locale, path = ""): `/${string}` {
  return `/${locale}${path}`;
}

/**
 * Canonical + hreflang alternates for a page that exists in every locale.
 * `path` is the locale-less path ("" for home, "/cv", "/tech-stack", …).
 * Relative URLs resolve against `metadataBase`.
 */
export function localizedAlternates(
  locale: Locale,
  path = "",
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = localizedPath(l, path);
  }
  languages["x-default"] = localizedPath(defaultLocale, path);
  return { canonical: localizedPath(locale, path), languages };
}

interface PageMetadataOptions {
  locale: Locale;
  /** Locale-less path, e.g. "" (home) or "/cv". */
  path?: string;
  /** Page title; the root template appends " — Vicente Opaso". */
  title?: string;
  description: string;
  robots?: Metadata["robots"];
  /** Override for the social image (defaults to the base OG image). */
  images?: string;
}

/**
 * Per-page metadata with canonical/hreflang alternates and locale-aware
 * Open Graph fields. Every route under app/[lang] should use this instead of
 * calling baseMetadata() directly.
 */
export function pageMetadata({
  locale,
  path = "",
  title,
  description,
  robots,
  images,
}: PageMetadataOptions): Metadata {
  const socialTitle = title ? `${title} · ${siteConfig.name}` : siteConfig.name;
  return baseMetadata({
    ...(title ? { title } : {}),
    description,
    ...(robots ? { robots } : {}),
    alternates: localizedAlternates(locale, path),
    openGraph: {
      url: `${siteConfig.url}${localizedPath(locale, path)}`,
      title: socialTitle,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l]),
      ...(images
        ? { images: [{ url: images, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      title: socialTitle,
      description,
      ...(images ? { images: [images] } : {}),
    },
  });
}

// ─── Structured data (JSON-LD) ───────────────────────────────────────────────

const PERSON_ID = `${siteConfig.url}/#person`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

const SAME_AS = [
  "https://linkedin.com/in/vicenteopaso",
  "https://github.com/vicenteopaso",
  "https://twitter.com/vicenteopaso",
] as const;

/**
 * Serializes JSON-LD for an inline <script>. Escaping "<" keeps a value
 * containing "</script>" from closing the tag early (the pattern the Next.js
 * JSON-LD guide recommends), so the output is safe for
 * dangerouslySetInnerHTML.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** The headline title is the first sentence of the CV label. */
function jobTitleFrom(cv: Cv): string {
  return cv.basics.label.split(".")[0].trim();
}

export function getWebsiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: `${siteConfig.url}${localizedPath(locale)}`,
    inLanguage: locale,
    publisher: { "@id": PERSON_ID },
  };
}

/**
 * Person node derived from content/<locale>/cv.json, so structured data can't
 * drift from the CV the page renders.
 */
export function getPersonJsonLd(locale: Locale, cv: Cv) {
  // Only the most recent employer can be current; earlier entries always
  // have an end date. No end date (or "Present") means the role is ongoing.
  const latest = cv.work[0];
  const latestEnd = latest?.positions[0]?.endDate;
  const current =
    latest && (!latestEnd || latestEnd === "Present") ? latest : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: cv.basics.name,
    url: `${siteConfig.url}${localizedPath(locale)}`,
    jobTitle: jobTitleFrom(cv),
    description: cv.basics.summary ?? cv.basics.label,
    sameAs: [...SAME_AS],
    knowsAbout: cv.skills.map((skill) => skill.name),
    knowsLanguage: cv.languages.map((language) => language.language),
    ...(current
      ? { worksFor: { "@type": "Organization", name: current.company } }
      : {}),
    alumniOf: cv.education.map((education) => ({
      "@type": "EducationalOrganization",
      name: education.institution,
    })),
  };
}

/** CV page graph: ProfilePage about the Person, plus their publications. */
export function getCvPageJsonLd(locale: Locale, cv: Cv) {
  const { "@context": _context, ...person } = getPersonJsonLd(locale, cv);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        url: `${siteConfig.url}${localizedPath(locale, "/cv")}`,
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      person,
      ...cv.publications.map((publication) => ({
        "@type": "Article",
        headline: publication.name,
        author: { "@id": PERSON_ID },
        ...(publication.releaseDate
          ? { datePublished: publication.releaseDate }
          : {}),
        ...(publication.url ? { url: publication.url } : {}),
        ...(publication.publisher
          ? {
              publisher: {
                "@type": "Organization",
                name: publication.publisher,
              },
            }
          : {}),
      })),
    ],
  };
}

export function getArticleJsonLd({
  locale,
  path,
  headline,
  description,
}: {
  locale: Locale;
  path: string;
  headline: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    ...(description ? { description } : {}),
    url: `${siteConfig.url}${localizedPath(locale, path)}`,
    inLanguage: locale,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

// ─── Sitemap ─────────────────────────────────────────────────────────────────

/**
 * Locale-less paths of every indexable page (each exists in all locales).
 * Unlisted pages (/found-luggage, /lost-luggage, /articles/*) are
 * deliberately absent: they are noindex and reachable by direct link only.
 */
export const INDEXABLE_PATHS = [
  "",
  "/cv",
  "/accessibility",
  "/cookie-policy",
  "/privacy-policy",
  "/tech-stack",
  "/technical-governance",
] as const;
