import type { Route } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <section className="v3-not-found">
      <h1 className="v3-not-found-code">404</h1>
      <p className="v3-not-found-text">Page not found.</p>
      <Link href={"/" as Route} className="v3-not-found-link">
        Go home
      </Link>
    </section>
  );
}
