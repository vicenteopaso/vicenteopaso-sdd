#!/usr/bin/env node

/**
 * Lighthouse CI local execution guide
 *
 * Lighthouse CI is designed to run in GitHub Actions CI environment.
 * For local performance testing, use browser DevTools which provides
 * a more comprehensive and reliable experience.
 */

console.log(`
⚠️  Lighthouse CI is designed for GitHub Actions CI environment.

For local testing:
  1. Run: pnpm dev
  2. Open: http://localhost:3000
  3. Use browser DevTools → Lighthouse tab
     (Press F12 → Lighthouse → Analyze page load)

CI reports available at:
  https://github.com/vicenteopaso/vicenteopaso-sdd/actions/workflows/lighthouse-ci.yml

Note: Browser DevTools Lighthouse provides the same metrics as CI and
      supports additional features like device emulation and throttling.
`);

process.exit(0);
