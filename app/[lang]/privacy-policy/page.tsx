import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

import { ContentPageShell } from "@/app/components/ContentPageShell";
import { loadContentPage } from "@/lib/content";
import { contentPageMetadata } from "@/lib/content-metadata";
import { getLocaleFromParams } from "@/lib/i18n";

import { markdownComponents } from "../../../lib/markdown-components";

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
  return contentPageMetadata(getLocaleFromParams({ lang }), "privacy-policy");
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const { data, content } = loadContentPage(locale, "privacy-policy");

  return (
    <ContentPageShell>
      <article className="section-card space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] sm:text-3xl">
            {data.title}
          </h1>
        </header>
        <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </ContentPageShell>
  );
}
