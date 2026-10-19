import { notFound } from "next/navigation";

// Any unmatched path under a valid locale renders the localized
// app/[lang]/not-found.tsx inside the site chrome, with the correct
// <html lang>. (Unknown locales never reach here: proxy.ts redirects
// non-locale paths to /{locale}/..., and app/global-not-found.tsx covers the
// rest.)
export default function CatchAllNotFound(): never {
  notFound();
}
