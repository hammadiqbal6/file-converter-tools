# SEO guardrails (file-converter-tools)

Hard requirements so builds never ship the indexing bugs that left this site at PR #4 while siblings moved on. Enforced by `npm run audit` (`scripts/audit/seo-guardrails.mjs`) after `npm run build`.

**Canonical origin:** `https://file-converter-tools.hammadiqbal117.workers.dev`  
**Governing docs:** [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md), [SEO-GUIDE.md](./SEO-GUIDE.md), [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Issues fixed (this parity pass)

| Bug | Cause | Fix |
|---|---|---|
| GSC 0 pages / sitemap on `example.com` | `site.ts` + `astro.config` fell back to `https://example.com` when `PUBLIC_SITE_URL` unset; Astro `site` baked that into `@astrojs/sitemap` | Default to live workers.dev; `astro.config.mjs` reads `process.env.PUBLIC_SITE_URL \|\| DEFAULT_SITE_URL` |
| `og:image` → `…/og-default.png/` 404 | `absoluteUrl()` always appended `/` | Preserve path as-given; never force trailing slash on file assets |
| `/sitemap.xml` 404 | No alias to Astro’s `sitemap-index.xml` | `public/_redirects` (+ Vercel/Netlify) 301 → `/sitemap-index.xml` |
| IndexNow placeholder `000…0` | Dummy key under `public/indexnow/` | Real 32-hex key at `public/<key>.txt` + `scripts/indexnow.mjs` |
| Trailing-slash mismatch | Missing Workers `html_handling` | `wrangler.jsonc` → `"html_handling": "force-trailing-slash"` |
| PR Workers Builds fail on `wrangler preview` | Top-level `vars` without `previews`, then missing `previews` block entirely | Assets-only: **no** runtime `vars` for `PUBLIC_*`; require empty `"previews": {}` for preview deploys |

---

## Do / don’t checklist

### Do

- [ ] Keep `DEFAULT_SITE_URL` in `src/config/site.ts` equal to the live workers.dev origin (never `example.com`).
- [ ] Set `site:` in `astro.config.mjs` from `process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL`.
- [ ] Pass page paths to `absoluteUrl()` **with** trailing slash; pass asset paths **without**.
- [ ] Keep `public/_redirects` line: `/sitemap.xml /sitemap-index.xml 301`.
- [ ] Keep IndexNow key file at **site root** `public/<32-hex>.txt` matching `DEFAULT_INDEXNOW_KEY` / env.
- [ ] Keep `assets.html_handling: "force-trailing-slash"` and `"previews": {}` in `wrangler.jsonc`.
- [ ] Put `PUBLIC_*` in Cloudflare Workers Builds **dashboard** env (build-time), not wrangler `vars`.
- [ ] Production deploy: `npx wrangler deploy && node scripts/indexnow.mjs` (ping only after the key file is live).
- [ ] Run `npm run build && npm run audit` before merge; CI must stay green.

### Don’t

- [ ] Don’t use `https://example.com` (or other placeholders) as a site URL fallback.
- [ ] Don’t append trailing slashes to file URLs (`og:image`, favicons, IndexNow `.txt`).
- [ ] Don’t put IndexNow keys under `public/indexnow/` only — IndexNow expects `https://host/<key>.txt`.
- [ ] Don’t commit `00000000000000000000000000000000.txt` as the live key.
- [ ] Don’t add wrangler top-level `vars` for `PUBLIC_*` on this assets-only Worker (preview builds need `previews.vars` and still won’t bake Astro HTML).
- [ ] Don’t remove `"previews": {}` — Workers Builds PR command is `npx wrangler preview` and requires it.
- [ ] Don’t noindex production HTML via a host-wide `_headers` rule that matches `*.workers.dev`.
- [ ] Don’t change routes / custom domain in SEO parity PRs unless explicitly asked.

---

## CI / audit enforcement

| Check | Where |
|---|---|
| No `example.com` in dist sitemaps, robots, llms, canonicals, `og:url` | `scripts/audit/seo-guardrails.mjs` |
| No `og:image` URL ending in `/` | same |
| No placeholder IndexNow key; real `public/<key>.txt` present in dist | same |
| `/sitemap.xml` → `/sitemap-index.xml` in `dist/_redirects` | same |
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
| Non-production (this Worker) | `npm run build` then `npx wrangler preview` — requires `"previews": {}` |

Siblings that still use the older preview model may run `npx wrangler versions upload` instead. Local dry-runs:

```bash
npx wrangler deploy --dry-run
npx wrangler versions upload --dry-run
```
