# Custom domain cutover

Do **not** change the live domain in a normal content/SEO PR. Keep shipping against the current workers.dev origin until you are ready to cut over.

**Single setting for the canonical origin:**

| Source | Role |
|---|---|
| `PUBLIC_SITE_URL` (Cloudflare Workers Builds → Variables, and CI) | Build-time origin baked into HTML, sitemap, robots, llms, JSON-LD, OG, IndexNow |
| `DEFAULT_SITE_URL` in `src/config/site.ts` | Fallback when the env var is unset (today: the live `*.workers.dev` URL) |
| `astro.config.mjs` `site:` | Reads `process.env.PUBLIC_SITE_URL \|\| DEFAULT_SITE_URL` |

Every absolute URL (canonicals, `og:url` / `og:image`, JSON-LD, sitemap locs, `robots.txt` Sitemap line, `llms.txt`, IndexNow host) must go through that origin — via `absoluteUrl()` / Astro `site` / `scripts/postbuild.mjs`. Do not hardcode `*.workers.dev` (or the future custom domain) in page copy, components, or `public/` files.

`npm run audit` fails if `workers.dev` appears outside the allowlist (the default in `site.ts`, tests, cutover docs, CI env, and proof snapshots).

---

## Cutover checklist (when you are ready)

1. **Choose the custom domain** (e.g. `https://www.example.com`) — HTTPS, no trailing slash in the env value.
2. **Cloudflare Workers → your Worker → Settings → Domains & Routes**  
   - Add the custom domain (or a route on a zone you control).  
   - Leave the `*.workers.dev` URL working until redirects and Search Console are done.
3. **Workers Builds → Variables**  
   - Set `PUBLIC_SITE_URL=https://www.example.com` (production).  
   - Do **not** put `PUBLIC_*` in top-level wrangler `vars` — that breaks `npx wrangler preview` unless you also mirror `previews.vars`. Prefer dashboard build env only; keep `"previews": {}` in `wrangler.jsonc`.
4. **Redeploy** so Astro rebuilds HTML/sitemap with the new origin:  
   `npm run build` then `npx wrangler deploy && node scripts/indexnow.mjs`
5. **301 from workers.dev → custom domain**  
   - Prefer a Worker/`_redirects` (or zone Redirect Rule) so `https://file-converter-tools.hammadiqbal117.workers.dev/*` permanently redirects to the same path on the custom domain.  
   - Keep trailing-slash behavior consistent (`html_handling` + `src/worker.ts` 308 for slash consolidation on the custom host).
6. **Google Search Console**  
   - Add a new URL-prefix (or domain) property for the custom host.  
   - Verify (HTML tag already supported via `PUBLIC_GSC_VERIFICATION` / default meta, or DNS for domain properties).  
   - Submit `https://www.example.com/sitemap-index.xml` (and `/sitemap.xml` alias).  
   - Use Change of Address if both properties are in the same Search Console account and Google still offers it for your case; otherwise rely on 301s + sitemap.
7. **IndexNow** — ping again after the key file is live on the custom host (`public/<key>.txt`).
8. **Optional:** update `DEFAULT_SITE_URL` in `src/config/site.ts` to the custom origin so local builds without env still match production; re-run `npm test` / `npm run audit`.
9. **Sister-site / docs links** — update any external bookmarks; in-repo absolute URLs should already follow `PUBLIC_SITE_URL`.

---

## Preview / PR builds

- Non-production Workers Builds command: `npx wrangler preview` → requires empty `"previews": {}` in `wrangler.jsonc`.
- Preview URLs are temporary; they do not need the custom domain. Production canonicals still come from the production `PUBLIC_SITE_URL` at build time.
