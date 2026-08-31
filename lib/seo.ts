import type { Metadata } from "next";

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

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  } as const;
}

export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    jobTitle: "Frontend Architect & Technical Leader",
    description:
      "Technology leader with 15+ years designing, scaling, and maintaining high-performance digital platforms across enterprise, e-commerce, and mission-critical environments.",
    knowsAbout: [
      "Frontend Architecture",
      "Design Systems",
      "Developer Experience",
      "React",
      "Next.js",
      "TypeScript",
      "Composable Platforms",
      "CI/CD Automation",
      "Web Performance",
      "Accessibility",
    ],
    sameAs: [
      "https://linkedin.com/in/vicenteopaso",
      "https://github.com/vicenteopaso",
      "https://twitter.com/vicenteopaso",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Nexthink",
      url: "https://nexthink.com",
    },
    alumniOf: [
      {
        "@type": "Organization",
        name: "EUROCONTROL",
      },
      {
        "@type": "Organization",
        name: "Carlsberg Group",
      },
      {
        "@type": "Organization",
        name: "Nokia Networks",
      },
    ],
    knowsLanguage: [
      {
        "@type": "Language",
        name: "Spanish",
        alternateName: "es",
      },
      {
        "@type": "Language",
        name: "English",
        alternateName: "en",
      },
    ],
  } as const;
}

/**
 * Enhanced JSON-LD for the CV page with professional credentials
 */
export function getCvJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
      jobTitle: "Frontend Architect & Technical Leader",
      description:
        "15+ years designing, scaling, and maintaining high-performance digital platforms across enterprise, e-commerce, and mission-critical environments.",
      hasCredential: [
        {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          name: "Bachelor in Graphic Design",
          recognizedBy: {
            "@type": "Organization",
            name: "Universidad del Pacifico",
          },
        },
      ],
      hasOccupation: [
        {
          "@type": "Occupation",
          name: "Web Engineering Manager",
          occupationLocation: {
            "@type": "Country",
            name: "Switzerland",
          },
          skills:
            "Next.js, GraphQL, Tailwind CSS, Hygraph CMS, Vercel, CI/CD, Team Leadership",
        },
        {
          "@type": "Occupation",
          name: "Technical Application Owner",
          occupationLocation: {
            "@type": "Country",
            name: "Belgium",
          },
          skills:
            "Design Systems, Frontend Architecture, Technical Governance, Aviation Systems",
        },
        {
          "@type": "Occupation",
          name: "Frontend Solutions Architect",
          occupationLocation: {
            "@type": "Country",
            name: "Portugal",
          },
          skills:
            "React, TypeScript, Design Systems, B2B Platforms, Enterprise Architecture",
        },
      ],
    },
  } as const;
}

/**
 * JSON-LD for publications/articles
 */
export function getPublicationsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Publications by Vicente Opaso",
    itemListElement: [
      {
        "@type": "Article",
        position: 1,
        name: "Hardening Agentic Experience (AX) in an AI-First Codebase",
        author: {
          "@type": "Person",
          name: siteConfig.name,
        },
        publisher: {
          "@type": "Organization",
          name: "LinkedIn",
        },
        datePublished: "2025-12-16",
        url: "https://www.linkedin.com/pulse/hardening-agentic-experience-ax-ai-first-codebase-vicente-opaso-7ktae",
      },
      {
        "@type": "Article",
        position: 2,
        name: "Building My Website Through Spec-Driven Development",
        author: {
          "@type": "Person",
          name: siteConfig.name,
        },
        publisher: {
          "@type": "Organization",
          name: "LinkedIn",
        },
        datePublished: "2025-12-12",
        url: "https://www.linkedin.com/pulse/building-my-website-through-spec-driven-development-real-world-opaso-5wyse",
      },
      {
        "@type": "Article",
        position: 3,
        name: "Empowering Design Systems: How Communities of Practice Drive Innovation and Scalability",
        author: {
          "@type": "Person",
          name: siteConfig.name,
        },
        publisher: {
          "@type": "Organization",
          name: "LinkedIn",
        },
        datePublished: "2024-10-02",
        url: "https://www.linkedin.com/pulse/empowering-design-systems-how-communities-practice-drive-opaso-j0icf/",
      },
      {
        "@type": "Article",
        position: 4,
        name: "Driving Innovation from the Ground Up: The Power of Communities of Practice",
        author: {
          "@type": "Person",
          name: siteConfig.name,
        },
        publisher: {
          "@type": "Organization",
          name: "LinkedIn",
        },
        datePublished: "2024-09-30",
        url: "https://www.linkedin.com/pulse/driving-innovation-from-ground-up-power-communities-practice-opaso-3msef/",
      },
    ],
  } as const;
}

/**
 * JSON-LD for skills taxonomy
 */
export function getSkillsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Professional Skills",
    description: "Technical skills and expertise areas",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "DefinedTerm",
          name: "JavaScript/TypeScript",
          description: "Node.js, ECMAScript, Micro Frontends",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "DefinedTerm",
          name: "Frontend Development",
          description:
            "React, Next.js, Angular, React Native, Gatsby, PWA, SSR, SSG, GraphQL",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "DefinedTerm",
          name: "Design Systems",
          description:
            "Figma, Storybook, Design Tokens, Inner-sourcing, Governance",
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "DefinedTerm",
          name: "Developer Experience",
          description:
            "CI/CD Optimization, GitHub Actions, CodeQL, Onboarding Automation",
        },
      },
      {
        "@type": "ListItem",
        position: 5,
        item: {
          "@type": "DefinedTerm",
          name: "Cloud & Infrastructure",
          description: "AWS, Vercel, S3, CloudFront, Lambda, Amplify",
        },
      },
    ],
  } as const;
}
