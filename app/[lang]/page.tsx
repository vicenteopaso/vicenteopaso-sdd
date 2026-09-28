import fs from "fs";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import path from "path";
import ReactMarkdown from "react-markdown";

import { V3ContactForm } from "@/app/components/V3ContactForm";
import { logWarning } from "@/lib/error-logging";
import { getLocaleFromParams, getTranslations } from "@/lib/i18n";
import { ogCacheVersion, siteConfig } from "@/lib/seo";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-static";
export const dynamicParams = false;

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
  return {
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/${locale}`,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `/${locale}/opengraph-image?v=${ogCacheVersion}`,
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
      images: [`/${locale}/opengraph-image?v=${ogCacheVersion}`],
    },
  };
}

type T = ReturnType<typeof getTranslations>;

// ─── Section heading: §NN ── LABEL ─────── ───────────────────────────────────
function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <div className="v3-sec-head">
      <span className="v3-sec-head-num">§{n}</span>
      <span className="v3-sec-head-label">{label}</span>
      <span className="v3-sec-head-rule" />
    </div>
  );
}

// ─── A4 Hero: 2-col headline + TOC ───────────────────────────────────────────
function HeroA4({
  locale,
  t,
  tocEntries,
}: {
  locale: string;
  t: T;
  tocEntries: Array<{ n: string; id: string; t: string; s: string }>;
}) {
  return (
    <section className="v3-section v3-hero-section">
      <div className="v3-hero-grid">
        {/* Left: headline + sub + CTAs */}
        <div>
          <div className="v3-hero-label">{t("hero.label")}</div>
          <h1 className="v3-hero-h1">
            {t("hero.headline1")}
            <br />
            {t("hero.headline2")}
            <br />
            <span className="v3-accent-text">{t("hero.headline3")}</span>
            <br />
            {t("hero.headline4")}
          </h1>
          <p className="v3-hero-sub">{t("hero.sub")}</p>
          <div className="v3-hero-ctas">
            <HeroBtn href={`/${locale}/cv`} primary>
              {t("hero.readCv")}
            </HeroBtn>
            <HeroBtn href="#contact">{t("hero.email")}</HeroBtn>
          </div>
        </div>

        {/* Right: TOC */}
        <div>
          <div className="v3-toc-title">{t("hero.contents")}</div>
          <div className="v3-toc">
            {tocEntries.map((entry) => (
              <a key={entry.n} href={`#${entry.id}`} className="v3-cv-toc-row">
                <span className="v3-toc-num">§{entry.n}</span>
                <span>
                  <span className="v3-cv-toc-label">{entry.t}</span>
                  <span className="v3-cv-toc-sub v3-toc-sub-strong">
                    — {entry.s}
                  </span>
                </span>
                <span className="v3-toc-arrow">↓</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBtn({
  children,
  primary,
  href,
}: {
  children: React.ReactNode;
  primary?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href as Route}
      className={`v3-btn ${primary ? "v3-btn-primary" : "v3-btn-outline"}`}
    >
      {children}
    </Link>
  );
}

