import fs from "fs";
import path from "path";
import { z } from "zod";

import type { Cv } from "@/lib/cv";
import { loadCv } from "@/lib/cv";
import { logError } from "@/lib/error-logging";
import type { Locale } from "@/lib/i18n";

const languageLevelSchema = z.object({
  name: z.string(),
  level: z.string(),
});

const profileSchema = z.object({
  meta: z.object({
    name: z.string(),
    current_title: z.string(),
    years_experience: z.number().int().nonnegative(),
    seniority: z.string(),
    actively_looking: z.boolean(),
  }),
  role_preferences: z.object({
    target_titles: z.array(z.string()),
    excluded_titles: z.array(z.string()),
    min_seniority: z.string(),
    management_interest: z.string(),
    open_to_individual_contributor: z.boolean(),
  }),
  domains: z.object({
    preferred_industries: z.array(z.string()),
    excluded_industries: z.array(z.string()),
  }),
  skills: z.object({
    core_technical: z.array(z.string()),
    architecture: z.array(z.string()),
    platform_and_devex: z.array(z.string()),
    cloud_and_infra: z.array(z.string()),
    languages: z.array(languageLevelSchema),
  }),
  experience_highlights: z.array(z.string()),
  location_preferences: z.object({
    primary_locations: z.array(z.string()),
    acceptable_regions: z.array(z.string()),
    restrictions: z.array(z.string()),
    work_authorization: z.array(z.string()),
  }),
  work_model_preferences: z.object({
    preferred: z.array(z.string()),
    excluded: z.array(z.string()),
  }),
  compensation_and_level: z.object({
    level_target: z.array(z.string()),
    notes: z.string(),
  }),
  company_preferences: z.object({
    size_preference: z.array(z.string()),
    must_haves: z.array(z.string()),
    red_flags: z.array(z.string()),
  }),
  hard_constraints: z.object({
    exclude_open_opportunities: z.boolean(),
    exclude_designer_roles: z.boolean(),
    excluded_keywords_in_title: z.array(z.string()),
    required_language: z.array(z.string()),
  }),
  links: z.object({
    cv_url: z.string().url(),
    website: z.string().url(),
    linkedin: z.string().url(),
    github: z.string().url(),
  }),
});

const profilePreferencesSchema = z.object({
  meta: z.object({
    current_title: z.string(),
    seniority: z.string(),
    actively_looking: z.boolean(),
  }),
  role_preferences: profileSchema.shape.role_preferences,
  domains: profileSchema.shape.domains,
  skills: z.object({
    core_technical_additions: z.array(z.string()),
    architecture_additions: z.array(z.string()),
    platform_and_devex_additions: z.array(z.string()),
    cloud_and_infra: z.array(z.string()),
    language_levels: z.record(z.string(), z.string()),
  }),
  experience_highlights: z.array(z.string()),
  location_preferences: profileSchema.shape.location_preferences,
  work_model_preferences: profileSchema.shape.work_model_preferences,
  compensation_and_level: profileSchema.shape.compensation_and_level,
  company_preferences: profileSchema.shape.company_preferences,
  hard_constraints: profileSchema.shape.hard_constraints,
  links: profileSchema.shape.links,
});

type CanonicalProfile = z.infer<typeof profileSchema>;
type CvData = Cv;
type ProfilePreferences = z.infer<typeof profilePreferencesSchema>;

function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): T {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(fileContents) as unknown;
  return schema.parse(parsed);
}

function deriveYearsExperience(work: CvData["work"]): number {
  const years = work
    .flatMap((company) => company.positions)
    .map((position) => position.startDate?.slice(0, 4))
    .filter((year): year is string => Boolean(year))
    .map((year) => Number.parseInt(year, 10))
    .filter((year) => Number.isFinite(year));

  if (years.length === 0) {
    return 0;
  }

  const earliestYear = Math.min(...years);
  return new Date().getUTCFullYear() - earliestYear;
}

