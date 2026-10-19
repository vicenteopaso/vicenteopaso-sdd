import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

import { ContentPageShell } from "@/app/components/ContentPageShell";
import { JsonLd } from "@/app/components/JsonLd";
import { loadContentPage } from "@/lib/content";
import { contentPageMetadata } from "@/lib/content-metadata";
import { getLocaleFromParams } from "@/lib/i18n";
import { getArticleJsonLd } from "@/lib/seo";

import { markdownComponents } from "../../../../lib/markdown-components";

// Unlisted page: reachable by direct link only, not linked from any nav or
// footer, and excluded from the sitemap (see app/sitemap.ts).
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
  return contentPageMetadata(
    getLocaleFromParams({ lang }),
    "8-agent-job-search-system",
    {
      path: "/articles/8-agent-job-search-system",
      robots: { index: false, follow: true },
    },
  );
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AgentJobSearchArticlePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const { data, content } = loadContentPage(
    locale,
    "8-agent-job-search-system",
  );

  return (
    <ContentPageShell>
      <JsonLd
        data={getArticleJsonLd({
          locale,
          path: "/articles/8-agent-job-search-system",
          headline: data.title,
          description: data.description,
        })}
      />
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
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </ContentPageShell>
  );
}
