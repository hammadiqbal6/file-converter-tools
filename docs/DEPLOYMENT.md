# Deployment guide (step-by-step)

This guide walks you from a local checkout to a live **LocalFile Convert** site on your own domain, with HTTPS, Search Console, optional AdSense/GA4, and a safe redeploy/rollback workflow.

**Stack:** static Astro build → `dist/` folder. No server runtime required. Production host is a Cloudflare Worker (`file-converter-tools`) serving static assets via `wrangler.jsonc` (Workers Builds: `npm run build` → `npx wrangler deploy`).

**Related docs:** [SEO-GUIDE.md](./SEO-GUIDE.md) (indexing), [ADSENSE.md](./ADSENSE.md) (ads), [docs/proof/README.md](./proof/README.md) (evidence bundle).

---

## 1. Prerequisites

### Accounts (free tiers are fine)

| Account | Why |
|---|---|
| **GitHub** | Source repo + CI (`.github/workflows/ci.yml`) |
| **Domain registrar** | Your brand domain (Namecheap, Cloudflare Registrar, Google Domains successor, etc.) |
| **Cloudflare** (recommended host) | Workers static assets + DNS + HTTPS |
| *or* Vercel / Netlify | Alternative static hosts |
| **Google Search Console** | Indexing & CWV reports |
| **Bing Webmaster Tools** | Bing + IndexNow |
| **Google AdSense** (later) | After ~20–30 quality pages + some traffic |
| **Google Analytics 4** (optional) | Usage measurement |

### Machine setup

1. Install **Node.js 22.22+** (see `.nvmrc`):

```bash
nvm install 22.22.0
nvm use
node -v   # v22.22.x
```

2. Clone and install:

```bash
git clone https://github.com/YOUR_ORG/file-converter-tools.git
cd file-converter-tools
npm ci
```

3. Verify locally **before** you deploy:

```bash
npm run dev          # http://localhost:4321 — click through tools
npm test             # converter unit tests
npm run build        # writes dist/
npm run preview      # optional: serve dist/
npm run audit        # SEO + AdSense + bundle + links (needs dist/)
npm run proof        # full evidence → docs/proof/ (build + tests + Lighthouse + screenshots)
```

`npm run proof` is the “release gate”: it regenerates committed proof artifacts. CI runs the same on pull requests.

---

## 2. Configure the site (one place + env)

### 2.1 `src/config/site.ts`

Edit defaults **or** override at build time with env vars (recommended for production).

| Field | Env override | What to set |
|---|---|---|
| `name`, `tagline`, `organizationName` | — | Your brand strings |
| `url` | `PUBLIC_SITE_URL` | `https://yourdomain.com` (no trailing slash) |
| `contactEmail` | — | Real support email |
| `adsensePublisherId` | `PUBLIC_ADSENSE_PUBLISHER_ID` | `ca-pub-XXXXXXXX` or leave empty |
| `adsenseAutoAds` | — | `true` only if you intentionally enable Auto ads |
| `ga4MeasurementId` | `PUBLIC_GA4_MEASUREMENT_ID` | `G-XXXXXXXX` or empty |
| `gscVerification` | `PUBLIC_GSC_VERIFICATION` | HTML tag verification string from GSC |
| `bingVerification` | `PUBLIC_BING_VERIFICATION` | Bing meta verification content |
| `indexNowKey` | `PUBLIC_INDEXNOW_KEY` | Random 32-char hex key |
| `defaultOgImage` | — | `/og-default.png` (replace image in `public/` if needed) |
| `lastUpdated` | — | Bump on meaningful content refreshes |

**Example production build:**

```bash
export PUBLIC_SITE_URL=https://yourdomain.com
export PUBLIC_GSC_VERIFICATION=your-gsc-token
npm run build
```

`scripts/postbuild.mjs` patches **`dist/robots.txt`** and **`dist/llms.txt`** to replace `https://example.com` with `PUBLIC_SITE_URL`.

### 2.2 Files with placeholders (commit updates before launch)

