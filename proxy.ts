import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { LOCALE_REQUEST_HEADER, locales } from "./lib/i18n/locales";

// Block common attack vectors and bot probes
const SUSPICIOUS_PATTERNS = [
  "/wp-login.php",
  "/wp-admin",
  "/wp-content",
  "/wp-includes",
  "/wp-json",
  "/wordpress",
  "/xmlrpc.php",
  "/.env",
  "/.git",
  "/.aws",
  "/.ssh",
  "/.vscode",
  "/.well-known/security.txt",
  "/admin",
  "/administrator",
  "/phpmyadmin",
  "/user/login",
  "/sites/default",
  "/config.php",
  "/typo3",
  "/cgi-bin",
  "/owa",
  "/ecp",
  "/manager",
  "/solr",
  "/jenkins",
  "/console",
  "/actuator",
  "/server-status",
  "/_ignition",
  "/wlwmanifest.xml",
  "/sftp-config",
  "/api/v1",
  "/blog/wp-",
  "/2020/",
  "/2021/",
  "/2022/",
  "/2023/",
  "/2024/",
] as const;

// File extensions that are never served by this app — almost always probes.
const SUSPICIOUS_EXTENSION_RE =
  /\.(php|aspx?|jsp|cgi|env|bak|backup|old|orig|swp|sql|ya?ml|ini|conf|sh|log|db|sqlite)$/i;

type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

/**
 * Determine the best locale for the request:
 * 1. User's stored cookie preference (set when manually switching language)
 * 2. Browser's Accept-Language header
 * 3. Default locale (en)
 */
function detectLocale(req: NextRequest): Locale {
  // 1. Stored preference cookie
  const cookieLocale = req.cookies?.get("preferred-locale")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 2. Accept-Language header
  const langHeader = req.headers.get("accept-language") ?? "";
  const preferredLangs = langHeader
    .split(",")
    .map((item) => {
      const parts = item.trim().split(";");
      const lang = (parts[0] ?? "").trim().toLowerCase().slice(0, 2);
      const qPart = parts.find((p) => /^\s*q\s*=/i.test(p));
      const q = qPart ? parseFloat(qPart.replace(/^\s*q\s*=\s*/i, "")) : 1;
      return { lang, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q)
    .map(({ lang }) => lang);

  for (const lang of preferredLangs) {
    const match = (locales as readonly string[]).find((l) => l === lang);
    if (match) return match as Locale;
  }

  // 3. Default
  return defaultLocale;
}

/**
 * Proxy to handle locale-based routing and redirects.
 *
 * - Redirects non-locale-prefixed paths to the appropriate locale.
 * - Priority: stored cookie preference → Accept-Language header → default (en)
 * - Preserves user's manual locale choice for paths that already include a locale prefix.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/cv/download") {
    return NextResponse.next();
  }

  if (
    SUSPICIOUS_PATTERNS.some((pattern) => pathname.startsWith(pattern)) ||
    SUSPICIOUS_EXTENSION_RE.test(pathname)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // Locale already in the path: continue, forwarding the locale as a request
  // header for routes that get no params (app/global-not-found.tsx).
  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathLocale) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(LOCALE_REQUEST_HEADER, pathLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Detect locale and redirect
  const targetLocale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  return NextResponse.redirect(url, { status: 307 });
}

/**
 * Configure which paths the proxy should run on.
 */
export const config = {
  matcher: [
    // Run on everything except internal Next paths, the api tree, and real
    // static assets. The previous `.*\\..*` exclusion was too broad: it
    // silently dropped probe paths (.php, .env, .bak, .aspx, ...) before
    // they ever reached this proxy, so the suspicious-pattern block below
    // never ran on them. We now exclude only known-safe asset extensions
    // so probe-style dotted paths fall through to be 404'd here.
    // `monitoring` is the Sentry tunnelRoute (next.config.mjs); it must reach
    // the Sentry rewrite unprefixed, not be redirected to /{locale}/monitoring.
    // Known localized routes are skipped too: the proxy runs as a Vercel
    // Function, so matching them billed CPU on every view and prefetch of an
    // otherwise static page just to set the locale header. Unknown paths
    // under a locale still match, so the 404 stays localized and probes are
    // still blocked. Must be a literal (Next reads it at build time);
    // test/unit/proxy-matcher.test.ts fails if a new route or locale is not
    // listed here.
    "/((?!api/|_next/static|_next/image|opengraph-image|monitoring(?:/|$)|(?:en|es)(?:/(?:accessibility|articles/8-agent-job-search-system|cookie-policy|cv(?:/download|/opengraph-image)?|found-luggage|lost-luggage|opengraph-image|privacy-policy|tech-stack|technical-governance))?$|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|css|js|mjs|map|webmanifest|xml|txt|json|pdf|mp4|webm|mp3|wav)$).*)",
  ],
};
