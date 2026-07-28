"use client";

import { useState } from "react";

import { useTranslations } from "@/lib/i18n";

const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };

const toggleButtonStyle: React.CSSProperties = {
  ...mono,
  display: "block",
  marginTop: 10,
  padding: 0,
  border: "none",
  background: "transparent",
  color: "var(--v3-accent-text)",
  fontSize: 10.5,
  letterSpacing: "0.08em",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  cursor: "pointer",
};

interface Ref {
  index: number;
  total: number;
  name: string;
  role: string;
  href?: string;
  fullText: string;
}

function CardContent({
  index,
  name,
  role,
  href,
  text,
}: {
  index: number;
  name: string;
  role: string;
  href?: string;
  text: string;
}) {
  return (
    <>
      <div
        style={{
          ...mono,
          fontSize: 10,
          color: "var(--v3-accent-text)",
          letterSpacing: "0.14em",
          marginBottom: 10,
        }}
      >
        ❝ REF · {String(index + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--v3-fg)",
          marginBottom: 14,
          lineHeight: 1.65,
        }}
      >
        {text}
      </div>
      <div style={{ paddingTop: 10, borderTop: "1px solid var(--v3-rule)" }}>
        <div
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.005em" }}
        >
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {name}
            </a>
          ) : (
            name
          )}
        </div>
        <div
          style={{
            ...mono,
            fontSize: 10.5,
            color: "var(--v3-muted)",
            letterSpacing: "0.04em",
            marginTop: 2,
          }}
        >
          {role}
        </div>
      </div>
    </>
  );
}

function CvRefCard({
  index,
  total,
  name,
  role,
  href,
  fullText,
  hovered,
  dimmed,
  onEnter,
  onLeave,
}: Ref & {
  hovered: boolean;
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const t = useTranslations();
  const [clickExpanded, setClickExpanded] = useState(false);
  const expanded = hovered || clickExpanded;
  const isEvenCol = index % 2 === 0;
  const isLastRow = index >= total - 2;
  const truncated = fullText.slice(0, 220) + "\u2026";

  const handleToggle = () => setClickExpanded((prev) => !prev);
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Only collapse when focus leaves the card entirely (not moving to the link inside)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setClickExpanded(false);
      onLeave();
    }
  };

  return (
    <div
      data-testid="cv-ref-card"
      onMouseEnter={onEnter}
      onFocus={onEnter}
      onBlur={handleBlur}
      style={{
        position: "relative",
        padding: "20px",
        borderTop: "none",
        borderLeft: "none",
        borderRight: isEvenCol ? "1px solid var(--v3-rule)" : "none",
        borderBottom: !isLastRow ? "1px solid var(--v3-rule)" : "none",
        zIndex: expanded ? 10 : "auto",
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 0.2s ease",
        background: "transparent",
        textAlign: "left",
        width: "100%",
      }}
    >
      {/* Truncated content — always rendered to hold grid row height */}
      <div
        data-testid="cv-ref-card-truncated"
        aria-hidden={expanded ? true : undefined}
        inert={expanded ? true : undefined}
        style={{ visibility: expanded ? "hidden" : "visible" }}
      >
        <CardContent
          index={index}
          name={name}
          role={role}
          href={href}
          text={truncated}
        />
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={false}
          style={toggleButtonStyle}
        >
          {t("cv.referencesShowMore")}
        </button>
      </div>

      {/* Expanded overlay — pointer-events:auto when expanded so links are clickable */}
      <div
        data-testid="cv-ref-card-overlay"
        style={{
          position: "absolute",
          ...(isLastRow ? { bottom: 0 } : { top: 0 }),
          left: 0,
          right: 0,
          padding: "20px",
          background: "var(--v3-bg)",
          border: "1px solid var(--v3-fg)",
          zIndex: 10,
          opacity: expanded ? 1 : 0,
          transform: expanded
            ? "translateY(0) scale(1)"
            : isLastRow
              ? "translateY(6px) scale(0.99)"
              : "translateY(-6px) scale(0.99)",
          transition: "opacity 0.2s ease, transform 0.22s ease",
          pointerEvents: expanded ? "auto" : "none",
        }}
        aria-hidden={expanded ? undefined : true}
        inert={expanded ? undefined : true}
      >
        <CardContent
          index={index}
          name={name}
          role={role}
          href={href}
          text={fullText}
        />
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={true}
          style={toggleButtonStyle}
        >
          {t("cv.referencesShowLess")}
        </button>
      </div>
    </div>
  );
}

interface CvRefsGridProps {
  refs: Array<{ name: string; role: string; href?: string; fullText: string }>;
}

export function CvRefsGrid({ refs }: CvRefsGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = refs.length;

  return (
    <div
      className="v3-cv-refs-grid"
      style={{
        marginTop: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        border: "1px solid var(--v3-rule)",
      }}
      // Collapse on mouse-leave or when keyboard focus leaves the grid entirely
      onMouseLeave={() => setActiveIndex(null)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setActiveIndex(null);
        }
      }}
    >
      {refs.map((ref, i) => (
        <CvRefCard
          key={i}
          index={i}
          total={total}
          name={ref.name}
          role={ref.role}
          href={ref.href}
          fullText={ref.fullText}
          hovered={activeIndex === i}
          dimmed={activeIndex !== null && activeIndex !== i}
          onEnter={() => setActiveIndex(i)}
          onLeave={() => setActiveIndex(null)}
        />
      ))}
    </div>
  );
}
