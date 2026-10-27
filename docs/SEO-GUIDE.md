# SEO & launch guide

**Governing docs:** [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md) (full playbook), [SEO-GUARDRAILS.md](./SEO-GUARDRAILS.md) (hard indexing rules + CI), [KEYWORD-MAP.md](./KEYWORD-MAP.md) (page intents), [MARKET-RESEARCH.md](./MARKET-RESEARCH.md).

## Pre-launch checklist

- [ ] `PUBLIC_SITE_URL` set; canonical host (apex vs www) chosen and redirected
- [ ] Unique title (25–65 chars) and meta description (70–160) per page; og/twitter match
- [ ] One H1 per page; tool above the fold
- [ ] `robots.txt`, `sitemap-index.xml`, self-referencing canonicals
- [ ] JSON-LD: `WebSite`, `Organization` (home), `BreadcrumbList` + `WebApplication` (tools), `Article` (guides)
- [ ] About, Contact, Privacy (AdSense cookie text), Terms, Methodology, Authors
- [ ] `npm run build && npm run audit && npm run lighthouse` pass
- [ ] `llms.txt` lists every tool and every guide (URL + summary); regenerated in postbuild

## Google Search Console

1. Add a **Domain** property for your root domain.
2. Verify via DNS TXT (recommended) or HTML tag (`PUBLIC_GSC_VERIFICATION`).
3. Submit **Sitemap:** `https://yourdomain.com/sitemap-index.xml`
4. Use **URL Inspection** → Request indexing for home, hubs, and top 5 tools after launch.
5. Monitor **Page indexing**, **Core Web Vitals**, and (when available) **Generative AI** performance.

## Bing & IndexNow

1. Import from GSC in **Bing Webmaster Tools**.
2. Place IndexNow key file at `https://yourdomain.com/<key>.txt` (committed as `public/<key>.txt` at site root; see `.env.example`).
3. After each production deploy, ping IndexNow (Bing/Yandex — not Google):

```bash
npx wrangler deploy && node scripts/indexnow.mjs
# or: npm run deploy:indexnow
```

## GA4

Set `PUBLIC_GA4_MEASUREMENT_ID` at build time; `CookieNotice.astro` loads the standard gtag.js snippet only after the visitor Accepts the cookie banner (see [DEPLOYMENT.md](./DEPLOYMENT.md) §9).

## Keyword workflow (free tools)

1. Seeds from [KEYWORD-MAP.md](./KEYWORD-MAP.md) and Google Autocomplete (`suggestqueries.google.com`).
2. Validate KD/volume manually in Ahrefs free / Keyword Planner (see playbook).
3. After launch, use GSC queries at positions 8–30 to expand FAQs — not new thin URLs.

## AI search (GEO)

- Allow `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot` (see `public/robots.txt`).
- Answer-first paragraphs, worked examples, cited sources — no fake FAQ rich results (removed May 2026).
- Google: optimizing for AI Overviews is still core SEO ([Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).

## 90-day plan (summary)

| Weeks | Focus |
|---|---|
| 1–2 | Launch, indexing, fix CWV regressions |
| 3–4 | Guides refresh, internal links from GSC queries |
| 5–6 | AdSense application if traffic + depth criteria met |
| 7–12 | Links (embeds, resource pages), prune thin pages, update fee/format data |

## Content calendar (next 20 articles — backlog)

1. JSON vs TOML for configs  
2. When to use CSV vs JSON in APIs  
3. HEIC on Windows/Android workflows  
4. PSD layer flattening explained  
5. SVG optimization before PNG export  
6. STL repair vs convert to OBJ  
7. Bank CSV import into QuickBooks (limits)  
8. Kubernetes yaml to json workflow  
9. CI secrets in yaml files (privacy)  
10. Comparing client-side vs upload converters  
11. 3D printing cost calculator (idea backlog)  
12. G-code simulation tools  
13. pdf.js text extraction deep dive  
14. WebP adoption for CMS uploads  
15. Markdown sanitization checklist  
16. XML attributes in JSON bridges  
17. Excel CSV delimiter pitfalls  
18. Mobile photo formats (HEIC/AVIF)  
19. Embeddable converter widgets for docs  
20. Accessibility of file upload UIs  

## Link building

- Embeddable tools with credit link (`/embed/*`)
- Niche directories, Show HN / Product Hunt, resource-page outreach (see playbook)
