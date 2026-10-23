# Deployment guide (step-by-step)

This guide walks you from a local checkout to a live **LocalFile Convert** site on your own domain, with HTTPS, Search Console, optional AdSense/GA4, and a safe redeploy/rollback workflow.

**Stack:** static Astro build → `dist/` folder. No server runtime required. Production host is a Cloudflare Worker (`file-converter-tools`) serving static assets via `wrangler.jsonc` (Workers Builds: `npm run build` → `npx wrangler deploy`).

**Related docs:** [SEO-GUIDE.md](./SEO-GUIDE.md) (indexing), [SEO-GUARDRAILS.md](./SEO-GUARDRAILS.md) (hard rules / CI), [ADSENSE.md](./ADSENSE.md) (ads), [docs/proof/README.md](./proof/README.md) (evidence bundle).

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
| `url` | `PUBLIC_SITE_URL` | HTTPS origin, no trailing slash. Default: live workers.dev URL |
| `contactEmail` | `PUBLIC_CONTACT_EMAIL` | Public support email (default: `hammadiqbal117@gmail.com`) |
| `adsensePublisherId` | `PUBLIC_ADSENSE_PUBLISHER_ID` | `ca-pub-XXXXXXXX` or leave empty |
| `adsenseAutoAds` | — | `true` only if you intentionally enable Auto ads |
| `ga4MeasurementId` | `PUBLIC_GA4_MEASUREMENT_ID` | Default matches live GA4; empty override disables |
| `gscVerification` | `PUBLIC_GSC_VERIFICATION` | HTML tag verification (default already verified in GSC) |
| `bingVerification` | `PUBLIC_BING_VERIFICATION` | Bing meta verification content |
| `indexNowKey` | `PUBLIC_INDEXNOW_KEY` / `INDEXNOW_KEY` | 32-char hex; must match `public/<key>.txt` |
| `defaultOgImage` | — | `/og-default.png` (replace image in `public/` if needed) |
| `lastUpdated` | — | Bump on meaningful content refreshes |

**Example production build:**

```bash
export PUBLIC_SITE_URL=https://file-converter-tools.hammadiqbal117.workers.dev
export PUBLIC_CONTACT_EMAIL=hammadiqbal117@gmail.com
export PUBLIC_GSC_VERIFICATION=0-q_NxhBgfgCm4WOLfbe9VrHrjbLzaxh8SXsbo2Q-UU
npm run build
```

`scripts/postbuild.mjs` patches **`dist/robots.txt`** and **`dist/llms.txt`** so Sitemap / llms links use `PUBLIC_SITE_URL` (falls back to the workers.dev default — never `example.com`).

### 2.2 Files to keep in sync

| File | Notes |
|---|---|
| `public/robots.txt` | Sitemap line uses workers.dev by default; postbuild rewrites for custom domains |
| `public/llms.txt` | Same origin rewrite as robots |
| `public/ads.txt` | Uncomment/add `google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0` after AdSense approval |
| `public/<KEY>.txt` | IndexNow key file at **site root** (content must equal the key; see `.env.example`) |
| `public/_redirects` | `/sitemap.xml` → `/sitemap-index.xml` 301 |
| `wrangler.jsonc` | `html_handling: force-trailing-slash` matches Astro `trailingSlash: 'always'` |

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

### 3.3 Cloudflare DNS (recommended with Workers)

1. Add site to Cloudflare → import DNS.
2. At registrar, set nameservers to Cloudflare.
3. In **DNS → Records**:
   - **Apex** `@` → Worker custom domain (auto when you attach the domain) or CNAME flattening
   - **www** → CNAME / custom domain on the same Worker
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

Full list with comments: **[`.env.example`](../.env.example)** (copy to `.env` locally; do not commit secrets).

Add as **build-time** env vars in **Cloudflare Workers Builds → Settings → Variables** (and CI). `PUBLIC_*` values bake into HTML; `PUBLIC_SITE_URL` also patches `robots.txt` / `llms.txt` via `scripts/postbuild.mjs`.

