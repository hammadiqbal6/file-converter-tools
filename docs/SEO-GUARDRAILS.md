# SEO guardrails (file-converter-tools)

Hard requirements so builds never ship indexing bugs. Enforced by `npm run audit` (`scripts/audit/seo-guardrails.mjs`) after `npm run build`.

**Canonical origin (single setting):** `PUBLIC_SITE_URL` or fallback `DEFAULT_SITE_URL` in `src/config/site.ts` (currently the live workers.dev URL). Do not hardcode hosts elsewhere — see [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md).

**Governing docs:** [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md), [SEO-GUIDE.md](./SEO-GUIDE.md), [DEPLOYMENT.md](./DEPLOYMENT.md), [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md)

---

## Issues fixed (parity + AEO remediation)

| Bug | Cause | Fix |
|---|---|---|
| GSC 0 pages / sitemap on `example.com` | fallback `example.com` | Default to live workers.dev; `astro.config` reads `PUBLIC_SITE_URL \|\| DEFAULT_SITE_URL` |
| `og:image` → `…/og-default.png/` 404 | `absoluteUrl()` appended `/` | Preserve path as-given |
| `/sitemap.xml` 404 | No alias | `public/_redirects` 301 → `/sitemap-index.xml` |
| IndexNow placeholder | Dummy key | Real `public/<key>.txt` + `scripts/indexnow.mjs` |
| Trailing slash 307 | assets `html_handling` alone | `src/worker.ts` 308 + `run_worker_first` (FILE_EXT `{1,16}`) |
| PR `wrangler preview` fails | top-level `vars` / missing `previews` | Assets + worker: **no** top-level `PUBLIC_*` vars; require `"previews": {}` |
| `/_astro/*` max-age=0 | missing header | `public/_headers` immutable for `/_astro/*` |
| Thin E-E-A-T | no Person/FAQ/byline | Visible Hammad byline, Person `@id` `github.com/hammadiqbal6#person`, FAQPage, dateModified |
| Tool→guide gaps | only privacy guide | Topical `relatedGuides` + Learn more blocks |
| Thin guides | &lt;500 words | ~1000+ words, FAQPage, tables, worked examples |
| Hardcoded workers.dev | scattered URLs | Single origin setting + CI fail on stray `workers.dev` |
| `/terms/` meta too short | thin description | ~120–160 char description (og/twitter same) |
| `llms.txt` Guides only `/guides/` | postbuild regex missed `guide-articles/*` | Regenerate from article sources with URL + summary; CI fails if a guide is missing |

---

## Do / don’t checklist

### Do

- [ ] Keep `DEFAULT_SITE_URL` as the only code default origin; override with `PUBLIC_SITE_URL` for custom domains.
- [ ] Set `site:` in `astro.config.mjs` from `process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL`.
- [ ] Pass page paths to `absoluteUrl()` **with** trailing slash; pass asset paths **without**.
- [ ] Keep `public/_redirects`: `/sitemap.xml /sitemap-index.xml 301`.
- [ ] Keep IndexNow key at **site root** `public/<32-hex>.txt`.
- [ ] Keep worker `main` + `run_worker_first` + `html_handling: force-trailing-slash` + `"previews": {}`.
- [ ] Put `PUBLIC_*` in Workers Builds **dashboard** env, not wrangler `vars`.
- [ ] Titles **25–65** characters (final `<title>`); meta descriptions **70–160** (keep `og:description` / `twitter:description` identical).
- [ ] `dist/llms.txt` lists every `/guides/<slug>/` page with a **full absolute URL** and a one-line summary (generated from `src/data/guide-articles/` in `scripts/postbuild.mjs`).
- [ ] Tool pages: 1 H1, answer-first intro (not tagline-first), Hammad byline, FAQPage 3–6 Qs, ≥1 topical guide link.
- [ ] Guides: ≥800 words (target ~1000+), FAQPage, author/dateModified, topical tool links only.
- [ ] `/_astro/*` immutable cache; image/favicon caching in `public/_headers`.
- [ ] Run `npm run build && npm run audit` before merge.

### Don’t

- [ ] Don’t hardcode `*.workers.dev` (or the future custom domain) outside the allowlist — use the single origin setting.
- [ ] Don’t use `https://example.com` as a site URL fallback.
- [ ] Don’t append trailing slashes to file URLs (`og:image`, favicons, IndexNow `.txt`).
- [ ] Don’t add wrangler top-level `vars` for `PUBLIC_*` without `previews.vars`.
- [ ] Don’t remove `"previews": {}`.
- [ ] Don’t noindex production HTML via a host-wide `_headers` rule for `*.workers.dev`.
- [ ] Don’t change custom domain / routes unless explicitly cutting over ([CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md)).

---

## CI / audit enforcement

| Check | Where |
|---|---|
| No `example.com` in dist SEO surfaces | `seo-guardrails.mjs` |
| No stray `workers.dev` in repo (allowlist) | same |
| No `og:image` ending in `/` | same |
| Titles **25–65**; meta descriptions **70–160**; og/twitter description match; canonical; H1 = 1 | same |
| Every guide page URL + summary present in `llms.txt` | same |
| Tool pages: guide link, FAQPage, Person/Hammad byline | same |
| Guides ≥800 words + FAQPage | same |
| Pages present in sitemap | same |
| Invalid JSON-LD / inline `import` without `type=module` | same |
| `/_astro/*` immutable header; worker 308 + FILE_EXT | same |
| IndexNow key; sitemap alias; wrangler previews | same |
| Unit: `absoluteUrl` + default site URL | `tests/site-config.test.ts` |

```bash
npm run build && npm run audit
npm test
```

---

## Workers Builds notes

| Branch | Typical command |
|---|---|
| Production (`main`) | `npm run build` then `npx wrangler deploy` (optionally `&& node scripts/indexnow.mjs`) |
| Non-production | `npm run build` then `npx wrangler preview` — requires `"previews": {}` |

Custom domain cutover steps: [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md).
