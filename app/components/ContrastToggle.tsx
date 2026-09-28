"use client";

import { useEffect, useRef, useState } from "react";

import {
  applyContrastPreference,
  CONTRAST_MEDIA_QUERY,
  type ContrastPreference,
  persistContrastPreference,
  readAppliedContrast,
  readStoredContrast,
  resolveContrastPreference,
} from "@/lib/contrast";
import { logWarning } from "@/lib/error-logging";
import { useTranslations } from "@/lib/i18n";

import { ContrastIcon } from "./icons";

/**
 * Site-wide High Contrast switch (WCAG technique G174): swaps the deeper
 * default accent reds for the WCAG AA palette. See lib/contrast.ts.
 */
export function ContrastToggle() {
  const t = useTranslations();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Reach the document through the ref rather than the window/document
    // globals (see docs/FORBIDDEN_PATTERNS.md).
    const doc = buttonRef.current?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view) return;
    const root = doc.documentElement;

    // The <head> init script applied the preference before paint; mirror it.
    setHighContrast(readAppliedContrast(root) === "more");

    // Follow OS "increase contrast" changes until the visitor makes a choice.
    if (typeof view.matchMedia !== "function") return;
    const media = view.matchMedia(CONTRAST_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      const next = resolveContrastPreference(
        readStoredContrast(view),
        event.matches,
      );
      applyContrastPreference(root, next);
      setHighContrast(next === "more");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const doc = buttonRef.current?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view) return;
    const root = doc.documentElement;

    const next: ContrastPreference =
      readAppliedContrast(root) === "more" ? "default" : "more";
    applyContrastPreference(root, next);
    setHighContrast(next === "more");

    if (!persistContrastPreference(view, next)) {
      logWarning(
        "High contrast preference could not be saved; it applies to this page only",
        { component: "ContrastToggle", action: "persistContrastPreference" },
      );
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className="v3-contrast-toggle"
      aria-pressed={highContrast}
      onClick={toggle}
    >
      <ContrastIcon className="v3-contrast-toggle-icon" />
      <span className="v3-contrast-toggle-label">{t("nav.highContrast")}</span>
    </button>
  );
}
