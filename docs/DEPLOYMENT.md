# Deployment guide

Primary target: **Cloudflare Pages**. Alternatives: Vercel, Netlify.

## Prerequisites

- Node.js **22.22+** (see `.nvmrc`)
- Fill `src/config/site.ts` or environment variables (below)
- `npm ci && npm run build` succeeds locally

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PUBLIC_SITE_URL` | Yes at launch | Canonical origin, e.g. `https://yourdomain.com` (no trailing slash). Used in sitemap, canonicals, postbuild robots/llms patch. |
| `PUBLIC_ADSENSE_PUBLISHER_ID` | No | e.g. `ca-pub-XXXXXXXX`. Leave empty to keep ads disabled. |
| `PUBLIC_GA4_MEASUREMENT_ID` | No | GA4 measurement ID. |
| `PUBLIC_GSC_VERIFICATION` | No | Google Search Console HTML tag `content` value. |
| `PUBLIC_BING_VERIFICATION` | No | Bing Webmaster meta verification. |
| `PUBLIC_INDEXNOW_KEY` | No | IndexNow key; host `public/indexnow/<key>.txt` with the same key. |

## Cloudflare Pages

1. Connect the GitHub repo; branch `main` (or PR preview branches).
2. **Build command:** `npm run build`
3. **Build output directory:** `dist`
4. **Node version:** 22.22 in Environment variables or use `NODE_VERSION=22.22.0`
5. Add env vars above in **Settings → Environment variables**.
6. **Custom domain:** add apex + `www`; set **one canonical host** (recommend apex). Redirect `www` → apex (or vice versa) in Cloudflare **Redirect Rules**.
7. **HTTPS:** Full (strict). Enable **Always Use HTTPS**.
8. Upload security headers: `public/_headers` is copied to `dist/_headers` automatically.
9. After deploy, verify `https://yourdomain.com/robots.txt` and `https://yourdomain.com/sitemap-index.xml`.

## Vercel

1. Import repo; framework preset **Astro**.
2. Build: `npm run build`, output `dist`.
3. Set env vars; edit `vercel.json` redirect host from `www.example.com` to your domain.
4. Deploy.

## Netlify

1. `netlify.toml` is included (`npm run build`, publish `dist`).
2. Set env vars in Netlify UI.
3. Configure domain redirects (apex/www) in **Domain management**.

## Post-deploy checklist

- [ ] `PUBLIC_SITE_URL` matches live canonical host
- [ ] Update `public/ads.txt` with real publisher line after AdSense approval
- [ ] Replace placeholder contact email in `site.ts`
- [ ] Submit sitemap in Google Search Console (see [SEO-GUIDE.md](./SEO-GUIDE.md))
- [ ] Bing Webmaster + IndexNow key file reachable at `/<key>.txt`
- [ ] Run `npm run audit` against a local `dist` built with production env

## IndexNow

1. Set `PUBLIC_INDEXNOW_KEY` and ensure `public/indexnow/<key>.txt` contains the key.
2. On content updates, POST changed URLs to IndexNow API (see [SEO-GUIDE.md](./SEO-GUIDE.md)). Google does not use IndexNow.