| File | Replace |
|---|---|
| `public/robots.txt` | `Sitemap: https://example.com/...` → your domain (postbuild also patches **dist**) |
| `public/llms.txt` | All `https://example.com` URLs → your domain |
| `public/ads.txt` | Uncomment/add `google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0` after AdSense approval |
| `public/indexnow/<KEY>.txt` | File content must equal `PUBLIC_INDEXNOW_KEY` (default folder uses `0000…` until you rotate) |
| `vercel.json` | Redirect host `www.example.com` → your domain if using Vercel |

### 2.3 Consent / CMP (EEA, UK, Switzerland)

The repo ships a **placeholder cookie notice** (`CookieNotice.astro`). Before enabling **personalized** AdSense in those regions you must integrate a **Google-certified CMP** (IAB TCF). See [ADSENSE.md](./ADSENSE.md) and Google’s [CMP requirement](https://support.google.com/adsense/answer/13554116).

---

## 3. Domain: DNS, www vs apex, HTTPS

### 3.1 Buy a domain

Choose a brandable name (not required to be exact-match for converters). Point DNS to your host.

### 3.2 Pick one canonical host

| Pattern | Example canonical | Typical redirect |
|---|---|---|
| Apex | `https://yourdomain.com` | `www` → apex |
| www | `https://www.yourdomain.com` | apex → www |

This repo assumes **apex** in docs; either works if redirects are consistent.

### 3.3 Cloudflare DNS (recommended with Pages)

1. Add site to Cloudflare → import DNS.
2. At registrar, set nameservers to Cloudflare.
3. In **DNS → Records**:
   - **Apex** `@` → Cloudflare Pages (auto when you attach custom domain) or CNAME flattening
   - **www** → CNAME to your `*.pages.dev` target (Pages wizard creates these)
4. **SSL/TLS → Overview:** **Full (strict)**
5. **SSL/TLS → Edge Certificates:** enable **Always Use HTTPS**
6. **Rules → Redirect Rules:**  
   - If host equals `www.yourdomain.com` → redirect to `https://yourdomain.com/$1` (301)

### 3.4 Verify HTTPS

```bash
curl -I https://yourdomain.com/
# expect 200, strict HTTPS, no mixed content
```

---

## 4. Deploy: Cloudflare Workers (primary)

Committed config: **`wrangler.jsonc`** — assets-only Worker named `file-converter-tools`, `assets.directory` = `./dist`, `not_found_handling` = `404-page`. No Astro Cloudflare adapter (static SSG does not need one).

### 4.1 Workers Builds (Git)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → Worker **`file-converter-tools`** (or Create → Workers).
2. Connect the Git repo; **production branch:** `main`.
3. Build settings:

| Setting | Value |
|---|---|
| Root directory | `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Local check: `npm run build && npx wrangler deploy --dry-run`.

### 4.2 Environment variables (Production)

Add as **build-time** env vars (Workers Builds / CI). They bake into HTML and into `robots.txt` / `llms.txt` via `scripts/postbuild.mjs`:

```
NODE_VERSION=22.22.0
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_GSC_VERIFICATION=...
PUBLIC_BING_VERIFICATION=...
PUBLIC_GA4_MEASUREMENT_ID=...
PUBLIC_ADSENSE_PUBLISHER_ID=...
PUBLIC_INDEXNOW_KEY=...
```

If `PUBLIC_SITE_URL` is unset, postbuild logs `patched robots/llms for https://example.com` — set the real origin (HTTPS, no trailing slash) before production deploys. Redeploy after changing env vars.

### 4.3 Headers & caching

`public/_headers` is copied to `dist/_headers` and applied by Workers static assets:

- Security headers on `/*` (including `X-Frame-Options: SAMEORIGIN`)
- `/embed/*` detaches `X-Frame-Options` (`! X-Frame-Options`) and sets `Content-Security-Policy: frame-ancestors *` so embeds can be iframed
- Long cache on hashed asset paths

Do not block JS/CSS needed by tools in Cloudflare **Bot Fight** for real users.

### 4.4 Custom domain

1. Worker → **Settings → Domains & Routes** (or Custom domains) → add apex + `www`
2. Complete DNS records Cloudflare suggests
3. Wait for **Active** SSL

### 4.5 Preview / version URLs

Workers version URLs are useful for QA; set `PUBLIC_SITE_URL` to the preview origin **only** for preview builds if you need accurate canonicals (optional).

---

## 5. Deploy: Vercel

1. **Import Project** from GitHub.
2. Framework: **Astro** (or Other).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: same as Cloudflare table above.
6. Edit **`vercel.json`** redirect rule host from `www.example.com` to your domain.
7. Deploy → **Domains** → add apex + www; Vercel issues certificates.

Preview URLs: each PR gets `*.vercel.app`.

---

## 6. Deploy: Netlify

1. **Add new site → Import from Git**
2. Build command: `npm run build` (also in `netlify.toml`)
3. Publish directory: `dist`
4. Environment variables: same as above.
5. **Domain management** → add custom domain; enable HTTPS.
6. Configure apex/www redirect in Netlify **Domain settings** or `_redirects` if you add one.

---

## 7. Post-deploy SEO (live URLs)

Replace `yourdomain.com` below with your real host.

### 7.1 Google Search Console

1. [Search Console](https://search.google.com/search-console) → **Add property** → **Domain** `yourdomain.com`.
2. Copy the **TXT** record → add at DNS (Cloudflare DNS is fastest).
3. After verification, open **Sitemaps** → submit:

```
https://yourdomain.com/sitemap-index.xml
```

4. **URL Inspection** → request indexing for (one at a time, after launch):

```
https://yourdomain.com/
https://yourdomain.com/category/data/
https://yourdomain.com/tools/yaml-to-json/
https://yourdomain.com/tools/psd-to-png/
https://yourdomain.com/guides/privacy-first-conversion/
```

5. Monitor **Pages** indexing report and **Core Web Vitals** (field data accumulates over days).

### 7.2 Bing Webmaster Tools

1. [Bing Webmaster](https://www.bing.com/webmasters/) → **Import from Google Search Console** (fastest).
2. Submit the same sitemap URL.
3. Confirm **IndexNow** key is reachable:

```
https://yourdomain.com/<PUBLIC_INDEXNOW_KEY>.txt
```

(Also under `public/indexnow/` in repo.)

**Notify URL changes (optional script):**

```bash
KEY=your-indexnow-key
URL=https://yourdomain.com/tools/yaml-to-json/
curl -s "https://api.indexnow.org/indexnow?url=${URL}&key=${KEY}"
```

Google does **not** use IndexNow.

### 7.3 Rich Results Test (live)

After deploy, validate structured data on production URLs (lab extract in `docs/proof/structured-data/` is not a substitute):

1. [Rich Results Test](https://search.google.com/test/rich-results)
2. Test home, one tool, one guide
3. Fix any mismatches between visible content and JSON-LD

### 7.4 PageSpeed Insights (live)

Run [PageSpeed Insights](https://pagespeed.web.dev/) on:

- `https://yourdomain.com/`
- `https://yourdomain.com/tools/yaml-to-json/`

Compare to committed budgets in `docs/proof/lighthouse/summary.md`. Field CWV will differ from lab; watch GSC CWV report weekly.

---

## 8. Google AdSense (when ready)

**Do not rush.** Apply when you have real content, working tools, trust pages, and some organic traffic (see [ADSENSE.md](./ADSENSE.md)).

1. **Prepare:** Privacy policy mentions AdSense/cookies; `ads.txt` ready; CMP plan for EEA/UK/CH.
2. **Apply:** [AdSense](https://www.google.com/adsense/) → add site `https://yourdomain.com`.
3. **Verification:** AdSense may ask for script in `<head>` — add via Astro layout or tag manager when approved (today ads stay off until `PUBLIC_ADSENSE_PUBLISHER_ID` is set).
4. **ads.txt:** serve at `https://yourdomain.com/ads.txt` with your publisher line.
5. **Enable in site:** set `PUBLIC_ADSENSE_PUBLISHER_ID`, rebuild, redeploy.
6. **Placement:** keep slots **below** the tool on mobile (`AdSlot.astro`, fixed 100px height) to protect CLS. Avoid pushing the converter below ads.

---

## 9. Analytics (GA4)

1. Create GA4 property → **Web** data stream for `yourdomain.com`.
2. Copy Measurement ID → `PUBLIC_GA4_MEASUREMENT_ID`.
3. Wire gtag in `BaseLayout.astro` (placeholder hook exists via `window.LF_GA4`) or inject Google's snippet.
4. In GA4, mark **conversions** if you add events later (tool_success, download_click).

### Weekly monitoring checklist

| Source | What to watch |
|---|---|
| **GSC → Performance** | Impressions/clicks rising; queries at positions 8–30 |
| **GSC → Pages** | Indexing errors, soft 404s |
| **GSC → Core Web Vitals** | LCP/INP/CLS field trends |
| **GA4** | Landing pages, engagement, geo |
| **AdSense** (if live) | RPM, policy alerts, invalid traffic |
| **Repo** | `npm run proof` after substantive changes |

---

## 10. Updating, redeploying, rollback

### Routine content or tool update

```bash
git pull
# edit src/data/tools.ts, converters, etc.
npm test && npm run proof
git commit -am "Describe change"
git push
```

Cloudflare/Vercel/Netlify auto-build on push to production branch.

### Rollback

| Host | Action |
|---|---|
| **Cloudflare Pages** | Deployments → select previous successful deployment → **Rollback to this deployment** |
| **Vercel** | Deployments → … → **Promote to Production** on an older build |
| **Netlify** | Deploys → **Publish deploy** on a previous build |

Also revert the Git commit on `main` if the failure is in source.

### Invalidate caches

Hashed assets under `/_astro/` are immutable. HTML updates propagate on new deploy. If using Cloudflare CDN cache for HTML (unusual on Pages), purge cache after deploy.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails: Node version | Astro requires ≥22.22 | Set `NODE_VERSION=22.22.0` on host; use `npm run build` locally |
| Wrong canonical / sitemap host | `PUBLIC_SITE_URL` unset at build | Set env var; rebuild |
| `robots.txt` still shows example.com | postbuild not run | Use `npm run build` (includes postbuild) |
| Tools blank / WASM error | Old browser or blocked WASM | Test current Chrome/Firefox/Safari |
| AdSense not showing | Empty publisher ID (expected) | Set ID after approval; check ad blockers |
| GSC “Couldn't fetch” sitemap | DNS/HTTPS not ready | Fix SSL; open sitemap URL in browser |
| High LCP on tool pages in lab | Long SEO HTML + mobile throttling | See `docs/proof/`; field CWV in GSC matters more over time |
| CI proof fails | Lighthouse budget or audit | Read `docs/proof/README.md`; fix locally with `npm run proof` |

---

## 12. Launch checklist

Copy this into your issue tracker and check off on launch day.

### Config & repo

- [ ] `PUBLIC_SITE_URL` set to production domain
- [ ] Contact email and author bios updated
- [ ] `public/ads.txt`, `robots.txt`, `llms.txt`, IndexNow key updated
- [ ] `npm run proof` passes; proof committed or CI artifact reviewed

### Hosting

- [ ] Production deploy green on Cloudflare Pages (or chosen host)
- [ ] Apex + www DNS correct; one canonical host 301 redirect
- [ ] HTTPS valid; `curl -I` shows 200

### Search

- [ ] GSC domain property verified (DNS TXT)
- [ ] Sitemap submitted and fetched successfully
- [ ] URL Inspection requested for home, hubs, top tools
- [ ] Bing Webmaster imported; IndexNow key live
- [ ] Rich Results Test run on live URLs

### Trust & monetization

- [ ] About, Contact, Privacy, Terms, Methodology live
- [ ] Privacy mentions AdSense/cookies and opt-out links
- [ ] AdSense applied only when traffic/content criteria met
- [ ] CMP integrated before personalized ads in EEA/UK/CH

### Ongoing

- [ ] GA4 receiving traffic (if enabled)
- [ ] Weekly GSC + CWV review scheduled
- [ ] Calendar reminder to refresh fee/format data and `lastUpdated` dates

---

**You are live.** Link `docs/DEPLOYMENT.md` from your runbook and re-run `npm run proof` after any major release.
