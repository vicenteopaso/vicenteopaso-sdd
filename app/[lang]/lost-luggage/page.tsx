import type { Route } from "next";
import { redirect } from "next/navigation";

import { getLocaleFromParams } from "@/lib/i18n";

// /lost-luggage was the original path for the unlisted luggage-tag page,
// renamed to /found-luggage since the page is addressed to whoever *found*
// the bag, not whoever lost it. Kept as a permanent redirect so tags already
// printed with the old URL (and the old QR code) keep working.
export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function LostLuggageRedirectPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  redirect(`/${locale}/found-luggage` as Route);
}
