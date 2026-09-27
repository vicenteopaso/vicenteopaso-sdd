"use client";

import clsx from "clsx";
import { useState } from "react";

import { useTranslations } from "@/lib/i18n";

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
      <div className="v3-cv-ref-card-eyebrow">
        ❝ REF · {String(index + 1).padStart(2, "0")}
      </div>
      <div className="v3-cv-ref-card-text">{text}</div>
      <div className="v3-cv-ref-card-attribution">
        <div className="v3-cv-ref-card-name">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="v3-cv-ref-card-name-link"
            >
              {name}
            </a>
          ) : (
            name
          )}
        </div>
        <div className="v3-cv-ref-card-role">{role}</div>
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
  const truncated = fullText.slice(0, 220) + "…";

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
      className={clsx(
        "v3-cv-ref-card",
        isEvenCol && "is-right-col",
        isLastRow && "is-last-row",
        expanded && "is-expanded",
        dimmed && "is-dimmed",
      )}
    >
      {/* Truncated content — always rendered to hold grid row height */}
      <div
        data-testid="cv-ref-card-truncated"
        aria-hidden={expanded ? true : undefined}
        inert={expanded ? true : undefined}
        className={clsx("v3-cv-ref-card-truncated", expanded && "is-expanded")}
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
          className="v3-cv-ref-card-toggle"
        >
          {t("cv.referencesShowMore")}
        </button>
      </div>

      {/* Expanded overlay — pointer-events:auto when expanded so links are clickable */}
      <div
        data-testid="cv-ref-card-overlay"
        className={clsx(
          "v3-cv-ref-card-overlay",
          isLastRow && "is-last-row",
          expanded && "is-expanded",
        )}
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
          className="v3-cv-ref-card-toggle"
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