| Variable | Cloudflare Builds | Notes |
|---|---|---|
| `PUBLIC_SITE_URL` | **Required** (production) | HTTPS origin, no trailing slash. Unset → workers.dev default (not example.com) |
| `PUBLIC_CONTACT_EMAIL` | Optional | Defaults to `hammadiqbal117@gmail.com` in `site.ts` |
| `NODE_VERSION` | Recommended | `22.22.0` |
| `PUBLIC_GSC_VERIFICATION` | Recommended | Meta verification; default already verified for this property |
| `PUBLIC_BING_VERIFICATION` | Optional until Bing | Meta verification content |
| `PUBLIC_GA4_MEASUREMENT_ID` | Optional | Default matches live GA4; set empty only to disable |
| `PUBLIC_ADSENSE_PUBLISHER_ID` | Optional | Empty = ads off |
| `PUBLIC_INDEXNOW_KEY` / `INDEXNOW_KEY` | Recommended | Keep `public/<key>.txt` in sync |
| `INDEXNOW_DISABLE` | Preview only | Set `1` to skip post-deploy IndexNow ping |

**Deploy command** (Workers Builds → Deploy command; do **not** ping from `build` — the key file must be live first):

```bash
npx wrangler deploy && node scripts/indexnow.mjs
```

Or locally: `npm run deploy:indexnow`.

Redeploy after changing env vars.

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
6. `vercel.json` already 301s `/sitemap.xml` → `/sitemap-index.xml`.
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
3. Confirm **IndexNow** key is reachable at the site root:

```
https://yourdomain.com/<PUBLIC_INDEXNOW_KEY>.txt
```

(Committed as `public/<key>.txt`; current key documented in `.env.example`.)

**Notify URL changes after deploy:**

```bash
npm run indexnow              # POST all sitemap URLs (never fails deploy)
node scripts/indexnow.mjs --dry-run
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
2. Copy Measurement ID → set `PUBLIC_GA4_MEASUREMENT_ID` on the **build** environment (Cloudflare Workers Builds, Pages, etc.), then rebuild.
3. `BaseLayout.astro` injects the standard `gtag.js` loader + `gtag('config', …)` on every page when that env var is non-empty. Leave it unset to emit no GA code.
4. **Consent:** the site cookie banner (`CookieNotice.astro`, `lf_cookie_notice_v1`) is informational (OK dismiss only — not accept/decline). GA4 therefore loads immediately when the measurement ID is present. For EEA/UK/CH personalized ads you still need a Google-certified CMP (see [ADSENSE.md](./ADSENSE.md)); do not treat this banner as that CMP.
5. **CSP:** `public/_headers` does not set a site-wide `Content-Security-Policy` that would block `googletagmanager.com` / `google-analytics.com`. If you add a CSP later, allow those hosts for `script-src` / `connect-src` (and GTM’s usual companions).
6. In GA4, mark **conversions** if you add events later (`tool_success`, `download_click`).

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
| **Cloudflare Workers** | Deployments → select previous successful deployment → **Rollback** |
| **Vercel** | Deployments → … → **Promote to Production** on an older build |
| **Netlify** | Deploys → **Publish deploy** on a previous build |

Also revert the Git commit on `main` if the failure is in source.

### Invalidate caches

Hashed assets under `/_astro/` are immutable. HTML updates propagate on new deploy. If using Cloudflare CDN cache for HTML, purge cache after deploy.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails: Node version | Astro requires ≥22.22 | Set `NODE_VERSION=22.22.0` on host; use `npm run build` locally |
| Wrong canonical / sitemap host | `PUBLIC_SITE_URL` unset / wrong at build | Set env var; rebuild (default is workers.dev) |
| `robots.txt` still shows wrong host | postbuild not run | Use `npm run build` (includes postbuild) |
| `/sitemap.xml` 404 | missing `_redirects` | Confirm `public/_redirects` ships in `dist/` |
| `og:image` 404 with trailing slash | old `absoluteUrl` | Rebuild; file URLs must not end with `/` |
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

- [ ] Production deploy green on Cloudflare Worker `file-converter-tools` (or chosen host)
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
