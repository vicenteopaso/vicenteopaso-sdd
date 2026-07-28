import fs from "fs";
import type { Metadata } from "next";
import Image from "next/image";
import path from "path";

import { CvRefsGrid } from "@/app/components/CvRefCard";
import { getCvDownloadFilename, getCvDownloadPath } from "@/app/config/cv";
import { loadContentPage } from "@/lib/content";
import { logWarning } from "@/lib/error-logging";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParams, getTranslations } from "@/lib/i18n";
import { getCvDescription, ogCacheVersion, siteConfig } from "@/lib/seo";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-static";

function stripHtmlLikeDelimiters(input: string): string {
  return input.replace(/[<>]/g, "");
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });
  const description = getCvDescription(locale);
  return {
    title: "CV",
    description,
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/${locale}/cv`,
      title: `${siteConfig.name} · CV`,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: `/${locale}/cv/opengraph-image?v=${ogCacheVersion}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} · CV`,
      description,
      site: "@vicenteopaso",
      creator: "@vicenteopaso",
      images: [`/${locale}/cv/opengraph-image?v=${ogCacheVersion}`],
    },
  };
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Highlight = string | { title?: string; content: string };

type CvJson = {
  basics?: {
    name?: string;
    label?: string;
    summary?: string;
    highlights?: Highlight[];
  };
  work?: Array<{
    company: string;
    location?: string;
    positions: Array<{
      position: string;
      summary?: string;
      startDate?: string;
      endDate?: string;
      highlights?: Highlight[];
      skills?: string[];
    }>;
  }>;
  education?: Array<{
    institution: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: Array<{ name: string; level?: string; keywords?: string[] }>;
  languages?: Array<{ language: string; fluency?: string }>;
  references?: Array<{ name: string; reference: string }>;
  publications?: Array<{
    name: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
  }>;
  governance?: Array<{
    group: string;
    organization?: string;
    summary?: string;
  }>;
};

// ─── Style helpers ─────────────────────────────────────────────────────────────
const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };
const big: React.CSSProperties = {
  fontFamily: "var(--f-sans)",
  fontWeight: 800,
  letterSpacing: "-0.045em",
};
const rule2: React.CSSProperties = { borderBottom: "2px solid var(--v3-fg)" };
const MAX_W = 1180;

type T = ReturnType<typeof getTranslations>;

function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          ...mono,
          fontSize: 11,
          color: "var(--v3-accent-text)",
          letterSpacing: "0.14em",
        }}
      >
        §{n}
      </span>
      <span style={{ ...big, fontSize: 18, letterSpacing: "-0.015em" }}>
        {label}
      </span>
      <span style={{ flex: 1, height: 2, background: "var(--v3-fg)" }} />
    </div>
  );
}

/** Strip HTML-like markup delimiters — used to clean reference names */
function stripHtml(html: string): string {
  return html.replace(/[<>]/g, "");
}

/** Parse "Name | Role" reference name strings, extracting href if present */
function parseRefName(raw: string): {
  name: string;
  role: string;
  href?: string;
} {
  const hrefMatch = raw.match(/href=['"]([^'"]+)['"]/);
  const rawHref = hrefMatch?.[1];
  const href = rawHref && /^https?:\/\//i.test(rawHref) ? rawHref : undefined;
  const textMatch = raw.match(/>([^<]+)<\/a>/);
  const anchorText = textMatch?.[1]?.trim();
  const pipeIdx = raw.indexOf("|");
  const role = pipeIdx >= 0 ? raw.substring(pipeIdx + 1).trim() : "";
  const name =
    anchorText ??
    stripHtml(pipeIdx >= 0 ? raw.substring(0, pipeIdx) : raw).trim();
  return { name, role, href };
}

// ─── CV Masthead ───────────────────────────────────────────────────────────────
function CvMasthead({
  name,
  label,
  lang,
  t,
}: {
  name: string;
  label: string;
  lang: Locale;
  t: T;
}) {
  const cvDownloadPath = getCvDownloadPath(lang);
  const meta = [
    [t("cv.metaLocation"), t("cv.metaLocationValue")],
    [t("cv.metaAvailability"), t("cv.metaAvailabilityValue")],
    [t("cv.metaLanguages"), t("cv.metaLanguagesValue")],
    [t("cv.metaExperience"), t("cv.metaExperienceValue")],
    [t("cv.metaUpdated"), t("cv.metaUpdatedValue")],
  ] as const;

  return (
    <section
      className="v3-cv-masthead-section"
      style={{ padding: "20px 32px 32px", ...rule2 }}
    >
      <div
        className="v3-cv-masthead-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 180px",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Headline */}
        <div>
          <div
            style={{
              ...mono,
              fontSize: 11,
              color: "var(--v3-muted)",
              letterSpacing: "0.14em",
              marginBottom: 18,
            }}
          >
            {t("cv.header")}
          </div>
          <h1
            className="v3-cv-h1"
            style={{ ...big, fontSize: 72, lineHeight: 0.9, margin: 0 }}
          >
            {name.split(" ")[0]}
            <br />
            <span style={{ color: "var(--v3-accent-text)" }}>
              {name.split(" ").slice(1).join(" ")}
            </span>
            .
          </h1>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              marginTop: 18,
              letterSpacing: "-0.005em",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--v3-muted)",
              marginTop: 10,
              maxWidth: 440,
              lineHeight: 1.65,
            }}
          >
            {t("cv.subtitle1")} {t("cv.subtitle2")}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <CvBtn
              href={cvDownloadPath}
              primary
              download={getCvDownloadFilename(lang)}
            >
              {t("cv.downloadPdf")}
            </CvBtn>
            <CvBtn href="#contact">{t("cv.emailCta")}</CvBtn>
          </div>
        </div>

        {/* Portrait */}
        <div
          className="v3-cv-portrait"
          style={{
            aspectRatio: "4 / 5",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src="/assets/images/profile-red-transparent.png"
            alt="Vicente Opaso"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 340px"
          />
        </div>
      </div>

      {/* Meta row */}
      <div
        className="v3-cv-meta-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 0,
          marginTop: 32,
          paddingTop: 18,
          borderTop: "1px solid var(--v3-rule)",
        }}
      >
        {meta.map(([k, v], i) => (
          <div
            key={k}
            style={{
              paddingLeft: i > 0 ? 14 : 0,
              borderLeft: i > 0 ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <div
              style={{
                ...mono,
                fontSize: 10,
                color: "var(--v3-muted)",
                letterSpacing: "0.14em",
                marginBottom: 6,
              }}
            >
              {k}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color:
                  k === t("cv.metaAvailability")
                    ? "var(--v3-accent-text)"
                    : "inherit",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CvBtn({
  children,
  primary,
  href,
  download,
}: {
  children: React.ReactNode;
  primary?: boolean;
  href: string;
  download?: string;
}) {
  return (
    <a
      href={href}
      download={download}
      style={{
        display: "inline-block",
        background: primary ? "var(--v3-accent)" : "transparent",
        color: primary ? "var(--v3-bg)" : "var(--v3-fg)",
        border: primary ? "none" : "1px solid var(--v3-fg)",
        padding: "12px 20px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--f-mono)",
        letterSpacing: "0.08em",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </a>
  );
}

// ─── TOC ───────────────────────────────────────────────────────────────────────
function CvToc({
  t,
  tocEntries,
}: {
  t: T;
  tocEntries: Array<{ n: string; id: string; t: string; s: string }>;
}) {
  return (
    <section style={{ padding: "32px 32px", ...rule2 }}>
      <div
        style={{
          ...mono,
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "var(--v3-muted)",
          marginBottom: 12,
        }}
      >
        {t("cv.contents")}
      </div>
      <div style={{ border: "1px solid var(--v3-rule)" }}>
        {tocEntries.map((entry, i) => (
          <a
            key={entry.n}
            href={`#${entry.id}`}
            className="v3-cv-toc-row"
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr auto",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom:
                i < tocEntries.length - 1 ? "1px solid var(--v3-rule)" : "none",
              color: "var(--v3-fg)",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: 11,
                color: "var(--v3-accent-text)",
                letterSpacing: "0.1em",
              }}
            >
              §{entry.n}
            </span>
            <span>
              <span
                className="v3-cv-toc-label"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {entry.t}
              </span>
              <span
                className="v3-cv-toc-sub"
                style={{
                  fontSize: 13,
                  color: "var(--v3-muted)",
                  marginLeft: 12,
                }}
              >
                — {entry.s}
              </span>
            </span>
            <span style={{ ...mono, fontSize: 14, color: "var(--v3-muted)" }}>
              ↓
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Impact strip ─────────────────────────────────────────────────────────────
function ImpactStrip({ impact }: { impact: Array<{ k: string; v: string }> }) {
  return (
    <section style={{ ...rule2 }}>
      <div
        className="v3-impact-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {impact.map((x, i) => (
          <div
            key={i}
            style={{
              padding: "32px 24px",
              borderRight: i < 3 ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <div
              className="v3-impact-stat"
              style={{
                ...big,
                fontSize: 56,
                color: i === 0 ? "var(--v3-accent-text)" : "var(--v3-fg)",
                lineHeight: 1,
              }}
            >
              {x.k}
            </div>
            <div
              style={{
                ...mono,
                fontSize: 11,
                color: "var(--v3-muted)",
                marginTop: 10,
                lineHeight: 1.5,
                letterSpacing: "0.02em",
              }}
            >
              {x.v}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §01 Summary ───────────────────────────────────────────────────────────────
function SummarySection({
  summary,
  t,
  tldr,
}: {
  summary?: string;
  t: T;
  tldr: readonly string[];
}) {
  return (
    <section id="cv-summary" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="01" label={t("cv.section.summary")} />
      <div
        className="v3-cv-summary-grid"
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 48px",
          alignItems: "start",
        }}
      >
        {/* Left: prose */}
        <div>
          {summary && (
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--v3-fg)",
                margin: 0,
              }}
            >
              {stripHtmlLikeDelimiters(summary)}
            </p>
          )}
        </div>
        {/* Right: TL;DR */}
        <div style={{ borderLeft: "2px solid var(--v3-fg)", paddingLeft: 28 }}>
          <div
            style={{
              ...mono,
              fontSize: 10,
              color: "var(--v3-muted)",
              letterSpacing: "0.18em",
              marginBottom: 12,
            }}
          >
            {t("tldr.header")}
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tldr.map((item, i) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  alignItems: "baseline",
                  padding: "7px 0",
                  gap: 8,
                  borderBottom: "1px solid var(--v3-rule)",
                }}
              >
                <span
                  style={{
                    ...mono,
                    fontSize: 11,
                    color: "var(--v3-accent-text)",
                    letterSpacing: "0.08em",
                  }}
                >
                  0{i + 1}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    letterSpacing: "-0.005em",
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─── §02 Experience ─────────────────────────────────────────────────────────
type WorkEntry = {
  company: string;
  location?: string;
  positions: Array<{
    position: string;
    summary?: string;
    startDate?: string;
    endDate?: string;
    highlights?: Highlight[];
    skills?: string[];
  }>;
};

