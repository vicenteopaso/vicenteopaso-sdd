import fs from "fs";
import { ImageResponse } from "next/og";
import path from "path";

import { getCvDescription, siteConfig } from "@/lib/seo";

type OgLocale = "en" | "es";

/** Cached Inter 800 Latin font — lazy-loaded on first call, then cached at module level across all OG renders. */
let _interFontCache: ArrayBuffer | null = null;

/** Loads Inter 800 Latin static font for use in Satori/ImageResponse. Variable fonts are unsupported. */
function loadInterFont(): ArrayBuffer {
  if (_interFontCache) return _interFontCache;
  const fontPath = path.join(
    process.cwd(),
    "public/fonts/inter/inter-800-latin.woff",
  );
  const buf = fs.readFileSync(fontPath);
  const ab = new ArrayBuffer(buf.length);
  new Uint8Array(ab).set(buf);
  _interFontCache = ab;
  return ab;
}

/** Cached logo data URI — lazy-loaded on first call, then cached at module level across all OG renders. */
let _logoDataUriCache: string | null = null;

/**
 * Loads the logo as an inline data URI instead of an absolute URL.
 *
 * Satori (via next/og's ImageResponse) fetches <img src> over the network,
 * and VERCEL_URL always points at the ephemeral per-deployment hostname
 * (never the stable production domain) — which is commonly gated behind
 * Vercel's deployment protection, so the self-fetch returns an HTML auth
 * page instead of image bytes. Reading the asset from disk (same pattern
 * as loadInterFont() above) sidesteps that class of failure entirely.
 */
function loadLogoDataUri(): string {
  if (_logoDataUriCache) return _logoDataUriCache;
  const logoPath = path.join(
    process.cwd(),
    "public/assets/images/logo_dark.png",
  );
  const buf = fs.readFileSync(logoPath);
  _logoDataUriCache = `data:image/png;base64,${buf.toString("base64")}`;
  return _logoDataUriCache;
}

const size = {
  width: 1200,
  height: 630,
} as const;

const palette = {
  ink: "#0c0b09",
  cream: "#f0ebe1",
  red: "#cf201d",
  muted: "#8f897f",
  panelRule: "#cfc7bb", // dark-theme panel divider (on cream bg)
  panelMuted: "#7d776f", // dark-theme panel muted text (on cream bg)
  lightPanelRule: "#3a3530", // light-theme panel divider (on ink bg)
  lightPanelMuted: "#8f897f", // light-theme panel muted text (on ink bg) = palette.muted
};

const homeContentByLocale: Record<
  OgLocale,
  {
    navAbout: string;
    navContact: string;
    roleLabel: string;
    summaryLabel: string;
    summaryPrefix: string;
    highlightedWord: string;
    subtitle: string;
    basedLabel: string;
    statusLabel: string;
    status: string;
    editionLabel: string;
  }
> = {
  en: {
    navAbout: "ABOUT",
    navContact: "CONTACT",
    roleLabel: "FRONTEND ARCHITECT & TECHNICAL LEADER",
    summaryLabel: "TL;DR",
    summaryPrefix:
      "15 years shipping on the web. 10 in telecom before that. Currently open to my ",
    highlightedWord: "next challenge.",
    subtitle:
      "Frontend Architect & Technical Leader — composable platforms, design systems, and the teams behind them.",
    basedLabel: "BASED",
    statusLabel: "STATUS",
    status: "Open to roles",
    editionLabel: "EDITION 2026.05",
  },
  es: {
    navAbout: "PERFIL",
    navContact: "CONTACTO",
    roleLabel: "ARQUITECTO FRONTEND Y LÍDER TÉCNICO",
    summaryLabel: "RESUMEN",
    summaryPrefix:
      "15 años creando para la web. 10 en telecom antes de eso. Actualmente abierto a mi ",
    highlightedWord: "próximo reto.",
    subtitle:
      "Gerente de Ingeniería Web y Arquitecto Frontend — plataformas componibles, design systems y los equipos detrás de ellas.",
    basedLabel: "BASE",
    statusLabel: "ESTADO",
    status: "Abierto a roles",
    editionLabel: "EDICIÓN 2026.05",
  },
};

