/**
 * High Contrast mode (WCAG 2.1 technique G174).
 *
 * The default v3 palette uses deeper accent reds that fall below 4.5:1 for
 * small text in the dark theme. Visitors switch to the WCAG AA palette with
 * the ContrastToggle in the site navigation; visitors whose OS asks for more
 * contrast get it automatically until they choose otherwise.
 * See docs/adr/0003-high-contrast-mode-conforming-alternate.md.
 *
 * The applied preference lives in one place — `data-contrast="more"` on
 * <html> — which styles/globals.css keys the High Contrast tokens off.
 */

export const CONTRAST_STORAGE_KEY = "contrast";
export const CONTRAST_ATTRIBUTE = "data-contrast";
export const CONTRAST_MEDIA_QUERY = "(prefers-contrast: more)";

export type ContrastPreference = "more" | "default";

type StorageHost = { readonly localStorage: Storage };

export function isContrastPreference(
  value: unknown,
): value is ContrastPreference {
  return value === "more" || value === "default";
}

/**
 * An explicit choice always wins; without one, follow the OS
 * "increase contrast" setting.
 */
export function resolveContrastPreference(
  stored: ContrastPreference | null,
  prefersMoreContrast: boolean,
): ContrastPreference {
  if (stored) return stored;
  return prefersMoreContrast ? "more" : "default";
}

/** The visitor's explicit choice, or null when there is none. */
export function readStoredContrast(
  host: StorageHost,
): ContrastPreference | null {
  try {
    const value = host.localStorage.getItem(CONTRAST_STORAGE_KEY);
    return isContrastPreference(value) ? value : null;
  } catch {
    // Storage access throws when disabled (privacy modes, blocked cookies);
    // that reads as "no explicit choice", so the OS setting still applies.
    return null;
  }
}

/** Saves an explicit choice. Returns false when storage is unavailable. */
export function persistContrastPreference(
  host: StorageHost,
  preference: ContrastPreference,
): boolean {
  try {
    host.localStorage.setItem(CONTRAST_STORAGE_KEY, preference);
    return true;
  } catch {
    // Reported to the caller, which logs it; the preference still applies to
    // the current page.
    return false;
  }
}

export function applyContrastPreference(
  root: Element,
  preference: ContrastPreference,
): void {
  if (preference === "more") {
    root.setAttribute(CONTRAST_ATTRIBUTE, "more");
  } else {
    root.removeAttribute(CONTRAST_ATTRIBUTE);
  }
}

export function readAppliedContrast(root: Element): ContrastPreference {
  return root.getAttribute(CONTRAST_ATTRIBUTE) === "more" ? "more" : "default";
}

/**
 * Inline <head> script (app/layout.tsx) that applies the preference before
 * first paint, so High Contrast visitors never see the default palette flash.
 * Mirrors resolveContrastPreference(); test/unit/contrast.test.ts runs both
 * over the same cases. Storage and matchMedia failures are independent: an
 * unreadable choice still lets the OS setting apply.
 */
export const contrastInitScript = [
  "(function(){var s=null,m=false;",
  `try{s=localStorage.getItem("${CONTRAST_STORAGE_KEY}")}catch(e){}`,
  `try{m=matchMedia("${CONTRAST_MEDIA_QUERY}").matches}catch(e){}`,
  `if(s==="more"||(s!=="default"&&m)){document.documentElement.setAttribute("${CONTRAST_ATTRIBUTE}","more")}`,
  "})();",
].join("");
