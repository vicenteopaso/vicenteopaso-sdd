import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../proxy";

// Mock the locales module
vi.mock("../../lib/i18n/locales", () => ({
  locales: ["en", "es"],
  LOCALE_REQUEST_HEADER: "x-opaso-locale",
}));

describe("proxy (middleware)", () => {
  let proxy: (req: NextRequest) => Response | NextResponse;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../../proxy");
    proxy = mod.proxy;
  });

  function createMockRequest(
    pathname: string,
    acceptLanguage?: string,
    preferredLocale?: string,
  ): NextRequest {
    const url = new URL(pathname, "http://localhost:3000");

    // Add clone method to URL for middleware redirect logic
    const urlWithClone = Object.assign(url, {
      clone: () => {
        const cloned = new URL(url.toString());
        Object.assign(cloned, { clone: urlWithClone.clone });
        return cloned;
      },
    });

    const headers = new Headers();
    if (acceptLanguage) {
      headers.set("accept-language", acceptLanguage);
    }

    return {
      nextUrl: urlWithClone,
      headers,
      cookies: {
        get: (name: string) =>
          name === "preferred-locale" && preferredLocale
            ? { value: preferredLocale }
            : undefined,
      },
    } as NextRequest;
  }

  describe("locale request header", () => {
    it.each([
      ["/es/nope", "es"],
      ["/en", "en"],
      ["/en/cv", "en"],
    ])(
      "forwards the path locale for %s so global-not-found can localize",
      (path, locale) => {
        const response = proxy(createMockRequest(path)) as NextResponse;

        expect(response.status).toBe(200);
        expect(
          response.headers.get("x-middleware-request-x-opaso-locale"),
        ).toBe(locale);
      },
    );
  });

  describe("Spanish locale detection and redirect", () => {
    it("should prioritize preferred locale cookie over accept-language", () => {
      const req = createMockRequest("/", "en-US,en;q=0.9", "es");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });

    it("should ignore unsupported preferred locale cookies", () => {
      const req = createMockRequest("/", "es-ES,es;q=0.9", "fr");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });

    it("should redirect Spanish browsers from / to /es", () => {
      const req = createMockRequest("/", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });

    it("should redirect when accept-language starts with es", () => {
      const req = createMockRequest("/", "es");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
    });

    it("should redirect with mixed language preferences where Spanish is first", () => {
      const req = createMockRequest("/", "es-MX,en;q=0.9,fr;q=0.8");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });
  });

  describe("Non-Spanish locale handling", () => {
    it("should redirect English browsers to /en", () => {
      const req = createMockRequest("/", "en-US,en;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should redirect French browsers to /en", () => {
      const req = createMockRequest("/", "fr-FR,fr;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should redirect to /en when accept-language header is missing", () => {
      const req = createMockRequest("/");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should redirect to /en when accept-language header is empty", () => {
      const req = createMockRequest("/", "");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });
  });

  describe("Locale already in path", () => {
    it("should not redirect when path is /es", () => {
      const req = createMockRequest("/es", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });

    it("should not redirect when path is /en", () => {
      const req = createMockRequest("/en", "en-US,en;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });

    it("should not redirect when path starts with /es/", () => {
      const req = createMockRequest("/es/cv", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });

    it("should not redirect when path starts with /en/", () => {
      const req = createMockRequest("/en/about", "en-US,en;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });
  });

  describe("Non-root path handling", () => {
    it("should leave /cv/download as the default English download route", () => {
      const req = createMockRequest("/cv/download", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
      expect((response as NextResponse).headers.get("location")).toBeNull();
    });

    it("should redirect Spanish browsers from /cv to /es/cv", () => {
      const req = createMockRequest("/cv", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es/cv",
      );
    });

    it("should redirect English browsers from /cv to /en/cv", () => {
      const req = createMockRequest("/cv", "en-US,en;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en/cv",
      );
    });

    it("should redirect Spanish browsers from /about to /es/about", () => {
      const req = createMockRequest("/about", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es/about",
      );
    });

    it("should redirect from nested paths without locale", () => {
      const req = createMockRequest("/privacy-policy", "es-ES,es;q=0.9");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es/privacy-policy",
      );
    });

    it("should redirect browsers without accept-language header to /en for non-root paths", () => {
      const req = createMockRequest("/tech-stack");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en/tech-stack",
      );
    });
  });

  describe("Edge cases", () => {
    it("should redirect malformed accept-language headers to /en", () => {
      const req = createMockRequest("/", "invalid-header");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should handle accept-language with only language code", () => {
      const req = createMockRequest("/", "es");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });

    it("should redirect to /en when English is first in quality values", () => {
      const req = createMockRequest("/", "en-US;q=0.9,es;q=0.8,fr;q=0.7");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should handle Latin American Spanish locale codes", () => {
      const req = createMockRequest("/", "es-419,es;q=0.9"); // Latin American Spanish
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });
  });

  describe("Security - attack vector blocking", () => {
    it("should block WordPress login attempts with 404", () => {
      const req = createMockRequest("/wp-login.php");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block WordPress admin panel access with 404", () => {
      const req = createMockRequest("/wp-admin/index.php");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block .env file access attempts with 404", () => {
      const req = createMockRequest("/.env");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block .git directory access with 404", () => {
      const req = createMockRequest("/.git/config");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block phpMyAdmin access attempts with 404", () => {
      const req = createMockRequest("/phpmyadmin/index.php");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block xmlrpc.php access attempts with 404", () => {
      const req = createMockRequest("/xmlrpc.php");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block generic admin panel access attempts with 404", () => {
      const req = createMockRequest("/admin/login");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it("should block Joomla administrator access with 404", () => {
      const req = createMockRequest("/administrator/index.php");
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });

    it.each([
      "/random.php",
      "/index.aspx",
      "/site.asp",
      "/legacy.jsp",
      "/scan.cgi",
      "/.env.local",
      "/db.sql",
      "/dump.bak",
      "/copy.backup",
      "/old.old",
      "/file.orig",
      "/.config.swp",
      "/conf.yaml",
      "/conf.yml",
      "/app.ini",
      "/site.conf",
      "/script.sh",
      "/debug.log",
      "/data.db",
      "/store.sqlite",
    ])("should block probe-style extension path %s with 404", (probePath) => {
      const req = createMockRequest(probePath);
      const response = proxy(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(404);
    });
  });

  describe("Matcher", () => {
    // Next compiles the matcher source into an anchored regex; mirror that.
    // eslint-disable-next-line security/detect-non-literal-regexp -- static source from proxy config
    const matcher = new RegExp(`^${config.matcher[0]}$`);

    it.each(["/monitoring", "/monitoring/"])(
      "skips the Sentry tunnel route %s so it is not locale-redirected",
      (pathname) => {
        expect(matcher.test(pathname)).toBe(false);
      },
    );

    it.each(["/", "/cv", "/en", "/en/monitoring-notes", "/wp-login.php"])(
      "still runs on %s",
      (pathname) => {
        expect(matcher.test(pathname)).toBe(true);
      },
    );
  });
});
