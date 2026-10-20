export const CONTENT_SLUGS = [
  "about",
  "accessibility",
  "cookie-policy",
  "privacy-policy",
  "tech-stack",
  "technical-governance",
] as const;

export type ContentSlug = (typeof CONTENT_SLUGS)[number];

const ALLOWED_CONTENT_SLUGS = new Set(CONTENT_SLUGS);

export const isContentSlug = (value: string): value is ContentSlug =>
  ALLOWED_CONTENT_SLUGS.has(value as ContentSlug);
