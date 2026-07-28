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

// ─── Shared style helpers ─────────────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };
const big: React.CSSProperties = {
  fontFamily: "var(--f-sans)",
  fontWeight: 800,
  letterSpacing: "-0.045em",
};
const rule2: React.CSSProperties = { borderBottom: "2px solid var(--v3-fg)" };
const rule1: React.CSSProperties = { borderBottom: "1px solid var(--v3-rule)" };
const MAX_W = 1180;

type T = ReturnType<typeof getTranslations>;

// ─── Section heading: §NN ── LABEL ─────── ───────────────────────────────────
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
    <section
      className="v3-section v3-hero-section"
      style={{
        padding: "64px 32px 32px",
        ...rule2,
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        className="v3-hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        {/* Left: headline + sub + CTAs */}
        <div>
          <div
            className="v3-hero-label"
            style={{
              ...mono,
              fontSize: 11,
              color: "var(--v3-muted)",
              letterSpacing: "0.14em",
              marginBottom: 20,
            }}
          >
            {t("hero.label")}
          </div>
          <h1
            className="v3-hero-h1"
            style={{ ...big, fontSize: 80, lineHeight: 0.92, margin: 0 }}
          >
            {t("hero.headline1")}
            <br />
            {t("hero.headline2")}
            <br />
            <span style={{ color: "var(--v3-accent-text)" }}>
              {t("hero.headline3")}
            </span>
            <br />
            {t("hero.headline4")}
          </h1>
          <p
            className="v3-hero-sub"
            style={{
              fontSize: 15,
              color: "var(--v3-muted)",
              marginTop: 24,
              maxWidth: 440,
              lineHeight: 1.65,
            }}
          >
            {t("hero.sub")}
          </p>
          <div
            className="v3-hero-ctas"
            style={{ display: "flex", gap: 10, marginTop: 28 }}
          >
            <HeroBtn href={`/${locale}/cv`} primary>
              {t("hero.readCv")}
            </HeroBtn>
            <HeroBtn href="#contact">{t("hero.email")}</HeroBtn>
          </div>
        </div>

        {/* Right: TOC */}
        <div>
          <div
            style={{
              ...mono,
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--v3-muted)",
              marginBottom: 12,
            }}
          >
            {t("hero.contents")}
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
                    i < tocEntries.length - 1
                      ? "1px solid var(--v3-rule)"
                      : "none",
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
                      color: "var(--v3-fg)",
                      marginLeft: 12,
                    }}
                  >
                    — {entry.s}
                  </span>
                </span>
                <span
                  style={{ ...mono, fontSize: 14, color: "var(--v3-muted)" }}
                >
                  ↓
                </span>
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
    </Link>
  );
}

