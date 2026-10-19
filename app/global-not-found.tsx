import "../styles/globals.css";

import type { Metadata, Route } from "next";
import Link from "next/link";

// Fallback 404 for URLs that match no route at all. The app has no single
// root layout (each locale renders its own <html lang> in app/[lang]/layout),
// so Next.js needs this standalone page (experimental.globalNotFound). In
// practice proxy.ts redirects non-locale paths into /{locale}/..., where the
// localized app/[lang]/not-found.tsx renders instead.
export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{ background: "var(--v3-bg)", color: "var(--v3-fg)" }}
      >
        <main id="main-content" className="flex-1 w-full flex flex-col">
          <section className="v3-not-found">
            <h1 className="v3-not-found-code">404</h1>
            <p className="v3-not-found-text">Page not found.</p>
            <Link href={"/en" as Route} className="v3-not-found-link">
              Go home
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