function renderBrandedOgImage({
  locale,
  eyebrow,
  titleFirstLine,
  titleSecondLine,
  subtitle,
  panelLabel,
  panelPrefix,
  panelHighlight,
  bottomLeftLabel,
  bottomLeftValue,
  bottomRightLabel,
  bottomRightValue,
  theme = "dark",
}: {
  locale: OgLocale;
  eyebrow: string;
  titleFirstLine: string;
  titleSecondLine: string;
  subtitle: string;
  panelLabel: string;
  panelPrefix: string;
  panelHighlight: string;
  bottomLeftLabel: string;
  bottomLeftValue: string;
  bottomRightLabel: string;
  bottomRightValue: string;
  theme?: "dark" | "light";
}) {
  const homeCopy = homeContentByLocale[locale];
  const fontData = loadInterFont();

  const isDark = theme === "dark";
  const bg = isDark ? palette.ink : palette.cream;
  const fg = isDark ? palette.cream : palette.ink;
  const ruleFg = isDark ? palette.cream : palette.ink;
  const mutedFg = palette.muted;
  const panelBg = isDark ? palette.cream : palette.ink;
  const panelFg = isDark ? palette.ink : palette.cream;
  const panelMutedFg = isDark ? palette.panelMuted : palette.lightPanelMuted;
  const panelRuleFg = isDark ? palette.panelRule : palette.lightPanelRule;

  const sansFamily =
    '"Arial", "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif';

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: bg,
        color: fg,
        fontFamily: sansFamily,
      }}
    >
      {/* ── Top nav bar ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 32px 16px",
          borderBottom: `2px solid ${ruleFg}`,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontSize: 16,
          color: mutedFg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image is not available inside next/og ImageResponse markup */}
          <img
            src={loadLogoDataUri()}
            alt="Opaso logo"
            width={44}
            height={44}
            style={{ display: "flex" }}
          />
          <span>/V2026</span>
          <span>—</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: palette.red,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "999px",
                background: palette.red,
                display: "flex",
                flexShrink: 0,
              }}
            />
            MÁLAGA, ES
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span>{homeCopy.navAbout}</span>
          <span>·</span>
          <span>CV</span>
          <span>·</span>
          <span>{homeCopy.navContact}</span>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 32,
          padding: "24px 32px 20px",
        }}
      >
        {/* Left: eyebrow + name + subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            paddingRight: 8,
          }}
        >
          {/* Eyebrow — anchored to top */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 15,
            }}
          >
            <span style={{ color: palette.red }}>§00</span>
            <span style={{ color: mutedFg }}>&nbsp;—&nbsp;</span>
            <span style={{ color: palette.red }}>{eyebrow}</span>
          </div>

          {/* Name — centered by space-between */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              letterSpacing: "-0.055em",
            }}
          >
            <span
              style={{
                fontSize: 138,
                lineHeight: 0.86,
                color: fg,
                fontWeight: 800,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {titleFirstLine}
            </span>
            <span
              style={{
                fontSize: 148,
                lineHeight: 0.9,
                color: palette.red,
                fontWeight: 800,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {titleSecondLine}
            </span>
          </div>

          {/* Subtitle — anchored to bottom */}
          <p
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.42,
              letterSpacing: "-0.02em",
              color: fg,
              fontWeight: 600,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Right: TL;DR panel */}
        <div
          style={{
            width: 380,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "22px 22px 20px",
            background: panelBg,
            color: panelFg,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 14,
                color: panelMutedFg,
              }}
            >
              {panelLabel}
            </span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                columnGap: 7,
                rowGap: 4,
                fontSize: 30,
                lineHeight: 1.35,
                letterSpacing: "-0.04em",
                fontWeight: 600,
              }}
            >
              <span>{panelPrefix.trim()}</span>
              <span style={{ color: palette.red }}>{panelHighlight}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 14,
              borderTop: `1px solid ${panelRuleFg}`,
            }}
          >
            <div style={{ display: "flex", gap: 44 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 13,
                    color: panelMutedFg,
                  }}
                >
                  {bottomLeftLabel}
                </span>
                <span style={{ fontSize: 17, fontWeight: 700 }}>
                  {bottomLeftValue}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 13,
                    color: panelMutedFg,
                  }}
                >
                  {bottomRightLabel}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 17,
                    fontWeight: 700,
                    color: palette.red,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "999px",
                      background: palette.red,
                    }}
                  />
                  <span>{bottomRightValue.replace(/^●\s*/, "")}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px 20px",
          borderTop: `2px solid ${ruleFg}`,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: 14,
          color: mutedFg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ color: fg, fontWeight: 700 }}>
            {siteConfig.domain}
          </span>
          <span>—</span>
          <span>vicente@opa.so</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span>EST. 2001</span>
          <span>|</span>
          <span style={{ color: palette.red }}>{homeCopy.editionLabel}</span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Inter", data: fontData, weight: 800, style: "normal" }],
    },
  );
}

export function getDefaultOgLocale(): OgLocale {
  return "en";
}

export function getOgHomeSize() {
  return size;
}

export type OgTheme = "dark" | "light";

function homeOgArgs(locale: OgLocale) {
  const copy = homeContentByLocale[locale];
  return {
    locale,
    eyebrow: copy.roleLabel,
    titleFirstLine: "Vicente",
    titleSecondLine: "Opaso.",
    subtitle: copy.subtitle,
    panelLabel: copy.summaryLabel,
    panelPrefix: copy.summaryPrefix,
    panelHighlight: copy.highlightedWord,
    bottomLeftLabel: copy.basedLabel,
    bottomLeftValue: "Málaga, ES",
    bottomRightLabel: copy.statusLabel,
    bottomRightValue: `● ${copy.status}`,
  } as const;
}

function cvOgArgs(locale: OgLocale) {
  const description = getCvDescription(locale);
  const isEs = locale === "es";
  return {
    locale,
    eyebrow: isEs ? "CURRÍCULUM VITAE × PERFIL" : "CURRICULUM VITAE × PROFILE",
    titleFirstLine: "Vicente",
    titleSecondLine: "Opaso.",
    subtitle: description,
    panelLabel: isEs ? "ENFOQUE" : "FOCUS",
    panelPrefix: isEs
      ? "Experiencia, liderazgo técnico y sistemas de diseño para "
      : "Experience, technical leadership, and design systems for ",
    panelHighlight: isEs ? "equipos globales." : "global teams.",
    bottomLeftLabel: isEs ? "SECCIÓN" : "SECTION",
    bottomLeftValue: isEs ? "Experiencia y habilidades" : "Experience & skills",
    bottomRightLabel: isEs ? "DOCUMENTO" : "DOCUMENT",
    bottomRightValue: isEs ? "● CV activo" : "● Live CV",
  } as const;
}

export function createHomeOgImage(
  locale: OgLocale = "en",
  theme: OgTheme = "dark",
) {
  return renderBrandedOgImage({ ...homeOgArgs(locale), theme });
}

export function createCvOgImage(
  locale: OgLocale = "en",
  theme: OgTheme = "dark",
) {
  return renderBrandedOgImage({ ...cvOgArgs(locale), theme });
}