function ExperienceSection({ work, t }: { work: WorkEntry[]; t: T }) {
  return (
    <section id="cv-experience" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="02" label={t("cv.section.experience")} />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        {/* Header row */}
        <div
          className="v3-cv-exp-grid-row"
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 130px",
            padding: "10px 14px",
            borderBottom: "1px solid var(--v3-rule)",
            ...mono,
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--v3-muted)",
          }}
        >
          <span>{t("cv.exp.colYears")}</span>
          <span>{t("cv.exp.colCompany")}</span>
          <span className="v3-cv-exp-loc">{t("cv.exp.colLocation")}</span>
        </div>

        {work.map((company, ci) => (
          <div
            key={ci}
            style={{
              borderBottom:
                ci < work.length - 1 ? "2px solid var(--v3-fg)" : "none",
            }}
          >
            {/* Company row */}
            <div
              className="v3-cv-exp-grid-row"
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 130px",
                padding: "14px 14px 10px",
                alignItems: "baseline",
                gap: 12,
                borderBottom: "1px solid var(--v3-rule)",
              }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: 10.5,
                  color: "var(--v3-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                {company.positions[
                  company.positions.length - 1
                ]?.startDate?.slice(0, 4) ?? ""}
                {" – "}
                {company.positions[0]?.endDate
                  ? company.positions[0].endDate.slice(0, 4)
                  : t("exp.now")}
              </span>
              <span style={{ ...big, fontSize: 22, letterSpacing: "-0.02em" }}>
                {company.company}
              </span>
              <span
                className="v3-cv-exp-loc"
                style={{
                  ...mono,
                  fontSize: 10.5,
                  color: "var(--v3-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                {(company.location ?? "").toUpperCase()}
              </span>
            </div>

            {company.positions.map((role, ri) => {
              const isCurrent = !role.endDate;
              const highlights = (role.highlights ?? []).map((h) =>
                typeof h === "string" ? h : h.content,
              );
              return (
                <div
                  key={ri}
                  className="v3-cv-exp-grid-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 130px",
                    padding: "14px 14px",
                    gap: 12,
                    borderBottom:
                      ri < company.positions.length - 1
                        ? "1px dashed var(--v3-rule)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      ...mono,
                      fontSize: 10,
                      color: isCurrent
                        ? "var(--v3-accent-text)"
                        : "var(--v3-muted)",
                      letterSpacing: "0.04em",
                      lineHeight: 1.55,
                    }}
                  >
                    {role.startDate ?? ""}
                    {"\n→\n"}
                    {role.endDate ?? "Present"}
                    {isCurrent && (
                      <div style={{ marginTop: 4 }}>{t("cv.exp.current")}</div>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                        marginBottom: 4,
                      }}
                    >
                      {role.position}
                    </div>
                    {role.summary && (
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "var(--v3-muted)",
                          lineHeight: 1.6,
                          marginBottom: highlights.length ? 10 : 0,
                        }}
                      >
                        {stripHtmlLikeDelimiters(role.summary)}
                      </div>
                    )}
                    {highlights.length > 0 && (
                      <ul
                        style={{
                          margin: "6px 0 0",
                          padding: 0,
                          listStyle: "none",
                          display: "grid",
                          gap: 4,
                        }}
                      >
                        {highlights.map((h, hi) => (
                          <li
                            key={hi}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "16px 1fr",
                              gap: 6,
                              fontSize: 13,
                              lineHeight: 1.55,
                            }}
                          >
                            <span
                              style={{
                                ...mono,
                                color: "var(--v3-accent-text)",
                              }}
                            >
                              →
                            </span>
                            <span>{stripHtmlLikeDelimiters(h)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {role.skills && role.skills.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap" as const,
                          gap: 5,
                          marginTop: 10,
                        }}
                      >
                        {role.skills.map((s) => (
                          <span key={s} className="v3-chip">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="v3-cv-exp-loc" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §03 Skills ─────────────────────────────────────────────────────────────
const PROFICIENCY_RANK: Record<string, number> = {
  master: 0,
  advanced: 1,
  intermediate: 2,
  beginner: 3,
};

function SkillsSection({
  skills,
  t,
}: {
  skills: Array<{ name: string; level?: string; keywords?: string[] }>;
  t: T;
}) {
  const sortedSkills = [...skills]
    .map((s) => ({
      ...s,
      _rank: PROFICIENCY_RANK[s.level?.toLowerCase() ?? ""] ?? 99,
    }))
    .sort((a, b) => {
      if (a._rank !== b._rank) return a._rank - b._rank;
      return a.name.localeCompare(b.name);
    });

  return (
    <section id="cv-skills" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="03" label={t("cv.section.skills")} />
      <div
        className="v3-cv-skills-grid"
        style={{
          marginTop: 24,
          border: "1px solid var(--v3-rule)",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
        }}
      >
        {sortedSkills.map((g, i) => (
          <div
            key={g.name}
            style={{
              padding: "16px 18px",
              borderRight: i % 2 === 0 ? "1px solid var(--v3-rule)" : "none",
              borderBottom:
                i <
                sortedSkills.length - (sortedSkills.length % 2 === 0 ? 2 : 1)
                  ? "1px solid var(--v3-rule)"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {g.name}
              </span>
              {g.level && (
                <span
                  style={{
                    ...mono,
                    fontSize: 9.5,
                    color: "var(--v3-accent-text)",
                    letterSpacing: "0.14em",
                  }}
                >
                  {g.level.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
              {(g.keywords ?? []).map((kw) => (
                <span key={kw} className="v3-chip">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §04 Education + Languages ─────────────────────────────────────────────
function EducationSection({
  education,
  languages,
  t,
}: {
  education: Array<{
    institution: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
  }>;
  languages: Array<{ language: string; fluency?: string }>;
  t: T;
}) {
  return (
    <section id="cv-education" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="04" label={t("cv.section.educationLanguages")} />
      <div
        className="v3-cv-edu-grid"
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          border: "1px solid var(--v3-rule)",
        }}
      >
        <div
          style={{
            padding: "18px 18px",
            borderRight: "1px solid var(--v3-rule)",
          }}
        >
          <div
            style={{
              ...mono,
              fontSize: 10,
              color: "var(--v3-muted)",
              letterSpacing: "0.18em",
              marginBottom: 10,
            }}
          >
            {t("cv.edu.education")}
          </div>
          {education.map((ed, i) => (
            <div
              key={i}
              style={{ marginBottom: i < education.length - 1 ? 16 : 0 }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {ed.institution}
              </div>
              {(ed.studyType || ed.area) && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--v3-muted)",
                    marginTop: 4,
                  }}
                >
                  {[ed.studyType, ed.area].filter(Boolean).join(" in ")}
                </div>
              )}
              {(ed.startDate || ed.endDate) && (
                <div
                  style={{
                    ...mono,
                    fontSize: 10.5,
                    color: "var(--v3-muted)",
                    marginTop: 8,
                    letterSpacing: "0.06em",
                  }}
                >
                  {ed.startDate} → {ed.endDate}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "18px 18px" }}>
          <div
            style={{
              ...mono,
              fontSize: 10,
              color: "var(--v3-muted)",
              letterSpacing: "0.18em",
              marginBottom: 10,
            }}
          >
            {t("cv.edu.languages")}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {languages.map(({ language, fluency }) => (
              <div
                key={language}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 600 }}>{language}</span>
                {fluency && (
                  <span
                    style={{
                      ...mono,
                      fontSize: 10.5,
                      color: "var(--v3-muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {fluency.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── §05 Publications ──────────────────────────────────────────────────────
function PublicationsSection({
  publications,
  t,
}: {
  publications: Array<{
    name: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
  }>;
  t: T;
}) {
  return (
    <section id="cv-publications" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="05" label={t("cv.section.publications")} />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        {publications.map((pub, i) => (
          <a
            key={i}
            href={pub.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="v3-cv-pub-row"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 80px",
              padding: "14px 14px",
              gap: 16,
              alignItems: "baseline",
              textDecoration: "none",
              color: "var(--v3-fg)",
              borderBottom:
                i < publications.length - 1
                  ? "1px solid var(--v3-rule)"
                  : "none",
            }}
          >
            <span
              className="v3-cv-pub-date"
              style={{
                ...mono,
                fontSize: 11,
                color: "var(--v3-muted)",
                letterSpacing: "0.06em",
              }}
            >
              {pub.releaseDate ?? ""}
            </span>
            <span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                {pub.name}
              </span>
              {pub.publisher && (
                <span
                  style={{
                    ...mono,
                    fontSize: 10,
                    color: "var(--v3-muted)",
                    marginLeft: 10,
                    letterSpacing: "0.12em",
                  }}
                >
                  · {pub.publisher.toUpperCase()}
                </span>
              )}
            </span>
            <span
              className="v3-cv-pub-arrow"
              style={{
                ...mono,
                fontSize: 11,
                color: "var(--v3-accent-text)",
                textAlign: "right" as const,
                letterSpacing: "0.1em",
              }}
            >
              {t("cv.pub.read")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── §06 Governance & Steering Groups ──────────────────────────────────────
function GovernanceSection({
  governance,
  t,
}: {
  governance: Array<{ group: string; organization?: string; summary?: string }>;
  t: T;
}) {
  return (
    <section id="cv-governance" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="06" label={t("cv.section.governance")} />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        {governance.map((g, i) => (
          <div
            key={i}
            style={{
              padding: "16px 18px",
              borderBottom:
                i < governance.length - 1 ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap" as const,
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {g.group}
              </span>
              {g.organization && (
                <span
                  style={{
                    ...mono,
                    fontSize: 10.5,
                    color: "var(--v3-muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {g.organization.toUpperCase()}
                </span>
              )}
            </div>
            {g.summary && (
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--v3-muted)",
                  lineHeight: 1.6,
                  marginTop: 8,
                }}
              >
                {stripHtmlLikeDelimiters(g.summary)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §07 References ────────────────────────────────────────────────────────
function ReferencesSection({
  references,
  t,
}: {
  references: Array<{ name: string; reference: string }>;
  t: T;
}) {
  const refs = references.map((ref) => {
    const { name, role, href } = parseRefName(ref.name);
    return {
      name,
      role,
      href,
      fullText: stripHtmlLikeDelimiters(ref.reference),
    };
  });
  return (
    <section id="cv-references" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="07" label={t("cv.section.references")} />
      <CvRefsGrid refs={refs} />
    </section>
  );
}

// ─── End CTA ─────────────────────────────────────────────────────────────────
function EndCta({ locale, t }: { locale: string; t: T }) {
  return (
    <section
      id="contact"
      style={{
        background: "var(--v3-fg)",
        color: "var(--v3-bg)",
        padding: "40px 32px",
        borderBottom: "2px solid var(--v3-fg)",
      }}
    >
      <div
        className="v3-cv-endcta-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              ...mono,
              fontSize: 11,
              opacity: 0.75,
              letterSpacing: "0.18em",
              marginBottom: 12,
            }}
          >
            {t("cv.endcta.label")}
          </div>
          <div
            className="v3-cv-endcta-h"
            style={{ ...big, fontSize: 56, lineHeight: 0.95 }}
          >
            {t("cv.endcta.headline")}{" "}
            <span style={{ color: "var(--v3-accent-text)" }}>
              {t("cv.endcta.accent")}
            </span>
            .
          </div>
          <div
            style={{ fontSize: 13, opacity: 0.7, marginTop: 12, maxWidth: 520 }}
          >
            {t("cv.endcta.description")}
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}
        >
          <a
            href={`/${locale}#contact`}
            style={{
              background: "var(--v3-bg)",
              color: "var(--v3-fg)",
              padding: "12px 20px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--f-mono)",
              letterSpacing: "0.08em",
              textDecoration: "none",
              textAlign: "center" as const,
            }}
          >
            {t("cv.endcta.getInTouch")}
          </a>
          <a
            href="mailto:vicente@opa.so"
            style={{
              background: "var(--v3-accent)",
              color: "var(--v3-bg)",
              padding: "12px 20px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--f-mono)",
              letterSpacing: "0.08em",
              textDecoration: "none",
              textAlign: "center" as const,
            }}
          >
            {t("cv.endcta.email")}
          </a>
          <a
            href="https://linkedin.com/in/vicenteopaso"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "transparent",
              color: "var(--v3-bg)",
              border: "1px solid var(--v3-bg)",
              padding: "12px 20px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--f-mono)",
              letterSpacing: "0.08em",
              textDecoration: "none",
              textAlign: "center" as const,
            }}
          >
            {t("cv.endcta.linkedin")}
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function CVPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });
  const t = getTranslations(locale);
  const siteData = getSiteData(locale);

  // Frontmatter from cv.md (title, name)
  const { data } = loadContentPage(locale, "cv");

  // Structured data from cv.json
  let cv: CvJson = {};
  try {
    const jsonPath = path.join(process.cwd(), "content", locale, "cv.json");
    cv = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as CvJson;
  } catch (err) {
    logWarning(`CV JSON load failed for locale "${locale}"`, {
      component: "CVPage",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
  }

  const name = cv.basics?.name ?? data.name;
  const label =
    cv.basics?.label ??
    data.tagline ??
    "Web Engineering Manager · Frontend Architect";

  return (
    <div
      className="v3-page"
      style={{ maxWidth: MAX_W, margin: "0 auto", width: "100%" }}
    >
      <CvMasthead name={name} label={label} lang={locale} t={t} />
      <CvToc t={t} tocEntries={siteData.cvToc} />
      <ImpactStrip impact={siteData.impact} />
      <SummarySection summary={cv.basics?.summary} t={t} tldr={siteData.tldr} />
      {(cv.work?.length ?? 0) > 0 && (
        <ExperienceSection work={cv.work ?? []} t={t} />
      )}
      {(cv.skills?.length ?? 0) > 0 && (
        <SkillsSection skills={cv.skills ?? []} t={t} />
      )}
      {((cv.education?.length ?? 0) > 0 || (cv.languages?.length ?? 0) > 0) && (
        <EducationSection
          education={cv.education ?? []}
          languages={cv.languages ?? []}
          t={t}
        />
      )}
      {(cv.publications?.length ?? 0) > 0 && (
        <PublicationsSection publications={cv.publications ?? []} t={t} />
      )}
      {(cv.governance?.length ?? 0) > 0 && (
        <GovernanceSection governance={cv.governance ?? []} t={t} />
      )}
      {(cv.references?.length ?? 0) > 0 && (
        <ReferencesSection references={cv.references ?? []} t={t} />
      )}
      <EndCta locale={locale} t={t} />
    </div>
  );
}
