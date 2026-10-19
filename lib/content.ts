import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { z } from "zod";

import type { Locale } from "@/lib/i18n";

/**
 * Frontmatter contract for `content/<locale>/<slug>.md`.
 * Mirrors the `Page` document type Contentlayer used to enforce
 * (name/title/slug required) before it was removed — this is the
 * replacement for that schema check now that pages read the
 * filesystem directly.
 */
const pageFrontmatterSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string().optional(),
  initials: z.string().optional(),
  underhero: z.string().optional(),
  description: z.string().optional(),
});

type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

export interface ContentPage {
  data: PageFrontmatter;
  content: string;
}

/**
 * Reads and validates `content/<locale>/<slug>.md`. Throws if the file is
 * missing or its frontmatter doesn't satisfy the required fields — this
 * fails the build the same way Contentlayer's schema validation used to.
 */
export function loadContentPage(locale: Locale, slug: string): ContentPage {
  // POSIX-joined for display in error messages, independent of OS — path.join
  // would use backslashes on Windows, making error text and consumers that
  // assert on the path OS-dependent.
  const relativePath = path.posix.join("content", locale, `${slug}.md`);
  const filePath = path.join(process.cwd(), "content", locale, `${slug}.md`);

  let fileContents: string;
  try {
    fileContents = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    // Node's fs errors (ENOENT/EACCES) embed the absolute filesystem path
    // in their message; normalize to the repo-relative path instead so we
    // don't leak local filesystem layout in logs, and keep the message
    // format consistent with the frontmatter-validation error below.
    throw new Error(`Failed to read content file ${relativePath}`, {
      cause: error,
    });
  }

  const { data, content } = matter(fileContents);

  const result = pageFrontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"} — ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${relativePath}: ${issues}`);
  }

  return { data: result.data, content };
}
