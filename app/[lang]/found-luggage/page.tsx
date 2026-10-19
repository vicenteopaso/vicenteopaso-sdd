import type { Metadata } from "next";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";

import { ContentPageShell } from "@/app/components/ContentPageShell";
import { FoundLuggageNotifier } from "@/app/components/FoundLuggageNotifier";
import { loadContentPage } from "@/lib/content";
import { contentPageMetadata } from "@/lib/content-metadata";
import { getLocaleFromParams } from "@/lib/i18n";

import { markdownComponents } from "../../../lib/markdown-components";

// Unlisted page: reachable only via the QR code on the luggage tag, not
// linked from any nav or footer, and excluded from the sitemap (see
// app/sitemap.ts). /lost-luggage redirects here — that was the
// original path, but the page is addressed to whoever *found* the bag.
export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return contentPageMetadata(getLocaleFromParams({ lang }), "found-luggage", {
    robots: { index: false, follow: false },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

// react-markdown's default URL sanitizer only allows http(s)/mailto/irc(s)/xmpp
// and strips everything else (including tel:), so the phone contact link
// needs an explicit allowance here.
function urlTransform(url: string): string {
  return url.startsWith("tel:") ? url : defaultUrlTransform(url);
}

export default async function FoundLuggagePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const { data, content } = loadContentPage(locale, "found-luggage");

  return (
    <ContentPageShell>
      <FoundLuggageNotifier locale={locale} />
      <article className="section-card space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] sm:text-3xl">
            {data.title}
          </h1>
          {data.description && (
            <p className="mt-2 text-base text-[color:var(--text-muted)]">
              {data.description}
            </p>
          )}
        </header>
        <div className="prose prose-sm max-w-none sm:prose-base">
          <ReactMarkdown
            components={markdownComponents}
            urlTransform={urlTransform}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </ContentPageShell>
  );
}
