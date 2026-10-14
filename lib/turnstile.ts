/**
 * On-demand loader for the Cloudflare Turnstile script.
 *
 * Turnstile pulls ~700 KB of challenge code and sets a third-party cookie
 * (`_cfuvid`) as soon as its script runs. Loading it globally on every page
 * cost main-thread time and Lighthouse Best Practices points for visitors who
 * never touch a form, so forms call this the first time they're interacted
 * with instead.
 */

export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const SCRIPT_ID = "cf-turnstile";

let loadPromise: Promise<void> | null = null;

export function loadTurnstile(): Promise<void> {
  const scope = globalThis as typeof globalThis & Partial<Window>;
  const doc = scope.document;
  if (!doc) return Promise.resolve();
  if (scope.turnstile) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = doc.createElement("script");
    script.id = SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      // Allow a later interaction to retry after a transient network failure.
      loadPromise = null;
      script.remove();
      reject(new Error("Failed to load Cloudflare Turnstile"));
    });
    doc.head.appendChild(script);
  });

  return loadPromise;
}

/** Test-only: forget the cached load so each test starts clean. */
export function resetTurnstileLoaderForTests(): void {
  loadPromise = null;
}
