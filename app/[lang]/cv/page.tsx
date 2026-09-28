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

type T = ReturnType<typeof getTranslations>;

function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <div className="v3-sec-head">
      <span className="v3-sec-head-num">§{n}</span>
      <span className="v3-sec-head-label">{label}</span>
      <span className="v3-sec-head-rule" />
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
    <section className="v3-cv-masthead-section">
      <div className="v3-cv-masthead-grid">
        {/* Headline */}
        <div>
          <div className="v3-cv-header-label">{t("cv.header")}</div>
          <h1 className="v3-cv-h1">
            {name.split(" ")[0]}
            <br />
            <span className="v3-accent-text">
              {name.split(" ").slice(1).join(" ")}
            </span>
            .
          </h1>
          <div className="v3-cv-label">{label}</div>
          <div className="v3-cv-subtitle">
            {t("cv.subtitle1")} {t("cv.subtitle2")}
          </div>
          <div className="v3-cv-ctas">
            <CvBtn
              href={cvDownloadPath}
              primary
              download={getCvDownloadFilename(lang)}
            >
              {t("cv.downloadPdf")}
            </CvBtn>
            <CvBtn href="#contact" ariaLabel={t("cv.emailCta.ariaLabel")}>
              {t("cv.emailCta")}
            </CvBtn>
          </div>
        </div>

        {/* Portrait */}
        <div className="v3-cv-portrait">
          <Image
            src="/assets/images/profile-red-transparent.png"
            alt="Vicente Opaso"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 280px, 180px"
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="v3-cv-meta-row">
        {meta.map(([k, v]) => (
          <div key={k} className="v3-cv-meta-cell">
            <div className="v3-cv-meta-key">{k}</div>
            <div
              className={`v3-cv-meta-value${k === t("cv.metaAvailability") ? " is-accent" : ""}`}
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
  ariaLabel,
}: {
  children: React.ReactNode;
  primary?: boolean;
  href: string;
  download?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      download={download}
      aria-label={ariaLabel}
      className={`v3-btn ${primary ? "v3-btn-primary" : "v3-btn-outline"}`}
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
    <section className="v3-cv-toc-section">
      <div className="v3-toc-title">{t("cv.contents")}</div>
      <div className="v3-toc">
        {tocEntries.map((entry) => (
          <a key={entry.n} href={`#${entry.id}`} className="v3-cv-toc-row">
            <span className="v3-toc-num">§{entry.n}</span>
            <span>
              <span className="v3-cv-toc-label">{entry.t}</span>
              <span className="v3-cv-toc-sub">— {entry.s}</span>
            </span>
            <span className="v3-toc-arrow">↓</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Impact strip ─────────────────────────────────────────────────────────────
function ImpactStrip({ impact }: { impact: Array<{ k: string; v: string }> }) {
  return (
    <section className="v3-impact">
      <div className="v3-impact-grid">
        {impact.map((x, i) => (
          <div key={i} className="v3-impact-cell">
            <div className="v3-impact-stat">{x.k}</div>
            <div className="v3-impact-caption">{x.v}</div>
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
    <section id="cv-summary" className="v3-cv-section">
      <SecHead n="01" label={t("cv.section.summary")} />
      <div className="v3-cv-summary-grid">
        {/* Left: prose */}
        <div>
          {summary && (
            <p className="v3-cv-summary-prose">
              {stripHtmlLikeDelimiters(summary)}
            </p>
          )}
        </div>
        {/* Right: TL;DR */}
        <div className="v3-cv-summary-tldr">
          <div className="v3-cv-summary-tldr-title">{t("tldr.header")}</div>
          <ol className="v3-list-reset">
            {tldr.map((item, i) => (
              <li key={i} className="v3-cv-summary-tldr-item">
                <span className="v3-cv-summary-tldr-num">0{i + 1}</span>
                <span className="v3-cv-summary-tldr-text">{item}</span>
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
    <section id="cv-experience" className="v3-cv-section">
      <SecHead n="02" label={t("cv.section.experience")} />
      <div className="v3-cv-exp-table">
        {/* Header row */}
        <div className="v3-cv-exp-grid-row v3-cv-exp-header">
          <span>{t("cv.exp.colYears")}</span>
          <span>{t("cv.exp.colCompany")}</span>
          <span className="v3-cv-exp-loc">{t("cv.exp.colLocation")}</span>
        </div>

        {work.map((company, ci) => (
          <div key={ci} className="v3-cv-exp-company-group">
            {/* Company row */}
            <div className="v3-cv-exp-grid-row v3-cv-exp-company-row">
              <span className="v3-cv-exp-company-dates">
                {company.positions[
                  company.positions.length - 1
                ]?.startDate?.slice(0, 4) ?? ""}
                {" – "}
                {company.positions[0]?.endDate
                  ? company.positions[0].endDate.slice(0, 4)
                  : t("exp.now")}
              </span>
              <span className="v3-cv-exp-company-name">{company.company}</span>
              <span className="v3-cv-exp-loc">
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
                  className={`v3-cv-exp-grid-row v3-cv-exp-position-row${
                    ri < company.positions.length - 1 ? " has-more" : ""
                  }`}
                >
                  <div
                    className={`v3-cv-exp-position-dates${isCurrent ? " is-current" : ""}`}
                  >
                    {role.startDate ?? ""}
                    {"\n→\n"}
                    {role.endDate ?? "Present"}
                    {isCurrent && (
                      <div className="v3-cv-exp-current-label">
                        {t("cv.exp.current")}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="v3-cv-exp-position-title">
                      {role.position}
                    </div>
                    {role.summary && (
                      <div className="v3-cv-exp-position-summary">
                        {stripHtmlLikeDelimiters(role.summary)}
                      </div>
                    )}
                    {highlights.length > 0 && (
                      <ul className="v3-cv-exp-highlights">
                        {highlights.map((h, hi) => (
                          <li key={hi} className="v3-cv-exp-highlight">
                            <span className="v3-cv-exp-highlight-arrow">→</span>
                            <span>{stripHtmlLikeDelimiters(h)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {role.skills && role.skills.length > 0 && (
                      <div className="v3-chip-list" style={{ marginTop: 10 }}>
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
    <section id="cv-skills" className="v3-cv-section">
      <SecHead n="03" label={t("cv.section.skills")} />
      <div className="v3-cv-skills-grid">
        {sortedSkills.map((g, i) => (
          <div
            key={g.name}
            className={`v3-cv-skills-cell${i % 2 === 0 ? " is-left-col" : ""}${
              i < sortedSkills.length - (sortedSkills.length % 2 === 0 ? 2 : 1)
                ? " has-bottom-border"
                : ""
            }`}
          >
            <div className="v3-cv-skills-head">
              <span className="v3-cv-skills-name">{g.name}</span>
              {g.level && (
                <span className="v3-cv-skills-level">
                  {g.level.toUpperCase()}
                </span>
              )}
            </div>
            <div className="v3-chip-list">
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
    <section id="cv-education" className="v3-cv-section">
      <SecHead n="04" label={t("cv.section.educationLanguages")} />
      <div className="v3-cv-edu-grid">
        <div className="v3-cv-edu-col">
          <div className="v3-cv-edu-col-title">{t("cv.edu.education")}</div>
          {education.map((ed, i) => (
            <div
              key={i}
              className={i < education.length - 1 ? "v3-cv-edu-item" : ""}
            >
              <div className="v3-cv-edu-institution">{ed.institution}</div>
              {(ed.studyType || ed.area) && (
                <div className="v3-cv-edu-program">
                  {[ed.studyType, ed.area].filter(Boolean).join(" in ")}
                </div>
              )}
              {(ed.startDate || ed.endDate) && (
                <div className="v3-cv-edu-dates">
                  {ed.startDate} → {ed.endDate}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="v3-cv-edu-col">
          <div className="v3-cv-edu-col-title">{t("cv.edu.languages")}</div>
          <div className="v3-cv-lang-list">
            {languages.map(({ language, fluency }) => (
              <div key={language} className="v3-cv-lang-row">
                <span className="v3-cv-lang-name">{language}</span>
                {fluency && (
                  <span className="v3-cv-lang-fluency">
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
    <section id="cv-publications" className="v3-cv-section">
      <SecHead n="05" label={t("cv.section.publications")} />
      <div className="v3-cv-pub-list">
        {publications.map((pub, i) => (
          <a
            key={i}
            href={pub.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="v3-cv-pub-row"
          >
            <span className="v3-cv-pub-date">{pub.releaseDate ?? ""}</span>
            <span>
              <span className="v3-cv-pub-name">{pub.name}</span>
              {pub.publisher && (
                <span className="v3-cv-pub-publisher">
                  · {pub.publisher.toUpperCase()}
                </span>
              )}
            </span>
            <span className="v3-cv-pub-arrow">{t("cv.pub.read")}</span>
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
    <section id="cv-governance" className="v3-cv-section">
      <SecHead n="06" label={t("cv.section.governance")} />
      <div className="v3-cv-gov-list">
        {governance.map((g, i) => (
          <div key={i} className="v3-cv-gov-item">
            <div className="v3-cv-gov-head">
              <span className="v3-cv-gov-name">{g.group}</span>
              {g.organization && (
                <span className="v3-cv-gov-org">
                  {g.organization.toUpperCase()}
                </span>
              )}
            </div>
            {g.summary && (
              <div className="v3-cv-gov-summary">
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
    <section id="cv-references" className="v3-cv-section">
      <SecHead n="07" label={t("cv.section.references")} />
      <CvRefsGrid refs={refs} />
    </section>
  );
}

// ─── End CTA ─────────────────────────────────────────────────────────────────
function EndCta({ locale, t }: { locale: string; t: T }) {
  return (
    <section id="contact" className="v3-cv-endcta">
      <div className="v3-cv-endcta-grid">
        <div>
          <div className="v3-cv-endcta-label">{t("cv.endcta.label")}</div>
          <div className="v3-cv-endcta-h">
            {t("cv.endcta.headline")}{" "}
            <span className="v3-accent-inverse">{t("cv.endcta.accent")}</span>.
          </div>
          <div className="v3-cv-endcta-desc">{t("cv.endcta.description")}</div>
        </div>
        <div className="v3-cv-endcta-ctas">
          <a href={`/${locale}#contact`} className="v3-btn v3-btn-inverse">
            {t("cv.endcta.getInTouch")}
          </a>
          <a
            href="mailto:vicente@opa.so"
            aria-label={t("cv.endcta.email.ariaLabel")}
            className="v3-btn v3-btn-primary"
          >
            {t("cv.endcta.email")}
          </a>
          <a
            href="https://linkedin.com/in/vicenteopaso"
            target="_blank"
            rel="noreferrer"
            className="v3-btn v3-btn-inverse-outline"
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
    cv.basics?.label ?? data.tagline ?? "Frontend Architect & Technical Leader";

  return (
    <div className="v3-page v3-cv-page">
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