// ─── Impact 4-stat strip ──────────────────────────────────────────────────────
function ImpactStrip({ impact }: { impact: Array<{ k: string; v: string }> }) {
  return (
    <section className="v3-impact v3-container">
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

// ─── §01 TL;DR ───────────────────────────────────────────────────────────────
function TlDrSection({
  t,
  tldr,
  tldrLabels,
}: {
  t: T;
  tldr: readonly string[];
  tldrLabels: readonly string[];
}) {
  return (
    <section id="tl-dr" className="v3-tldr v3-container">
      <div className="v3-tldr-grid">
        {/* Inverted sidebar */}
        <div className="v3-tldr-sidebar">
          <div className="v3-tldr-sidebar-num">§01</div>
          <div className="v3-tldr-sidebar-h">
            TL;<span className="v3-accent-inverse">DR</span>
          </div>
          <div className="v3-tldr-sidebar-sub">
            {t("tldr.subtitle1")}
            <br />
            {t("tldr.subtitle2")}
            <br />
            {t("tldr.subtitle3")}
          </div>
        </div>

        {/* Numbered list */}
        <ol className="v3-list-reset">
          {tldr.map((item, i) => (
            <li key={i} className="v3-tldr-item">
              <span className="v3-tldr-item-num">0{i + 1} —</span>
              <span className="v3-tldr-item-text">{item}</span>
              <span className="v3-tldr-label">{tldrLabels[i]}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── §02 What I Do ───────────────────────────────────────────────────────────
function FocusStrip({
  t,
  focus,
}: {
  t: T;
  focus: Array<{ h: string; b: string }>;
}) {
  return (
    <section id="what-i-do" className="v3-section">
      <SecHead n="02" label={t("section.whatIDo")} />
      <div className="v3-focus-grid">
        {focus.map((f, i) => (
          <div key={i} className="v3-focus-item">
            <div className="v3-focus-item-num">0{i + 1}</div>
            <div className="v3-focus-item-h">{f.h}</div>
            <div className="v3-focus-item-b">{f.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §03 Experience table ─────────────────────────────────────────────────────
type WorkEntry = {
  company: string;
  location?: string;
  positions: Array<{
    position: string;
    startDate?: string;
    endDate?: string;
  }>;
};

function fmtDate(d?: string, nowLabel?: string): string {
  if (!d || d === "Present") return nowLabel ?? "NOW";
  return d.replace(/-(\d{2})$/, ".$1");
}

function ExperienceTable({
  work,
  locale,
  t,
}: {
  work: WorkEntry[];
  locale: string;
  t: T;
}) {
  return (
    <section id="experience" className="v3-section">
      <SecHead n="03" label={t("section.whereWorked")} />
      <div className="v3-exp-table">
        <div className="v3-exp-header">
          <span>{t("exp.colDates")}</span>
          <span>{t("exp.colRole")}</span>
          <span className="v3-exp-loc">{t("exp.colLocation")}</span>
          <span className="v3-exp-read">→</span>
        </div>
        {work.map((company, ci) =>
          company.positions.map((role, ri) => {
            const isCurrent = !role.endDate || role.endDate === "Present";
            const nowLabel = t("exp.now");
            const dateStr = `${fmtDate(role.startDate, nowLabel)} – ${isCurrent ? nowLabel : fmtDate(role.endDate, nowLabel)}`;
            return (
              <div key={`${ci}-${ri}`} className="v3-exp-row">
                <span
                  className={`v3-exp-dates${isCurrent ? " is-current" : ""}`}
                >
                  {dateStr}
                </span>
                <span className="v3-exp-role">
                  <span className="v3-exp-role-title">{role.position}</span>
                  <span className="v3-exp-role-company">
                    {" "}
                    · {company.company}
                  </span>
                </span>
                <span className="v3-exp-loc">{company.location ?? ""}</span>
                <Link
                  href={`/${locale}/cv#cv-experience` as Route}
                  className="v3-exp-read"
                >
                  {t("exp.read")}
                </Link>
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
}

// ─── §04 What I Build ─────────────────────────────────────────────────────────
type WhatIBuildProject = {
  title: string;
  subtitle: string;
  tags: string;
  body: string;
  links: Array<{ label: string; href: string }>;
};

type WhatIBuildData = {
  intro: string;
  projects: WhatIBuildProject[];
};

const buildMarkdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul>{children}</ul>,
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="v3-build-bullet">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong>{children}</strong>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code>{children}</code>
  ),
};

function WhatIBuildSection({ t, data }: { t: T; data: WhatIBuildData }) {
  return (
    <section id="what-i-build" className="v3-section">
      <SecHead n="04" label={t("section.whatIBuild")} />
      <p className="v3-build-intro">{data.intro}</p>
      <div className="v3-build-list">
        {data.projects.map((project) => (
          <div key={project.title} className="v3-build-row">
            {/* Left: title + subtitle + tags */}
            <div className="v3-build-row-left">
              <div className="v3-build-title">{project.title}</div>
              {project.subtitle && (
                <div className="v3-build-subtitle">{project.subtitle}</div>
              )}
              <div className="v3-build-tags">{project.tags}</div>
            </div>

            {/* Right: body + links */}
            <div className="v3-build-row-right">
              <div className="v3-build-body">
                <ReactMarkdown components={buildMarkdownComponents}>
                  {project.body}
                </ReactMarkdown>
              </div>
              {project.links.length > 0 && (
                <div className="v3-build-links">
                  {project.links.map((link) => {
                    const isInternal = link.href.startsWith("/");
                    return isInternal ? (
                      <Link
                        key={link.href}
                        href={link.href as Route}
                        className="v3-build-link"
                      >
                        {link.label} <span aria-hidden="true">↗</span>
                      </Link>
                    ) : (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="v3-build-link"
                      >
                        {link.label} <span aria-hidden="true">↗</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §05 Tech & Tools ────────────────────────────────────────────────────────
type SkillGroup = { name: string; level?: string; keywords?: string[] };

function StackGrid({ skills, t }: { skills: SkillGroup[]; t: T }) {
  return (
    <section id="tech-tools" className="v3-section">
      <SecHead n="05" label={t("section.techTools")} />
      <div className="v3-stack-grid">
        {skills.map((g) => (
          <div key={g.name} className="v3-stack-cell">
            <div className="v3-stack-cell-head">
              <span className="v3-stack-cell-name">{g.name}</span>
              {g.level && (
                <span className="v3-stack-cell-level">
                  {g.level.toUpperCase()}
                </span>
              )}
            </div>
            <div className="v3-stack-cell-keywords">
              {(g.keywords ?? []).join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §06 Contact ──────────────────────────────────────────────────────────────
function ContactBlock({ t }: { t: T }) {
  return (
    <section id="contact" className="v3-contact-section v3-container">
      <div className="v3-contact-grid">
        {/* Left: info */}
        <div>
          <SecHead n="06" label={t("section.getInTouch")} />
          <h2 className="v3-contact-h">
            {t("contact.headline")}
            <br />{" "}
            <span className="v3-accent-text">
              {t("contact.headlineAccent")}
            </span>
            .
          </h2>
          <p className="v3-contact-desc">{t("contact.description")}</p>
          <div className="v3-contact-links">
            {(
              [
                {
                  href: "mailto:vicente@opa.so",
                  label: t("contact.email"),
                  external: false,
                },
                {
                  href: "https://linkedin.com/in/vicenteopaso",
                  label: t("contact.linkedin"),
                  external: true,
                },
                {
                  href: "https://github.com/vicenteopaso",
                  label: t("contact.github"),
                  external: true,
                },
              ] as const
            ).map(({ href, label, external }) => (
              <a
                key={href}
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="v3-contact-link"
              >
                <span>{label}</span>
                <span aria-hidden="true" className="v3-contact-link-arrow">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <V3ContactForm />
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });
  const t = getTranslations(locale);
  const siteData = getSiteData(locale);

  // Load cv.json for work + skills
  let work: WorkEntry[] = [];
  let skills: SkillGroup[] = [];
  try {
    const cvPath = path.join(process.cwd(), "content", locale, "cv.json");
    const cv = JSON.parse(fs.readFileSync(cvPath, "utf8")) as {
      work?: WorkEntry[];
      skills?: SkillGroup[];
    };
    work = cv.work ?? [];
    skills = cv.skills ?? [];
  } catch (err) {
    logWarning(`Landing page CV JSON load failed for locale "${locale}"`, {
      component: "app/[lang]/page",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
  }

  return (
    <div className="v3-page">
      <HeroA4 locale={locale} t={t} tocEntries={siteData.landingToc} />
      <ImpactStrip impact={siteData.impact} />
      <TlDrSection
        t={t}
        tldr={siteData.tldr}
        tldrLabels={siteData.tldrLabels}
      />
      <FocusStrip t={t} focus={siteData.focus} />
      <ExperienceTable work={work} locale={locale} t={t} />
      {siteData.whatIBuild && (
        <WhatIBuildSection t={t} data={siteData.whatIBuild} />
      )}
      <StackGrid skills={skills} t={t} />
      <ContactBlock t={t} />
    </div>
  );
}
