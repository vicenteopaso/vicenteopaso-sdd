import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

import { ContentPageShell } from "@/app/components/ContentPageShell";
import { loadContentPage } from "@/lib/content";
import { getLocaleFromParams } from "@/lib/i18n";

import { markdownComponents } from "../../../../lib/markdown-components";
import { baseMetadata } from "../../../../lib/seo";

// Unlisted page: reachable by direct link only, not linked from any nav or
// footer, and excluded from the sitemap (see next-sitemap.config.js).
export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return baseMetadata({
    title: "Inside an 8-Agent System Running My Job Search",
    description:
      "A multi-agent system running on my own VPS that operates my job search — daily scanning, email triage, LinkedIn monitoring, research, and weekly strategic review.",
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: "Inside an 8-Agent System Running My Job Search",
      description:
        "A multi-agent system running on my own VPS that operates my job search — daily scanning, email triage, LinkedIn monitoring, research, and weekly strategic review.",
    },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AgentJobSearchArticlePage({
  params,
}: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const { data, content } = loadContentPage(locale, "8-agent-job-search-system");

  return (
    <ContentPageShell>
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
