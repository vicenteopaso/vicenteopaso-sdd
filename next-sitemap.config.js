/* eslint-disable */
const fs = require("fs");
const path = require("path");

function readSiteUrl() {
  try {
    const seoPath = path.resolve(__dirname, "lib", "seo.ts");
    const content = fs.readFileSync(seoPath, "utf8");
    const m = content.match(/url:\s*['"`]([^'"`]+)['"`]/);
    if (m && m[1]) return m[1];
  } catch (_) {
    // ignore and fallback
  }
  return process.env.SITE_URL || "http://localhost:3000";
}

const siteUrl = readSiteUrl();

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: false,
  sitemapSize: 5000,
  changefreq: "monthly",
  exclude: [
    "/opengraph-image",
    "/*/opengraph-image",
    "/twitter-image",
    "/*/twitter-image",
    "/icon",
    "/*/icon",
    "/apple-icon",
    "/*/apple-icon",
    // Lost-luggage QR code page: publicly reachable by direct link only,
    // intentionally not advertised via nav/footer or search indexing.
    "/lost-luggage",
    "/*/lost-luggage",
  ],
};
