# Lighthouse CI Integration Options

## Current Setup

The project currently uses:

- **GitHub Actions** workflow (`lighthouse-ci.yml`) to run Lighthouse audits on PRs
- **Temporary public storage** for detailed HTML reports (via `temporaryPublicStorage: true`)
- **GitHub Actions artifacts** for raw JSON results (artifact name: `lighthouse-results`)
- **PR comments** with compact score summaries

## Alternative Integration Options

### 1. Vercel Speed Insights (Recommended)

**What it provides:**

- Real User Monitoring (RUM) - actual user experience data, not synthetic
- Core Web Vitals tracking (LCP, FID, CLS)
- Performance analytics over time
- Free tier available

**Setup:**
Already installed in `package.json` as `@vercel/speed-insights`. Just needs configuration:

```typescript
// app/layout.tsx (already present)
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**View reports:** Vercel Dashboard → Project → Speed Insights tab

**Pros:**

- Real user data (better than synthetic tests)
- No CI setup needed
- Integrated with Vercel deployments
- Free tier sufficient for this project

**Cons:**

- Only tracks production traffic
- Doesn't replace PR-level Lighthouse audits

### 2. Sentry Performance Monitoring

**What it provides:**

- Performance transaction tracking
- Web Vitals monitoring
- Frontend performance insights
- Error + Performance correlation

**Setup:**
Already installed via `@sentry/nextjs`. Add to `sentry.client.config.ts`:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust based on traffic
  integrations: [Sentry.browserTracingIntegration()],
  // Enable performance monitoring
  enableTracing: true,
  // Track Web Vitals
  beforeSend(event) {
    // Enrich events with web vitals data
    return event;
  },
});
```

Session Replay is deliberately not bundled: `instrumentation-client.ts` loads it from the Sentry CDN with `Sentry.lazyLoadIntegration("replayIntegration")` on the visitor's first interaction, keeping rrweb off the initial-load path.

**View reports:** Sentry Dashboard → Performance tab

**Pros:**

- Already using Sentry for error tracking
- Correlates errors with performance issues
- Powerful filtering and aggregation

**Cons:**

- Costs scale with traffic (free tier: 10k events/month)
- Doesn't replace PR-level audits

### 3. Official Lighthouse CI Server (Self-hosted)

**What it provides:**

- Historical Lighthouse score tracking
- Comparison between builds
- Custom dashboards
- PR status checks

**Setup:**
Requires deploying LHCI server (Docker recommended):

```yaml
# docker-compose.yml
services:
  lhci-server:
    image: patrickhulce/lhci-server
    ports:
      - "9001:9001"
    environment:
      LHCI_GITHUB_APP_TOKEN: ${LHCI_GITHUB_APP_TOKEN}
```

Then update `lighthouserc.js`:

```javascript
upload: {
  target: 'lhci',
  serverBaseUrl: 'https://your-lhci-server.com',
  token: process.env.LHCI_TOKEN,
}
```

**Pros:**

- Full control over data
- Historical trend analysis
- PR blocking on regressions

**Cons:**

- Requires hosting infrastructure
- Maintenance overhead
- Overkill for small projects

### 4. Google Cloud Storage + BigQuery (Advanced)

**What it provides:**

- Long-term storage of Lighthouse JSON
- SQL queries for trend analysis
- Custom dashboarding (Looker Studio)

**Setup:**
Export Lighthouse results to GCS bucket, then load into BigQuery for analysis.

**Pros:**

- Unlimited historical data
- Powerful querying capabilities
- Can correlate with other metrics

**Cons:**

- Complex setup
- Requires GCP account
- Not cost-effective for small projects

## Recommendation

**For this project:**

1. **Keep current GitHub Actions setup** for PR-level audits (prevents regressions)
2. **Enable Vercel Speed Insights** for real user performance data (already installed)
3. **Configure Sentry Performance Monitoring** to correlate performance with errors (already have Sentry)

**Why this combination:**

- ✅ PR-level synthetic testing (Lighthouse CI)
- ✅ Real user monitoring (Vercel Speed Insights)
- ✅ Error correlation (Sentry Performance)
- ✅ Minimal cost (all free tiers)
- ✅ No additional infrastructure

## Current Lighthouse Reports Access

**Temporary public reports:**

- Available in PR comments as inline links
- Expire after ~7 days
- Example: `https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/[id].report.html`

**GitHub Actions artifacts:**

- Artifact name: `lighthouse-results`
- Available from PR checks tab → Lighthouse CI workflow → Artifacts
- Retention: 90 days (GitHub default)
- Contains: JSON results + HTML reports

## Future Enhancements

If the project scales:

1. Consider self-hosted LHCI server for historical tracking
2. Implement budget alerts via GitHub status checks
3. Add custom performance budgets per route
4. Integrate with monitoring alerts (e.g., PagerDuty)