function collectKeywordsBySkillName(skills: CvData["skills"] = []) {
  return new Map(
    skills.map((skill) => [skill.name.toLowerCase(), skill.keywords ?? []]),
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function buildCoreTechnical(
  skills: CvData["skills"] = [],
  additions: string[] = [],
) {
  const keywords = collectKeywordsBySkillName(skills);

  return uniqueStrings([
    ...["JavaScript", "HTML", "CSS"].filter((name) =>
      skills.some((skill) => skill.name === name),
    ),
    ...["TypeScript", "React", "Next.js", "Tailwind CSS"].filter((keyword) =>
      Array.from(keywords.values()).some((items) => items.includes(keyword)),
    ),
    ...additions,
  ]);
}

function buildArchitectureSkills(
  skills: CvData["skills"] = [],
  additions: string[] = [],
) {
  const keywords = collectKeywordsBySkillName(skills);

  return uniqueStrings([
    ...["Frontend architecture", "Design systems"].filter((item) => {
      const normalized = item.toLowerCase();
      return (
        skills.some((skill) => skill.name.toLowerCase() === normalized) ||
        Array.from(keywords.values()).some((items) =>
          items.some((value) => value.toLowerCase() === normalized),
        )
      );
    }),
    ...additions,
  ]);
}

function buildPlatformAndDevexSkills(
  skills: CvData["skills"] = [],
  additions: string[] = [],
) {
  const keywords = collectKeywordsBySkillName(skills);

  return uniqueStrings([
    ...["Developer experience"].filter((item) => {
      const normalized = item.toLowerCase();
      return (
        skills.some((skill) => skill.name.toLowerCase() === normalized) ||
        Array.from(keywords.values()).some((items) =>
          items.some((value) => value.toLowerCase() === normalized),
        )
      );
    }),
    ...additions,
  ]);
}

function mapLanguages(
  languages: CvData["languages"] = [],
  languageLevels: ProfilePreferences["skills"]["language_levels"],
) {
  return languages.map((language) => ({
    name: language.language,
    level: languageLevels[language.language] ?? language.fluency ?? "unknown",
  }));
}

export function getCanonicalProfile(locale: Locale): CanonicalProfile {
  try {
    const preferencesPath = path.join(
      process.cwd(),
      "content",
      locale,
      "profile-preferences.json",
    );

    const cv = loadCv(locale);
    const preferences = readJsonFile(preferencesPath, profilePreferencesSchema);

    const profile = {
      meta: {
        name: cv.basics.name,
        current_title: preferences.meta.current_title,
        years_experience: deriveYearsExperience(cv.work),
        seniority: preferences.meta.seniority,
        actively_looking: preferences.meta.actively_looking,
      },
      role_preferences: preferences.role_preferences,
      domains: preferences.domains,
      skills: {
        core_technical: buildCoreTechnical(
          cv.skills,
          preferences.skills.core_technical_additions,
        ),
        architecture: buildArchitectureSkills(
          cv.skills,
          preferences.skills.architecture_additions,
        ),
        platform_and_devex: buildPlatformAndDevexSkills(
          cv.skills,
          preferences.skills.platform_and_devex_additions,
        ),
        cloud_and_infra: preferences.skills.cloud_and_infra,
        languages: mapLanguages(
          cv.languages,
          preferences.skills.language_levels,
        ),
      },
      experience_highlights: preferences.experience_highlights,
      location_preferences: preferences.location_preferences,
      work_model_preferences: preferences.work_model_preferences,
      compensation_and_level: preferences.compensation_and_level,
      company_preferences: preferences.company_preferences,
      hard_constraints: preferences.hard_constraints,
      links: preferences.links,
    };

    return profileSchema.parse(profile);
  } catch (error) {
    logError(error, {
      component: "profile",
      action: "getCanonicalProfile",
      metadata: { locale },
    });
    throw error;
  }
}

export type { CanonicalProfile };
