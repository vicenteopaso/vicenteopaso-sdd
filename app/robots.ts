import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo";

// Same rules the static public/robots.txt had. /api/* stays crawlable on
// purpose: /llms.txt advertises the content and profile APIs to agents.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/wp-admin/",
        "/wp-login.php",
        "/xmlrpc.php",
        "/admin/",
        "/.env",
        "/.git/",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
