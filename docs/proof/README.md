# Proof index

Generated: **2026-10-19T07:01:01.205Z** (UTC)

Reproduce: `npm run proof` (runs build, tests, audits, Lighthouse, screenshots).

| Check | Tool (version) | Pass |
|---|---|---|
| Vitest | vitest vitest/5.0.5 linux-x64 node-v22.14.0 | PASS |
| SEO audit | scripts/audit/* | PASS |
| Bundle ≤50KB gzip | bundle-audit logic | PASS |
| Sitemap/robots | postbuild dist | PASS |
| JSON-LD validation | cheerio extract | PASS |
| Lighthouse budgets | lighthouse 12.6.1 | PASS |
| Mobile viewport | playwright Version 1.64.1 | PASS |
| AdSense evidence | adsense-readiness.md | PASS |

## Artifacts
- [lighthouse/summary.md](./lighthouse/summary.md) + `.report.json` / `.report.html` per run
- [structured-data/](./structured-data/) — extracted JSON-LD + validation (re-test live URLs in Google Rich Results Test after deploy)
- [seo-audit.txt](./seo-audit.txt)
- [sitemap-robots.txt](./sitemap-robots.txt)
- [mobile/](./mobile/) — 360px & 768px screenshots + viewport-check.txt
- [adsense-readiness.md](./adsense-readiness.md)
- [tests.txt](./tests.txt)
- [bundle-size.txt](./bundle-size.txt)

**Overall:** PASS