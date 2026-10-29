import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { locales } from "../../lib/i18n/locales";
import { config } from "../../proxy";

// Unlike middleware.test.ts, this file uses the real locales and the real
// app/[lang] tree, so it fails when a page or locale is added without
// updating the hard-coded matcher in proxy.ts.

const LANG_DIR = path.join(process.cwd(), "app", "[lang]");
const ROUTE_FILE_RE = /^(page|route|opengraph-image)\.tsx?$/;

function localizedRoutes(dir = LANG_DIR, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return localizedRoutes(
        path.join(dir, entry.name),
        `${prefix}/${entry.name}`,
      );
    }
    const match = ROUTE_FILE_RE.exec(entry.name);
    if (!match) return [];
    return [
      match[1] === "opengraph-image" ? `${prefix}/opengraph-image` : prefix,
    ];
  });
}

// Next compiles the matcher source into an anchored regex; mirror that.
// eslint-disable-next-line security/detect-non-literal-regexp -- static source from proxy config
const matcher = new RegExp(`^${config.matcher[0]}$`);

describe("proxy matcher", () => {
  const routes = localizedRoutes();

  it("finds the localized routes", () => {
    expect(routes).toContain("");
    expect(routes).toContain("/cv");
  });

  it.each(
    locales.flatMap((locale) => routes.map((route) => `/${locale}${route}`)),
  )("skips the known localized route %s", (pathname) => {
    expect(matcher.test(pathname)).toBe(false);
  });

  it.each(locales.map((locale) => `/${locale}/no-such-page`))(
    "still runs on the unknown localized path %s",
    (pathname) => {
      expect(matcher.test(pathname)).toBe(true);
    },
  );
});