// ─── Impact 4-stat strip ──────────────────────────────────────────────────────
function ImpactStrip({ impact }: { impact: Array<{ k: string; v: string }> }) {
  return (
    <section
      style={{ ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}
    >
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
    <section
      id="tl-dr"
      style={{ ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}
    >
      <div
        className="v3-tldr-grid"
        style={{ display: "grid", gridTemplateColumns: "260px 1fr", ...rule1 }}
      >
        {/* Inverted sidebar */}
        <div
          className="v3-tldr-sidebar"
          style={{
            background: "var(--v3-fg)",
            color: "var(--v3-bg)",
            padding: "32px 24px",
          }}
        >
          <div
            style={{
              ...mono,
              fontSize: 11,
              opacity: 0.6,
              letterSpacing: "0.18em",
            }}
          >
            §01
          </div>
          <div style={{ ...big, fontSize: 48, lineHeight: 0.95, marginTop: 8 }}>
            TL;<span style={{ color: "var(--v3-accent-text)" }}>DR</span>
          </div>
          <div
            style={{
              ...mono,
              fontSize: 11,
              opacity: 0.75,
              letterSpacing: "0.06em",
              marginTop: 14,
              lineHeight: 1.7,
            }}
          >
            {t("tldr.subtitle1")}
            <br />
            {t("tldr.subtitle2")}
            <br />
            {t("tldr.subtitle3")}
          </div>
        </div>

        {/* Numbered list */}
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {tldr.map((item, i) => (
            <li
              key={i}
              className="v3-tldr-item"
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 80px",
                alignItems: "baseline",
                padding: "18px 24px",
                borderBottom:
                  i < tldr.length - 1 ? "1px solid var(--v3-rule)" : "none",
                gap: 16,
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
                0{i + 1} —
              </span>
              <span
                style={{
                  fontSize: 16,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {item}
              </span>
              <span
                className="v3-tldr-label"
                style={{
                  ...mono,
                  fontSize: 10,
                  color: "var(--v3-muted)",
                  letterSpacing: "0.14em",
                  textAlign: "right" as const,
                }}
              >
                {tldrLabels[i]}
              </span>
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
    <section
      id="what-i-do"
      className="v3-section"
      style={{
        padding: "48px 32px",
        ...rule2,
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <SecHead n="02" label={t("section.whatIDo")} />
      <div
        className="v3-focus-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          marginTop: 24,
          border: "1px solid var(--v3-rule)",
        }}
      >
        {focus.map((f, i) => (
          <div
            key={i}
            className="v3-focus-item"
            style={{
              padding: "20px 18px",
              borderRight: i % 3 !== 2 ? "1px solid var(--v3-rule)" : "none",
              borderBottom: i < 3 ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <div
              style={{
                ...mono,
                fontSize: 10,
                color: "var(--v3-accent-text)",
                letterSpacing: "0.14em",
                marginBottom: 8,
              }}
            >
              0{i + 1}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "-0.015em",
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              {f.h}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--v3-muted)",
                lineHeight: 1.55,
              }}
            >
              {f.b}
            </div>
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
    <section
      id="experience"
      className="v3-section"
      style={{
        padding: "48px 32px",
        ...rule2,
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <SecHead n="03" label={t("section.whereWorked")} />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        <div
          className="v3-exp-header"
          style={{
            display: "grid",
            gridTemplateColumns: "130px 1fr 200px 80px",
            padding: "10px 16px",
            borderBottom: "1px solid var(--v3-rule)",
            ...mono,
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--v3-muted)",
          }}
        >
          <span>{t("exp.colDates")}</span>
          <span>{t("exp.colRole")}</span>
          <span className="v3-exp-loc">{t("exp.colLocation")}</span>
          <span className="v3-exp-read" style={{ textAlign: "right" as const }}>
            →
          </span>
        </div>
        {work.map((company, ci) =>
          company.positions.map((role, ri) => {
            const isCurrent = !role.endDate || role.endDate === "Present";
            const nowLabel = t("exp.now");
            const dateStr = `${fmtDate(role.startDate, nowLabel)} – ${isCurrent ? nowLabel : fmtDate(role.endDate, nowLabel)}`;
            return (
              <div
                key={`${ci}-${ri}`}
                className="v3-exp-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 1fr 200px 80px",
                  padding: "14px 16px",
                  borderBottom:
                    ci < work.length - 1 || ri < company.positions.length - 1
                      ? "1px solid var(--v3-rule)"
                      : "none",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    ...mono,
                    fontSize: 11,
                    color: isCurrent
                      ? "var(--v3-accent-text)"
                      : "var(--v3-muted)",
                    whiteSpace: "nowrap",
                    paddingRight: 16,
                  }}
                >
                  {dateStr}
                </span>
                <span style={{ fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{role.position}</span>
                  <span style={{ color: "var(--v3-muted)" }}>
                    {" "}
                    · {company.company}
                  </span>
                </span>
                <span
                  className="v3-exp-loc"
                  style={{ ...mono, fontSize: 11, color: "var(--v3-muted)" }}
                >
                  {company.location ?? ""}
                </span>
                <Link
                  href={`/${locale}/cv#cv-experience` as Route}
                  className="v3-exp-read"
                  style={{
                    ...mono,
                    fontSize: 11,
                    color: "var(--v3-fg)",
                    textDecoration: "none",
                    textAlign: "right" as const,
                    letterSpacing: "0.1em",
                  }}
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

function WhatIBuildSection({ t, data }: { t: T; data: WhatIBuildData }) {
  return (
    <section
      id="what-i-build"
      className="v3-section"
      style={{
        padding: "48px 32px",
        ...rule2,
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <SecHead n="04" label={t("section.whatIBuild")} />
      <p
        style={{
          fontSize: 14,
          color: "var(--v3-muted)",
          maxWidth: 760,
          lineHeight: 1.7,
          margin: "20px 0 24px",
        }}
      >
        {data.intro}
      </p>
      <div
        className="v3-build-list"
        style={{ border: "1px solid var(--v3-rule)" }}
      >
        {data.projects.map((project, i) => (
          <div
            key={project.title}
            className="v3-build-row"
            style={{
              borderBottom:
                i < data.projects.length - 1
                  ? "1px solid var(--v3-rule)"
                  : "none",
            }}
          >
            {/* Left: title + subtitle + tags */}
            <div
              className="v3-build-row-left"
              style={{
                padding: "24px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  marginBottom: 4,
                }}
              >
                {project.title}
              </div>
              {project.subtitle && (
                <div
                  style={{
                    ...mono,
                    fontSize: 11,
                    color: "var(--v3-muted)",
                    marginBottom: 10,
                  }}
                >
                  {project.subtitle}
                </div>
              )}
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  color: "var(--v3-accent-text)",
                  letterSpacing: "0.12em",
                  lineHeight: 1.7,
                }}
              >
                {project.tags}
              </div>
            </div>

            {/* Right: body + links */}
            <div style={{ padding: "24px 22px" }}>
              <div
                style={{
                  marginBottom: project.links.length > 0 ? 14 : 0,
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--v3-muted)",
                          lineHeight: 1.65,
                          margin: "0 0 10px",
                        }}
                      >
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul
                        style={{
                          listStyle: "disc",
                          paddingLeft: 18,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li
                        className="v3-build-bullet"
                        style={{
                          fontSize: 13,
                          color: "var(--v3-muted)",
                          lineHeight: 1.65,
                        }}
                      >
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong
                        style={{
                          fontWeight: 700,
                          color: "var(--v3-fg)",
                        }}
                      >
                        {children}
                      </strong>
                    ),
                    code: ({ children }) => (
                      <code
                        style={{
                          fontFamily: "var(--f-mono)",
                          fontSize: 11,
                          color: "var(--v3-accent-text)",
                          backgroundColor: "var(--v3-bg)",
                        }}
                      >
                        {children}
                      </code>
                    ),
                  }}
                >
                  {project.body}
                </ReactMarkdown>
              </div>
              {project.links.length > 0 && (
                <div
                  style={{
                    ...mono,
                    fontSize: 11,
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap" as const,
                    borderTop: "1px solid var(--v3-rule)",
                    paddingTop: 10,
                  }}
                >
                  {project.links.map((link) => {
                    const isInternal = link.href.startsWith("/");
                    const linkStyle = {
                      color: "var(--v3-fg)",
                      textDecoration: "none",
                      letterSpacing: "0.06em",
                    };
                    return isInternal ? (
                      <Link
                        key={link.href}
                        href={link.href as Route}
                        style={linkStyle}
                      >
                        {link.label} <span aria-hidden="true">↗</span>
                      </Link>
                    ) : (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
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
    <section
      id="tech-tools"
      className="v3-section"
      style={{
        padding: "48px 32px",
        ...rule2,
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <SecHead n="05" label={t("section.techTools")} />
      <div
        className="v3-stack-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          marginTop: 24,
          border: "1px solid var(--v3-rule)",
        }}
      >
        {skills.map((g, i) => (
          <div
            key={g.name}
            style={{
              padding: "20px 18px",
              borderRight: i % 3 !== 2 ? "1px solid var(--v3-rule)" : "none",
              borderBottom:
                i < skills.length - (skills.length % 3 || 3)
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
                    fontSize: 9,
                    color: "var(--v3-accent-text)",
                    letterSpacing: "0.14em",
                  }}
                >
                  {g.level.toUpperCase()}
                </span>
              )}
            </div>
            <div
              style={{
                ...mono,
                fontSize: 11,
                color: "var(--v3-muted)",
                lineHeight: 1.75,
              }}
            >
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
    <section
      id="contact"
      className="v3-section"
      style={{
        padding: "56px 32px",
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        className="v3-contact-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}
      >
        {/* Left: info */}
        <div>
          <SecHead n="06" label={t("section.getInTouch")} />
          <h2
            style={{ ...big, fontSize: 64, lineHeight: 0.95, margin: "16px 0" }}
          >
            {t("contact.headline")}
            <br />{" "}
            <span style={{ color: "var(--v3-accent-text)" }}>
              {t("contact.headlineAccent")}
            </span>
            .
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--v3-muted)",
              maxWidth: 380,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {t("contact.description")}
          </p>
          <div
            style={{
              marginTop: 28,
              borderTop: "1px solid var(--v3-rule)",
            }}
          >
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
                style={{
                  ...mono,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 0",
                  borderBottom: "1px solid var(--v3-rule)",
                  color: "var(--v3-fg)",
                  textDecoration: "none",
                  minHeight: 44,
                }}
              >
                <span>{label}</span>
                <span
                  aria-hidden="true"
                  style={{ color: "var(--v3-accent-text)", fontSize: 14 }}
                >
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
