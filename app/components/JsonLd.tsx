import { serializeJsonLd } from "@/lib/seo";

/**
 * Server-rendered JSON-LD. Emitting it in the initial HTML (rather than via a
 * client-side <Script>) means crawlers that don't execute JavaScript still
 * see the structured data.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // serializeJsonLd escapes "<", so the payload can't break out of the tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
