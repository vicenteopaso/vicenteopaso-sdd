import fs from "fs";
import path from "path";
import { z } from "zod";

import type { Locale } from "@/lib/i18n";

/**
 * Schema for `content/<locale>/cv.json` — the single source of truth for the
 * CV page, the landing page's experience/stack sections, the canonical
 * profile API, and the Person/ProfilePage JSON-LD. Validated on every load so
 * a malformed edit fails the build instead of silently rendering empty
 * sections.
 */
// cv.json is plain text: React escapes it, so markup would render literally
// (and the old regex-stripping approach leaked fragments like "br /").
const MARKUP = /<\/?[a-z][^>]*>/i;
const plainText = () =>
  z.string().refine((value) => !MARKUP.test(value), {
    message: "must be plain text (no HTML markup)",
  });
const requiredText = () =>
  plainText().refine((value) => value.length > 0, {
    message: "must not be empty",
  });

const highlightSchema = z.union([
  requiredText(),
  z.object({ title: plainText().optional(), content: requiredText() }),
]);

const cvSchema = z.object({
  name: requiredText(),
  title: requiredText(),
  slug: z.literal("cv"),
  basics: z.object({
    name: requiredText(),
    label: requiredText(),
    summary: plainText().optional(),
    highlights: z.array(highlightSchema).optional(),
  }),
  work: z.array(
    z.object({
      company: requiredText(),
      location: plainText().optional(),
      positions: z
        .array(
          z.object({
            position: requiredText(),
            summary: plainText().optional(),
            startDate: plainText().optional(),
            endDate: plainText().optional(),
            highlights: z.array(highlightSchema).optional(),
            skills: z.array(plainText()).optional(),
          }),
        )
        .min(1),
    }),
  ),
  skills: z
    .array(
      z.object({
        name: requiredText(),
        level: plainText().optional(),
        keywords: z.array(plainText()).optional(),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: requiredText(),
        area: plainText().optional(),
        studyType: plainText().optional(),
        startDate: plainText().optional(),
        endDate: plainText().optional(),
      }),
    )
    .default([]),
  languages: z
    .array(
      z.object({
        language: requiredText(),
        fluency: plainText().optional(),
      }),
    )
    .default([]),
  publications: z
    .array(
      z.object({
        name: requiredText(),
        publisher: plainText().optional(),
        releaseDate: plainText().optional(),
        url: z.string().url().optional(),
      }),
    )
    .default([]),
  governance: z
    .array(
      z.object({
        group: requiredText(),
        organization: plainText().optional(),
        summary: plainText().optional(),
      }),
    )
    .default([]),
  interests: z
    .array(
      z.object({
        name: requiredText(),
        keywords: z.array(plainText()).optional(),
      }),
    )
    .default([]),
  // Plain data only — no HTML. Paragraphs are rendered as separate <p>s.
  references: z
    .array(
      z.object({
        name: requiredText(),
        role: requiredText(),
        url: z
          .string()
          .url()
          .refine((value) => /^https:\/\//i.test(value), "must be https")
          .optional(),
        paragraphs: z.array(requiredText()).min(1),
      }),
    )
    .default([]),
});

export type Cv = z.infer<typeof cvSchema>;
export type CvWorkEntry = Cv["work"][number];
export type CvSkillGroup = Cv["skills"][number];
export type CvReference = Cv["references"][number];

/**
 * Reads and validates `content/<locale>/cv.json`. Throws with a
 * repo-relative path and the failing fields when the file is missing or
 * invalid, so the build fails loudly (mirrors `loadContentPage`).
 */
export function loadCv(locale: Locale): Cv {
  const relativePath = path.posix.join("content", locale, "cv.json");
  const filePath = path.join(process.cwd(), "content", locale, "cv.json");

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read ${relativePath}`, { cause: error });
  }

  const result = cvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"} — ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid CV data in ${relativePath}: ${issues}`);
  }

  return result.data;
}
