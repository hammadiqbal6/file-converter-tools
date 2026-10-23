#!/usr/bin/env node
/**
 * Hard SEO guardrails — fail the build if dist/ or repo regresses indexing bugs
 * documented in docs/SEO-GUARDRAILS.md and docs/CUSTOM-DOMAIN.md.
 *
 * Requires: npm run build (dist/ present).
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const dist = path.join(root, 'dist');
const errors = [];

const PLACEHOLDER_KEY = '00000000000000000000000000000000';
const FORBIDDEN_HOST = 'example.com';
const WORKERS_DEV_RE = /workers\.dev/i;

/** Files allowed to mention workers.dev (single default + docs/CI/tests/proof). */
const WORKERS_DEV_ALLOWLIST = new Set([
  'src/config/site.ts',
  'tests/site-config.test.ts',
  'docs/CUSTOM-DOMAIN.md',
  'docs/DEPLOYMENT.md',
  'docs/SEO-GUARDRAILS.md',
  'docs/SEO-GUIDE.md',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  '.env.example',
  '.github/workflows/ci.yml',
  // This audit file documents the rule and allowlist itself.
  'scripts/audit/seo-guardrails.mjs',
  '.cursor/rules/seo-guardrails.mdc',
  '.cursor/rules/seo-pages.mdc',
  '.cursor/skills/seo-audit/SKILL.md',
  '.cursor/skills/ai-seo-geo-audit/SKILL.md',
  '.cursor/agents/seo-auditor.md',
]);

function isWorkersDevAllowed(rel) {
  if (WORKERS_DEV_ALLOWLIST.has(rel)) return true;
  if (rel.startsWith('docs/proof/')) return true;
  return false;
}

function fail(msg) {
  errors.push(msg);
}

function walkHtml(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, files);
    else if (ent.name === 'index.html' || ent.name === '404.html') files.push(p);
  }
  return files;
}

function walkFiles(dir, pred, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, pred, files);
    else if (pred(p)) files.push(p);
  }
  return files;
}

function readIfExists(rel) {
  const p = path.join(dist, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function wordCountFromHtml(html) {
  const $ = cheerio.load(html);
  const text = $('main').text().replace(/\s+/g, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

function collectSitemapUrls() {
  const urls = new Set();
  const index = readIfExists('sitemap-index.xml') || '';
  const children = [...index.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  const files = ['sitemap-0.xml', ...children.map((u) => {
    try {
      return new URL(u).pathname.replace(/^\//, '');
    } catch {
      return '';
    }
  })].filter(Boolean);
  for (const rel of [...new Set(files)]) {
    const xml = readIfExists(rel);
    if (!xml) continue;
    for (const m of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
      try {
        const u = new URL(m[1].trim());
        let p = u.pathname;
        if (!p.endsWith('/')) p += '/';
        urls.add(p);
      } catch {
        /* ignore */
      }
    }
  }
  return urls;
}

function pagePathFromFile(file) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return null;
  return `/${rel.replace(/index\.html$/, '')}`;
}

if (!fs.existsSync(dist)) {
  console.error('seo-guardrails: dist/ missing — run npm run build first');
  process.exit(1);
}

// --- No hardcoded workers.dev outside allowlist (custom-domain readiness) ---
const srcCandidates = walkFiles(root, (p) => {
  const rel = path.relative(root, p).replace(/\\/g, '/');
  if (rel.startsWith('docs/proof/')) return false;
  if (rel.startsWith('public/og/')) return false;
  return /\.(ts|tsx|js|mjs|astro|md|txt|json|jsonc|yml|yaml|css|svg|html|cjs)$/i.test(rel);
});
for (const file of srcCandidates) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (isWorkersDevAllowed(rel)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (WORKERS_DEV_RE.test(text)) {
    fail(`hardcoded workers.dev in ${rel} — use PUBLIC_SITE_URL / DEFAULT_SITE_URL only (see docs/CUSTOM-DOMAIN.md)`);
  }
}

// --- example.com must not appear in SEO surfaces ---
const textSurfaces = [
  'sitemap-index.xml',
  'sitemap-0.xml',
  'robots.txt',
  'llms.txt',
  '_redirects',
];
for (const rel of textSurfaces) {
  const text = readIfExists(rel);
  if (text == null) {
    if (rel.startsWith('sitemap')) fail(`missing ${rel}`);
    continue;
  }
  if (text.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel} contains ${FORBIDDEN_HOST}`);
  }
  if (text.includes('__SITE_ORIGIN__')) {
    fail(`${rel} still contains __SITE_ORIGIN__ placeholder`);
  }
}

const htmlFiles = walkHtml(dist);
const sitemapUrls = collectSitemapUrls();
const PERSON_ID = 'https://github.com/hammadiqbal6#person';

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  const urlPath = pagePathFromFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const robots = ($('meta[name="robots"]').attr('content') || '').toLowerCase();
  const title = $('title').first().text().trim();
  const desc = $('meta[name="description"]').attr('content') || '';
  const h1s = $('h1');

  const isEmbed = rel.startsWith('embed/');
  const is404 = rel === '404.html' || rel.endsWith('/404.html');

  if (canonical.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel}: canonical contains ${FORBIDDEN_HOST}`);
  }
  if (ogUrl.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel}: og:url contains ${FORBIDDEN_HOST}`);
  }
  if (ogImage.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel}: og:image contains ${FORBIDDEN_HOST}`);
  }
  if (ogImage && /\/$/.test(ogImage)) {
    fail(`${rel}: og:image ends with trailing slash (${ogImage})`);
  }
  if (!isEmbed && !is404 && robots.includes('noindex')) {
    fail(`${rel}: unexpected noindex on production page`);
  }

  if (!isEmbed && !is404) {
    if (!title) fail(`${rel}: missing <title>`);
    if (title.length > 60) fail(`${rel}: title length ${title.length} > 60 ("${title}")`);
    if (!desc) fail(`${rel}: missing meta description`);
    if (desc.length < 50 || desc.length > 165) {
      fail(`${rel}: meta description length ${desc.length} outside 50–165`);
    }
    if (!canonical) fail(`${rel}: missing canonical`);
    if (h1s.length !== 1) fail(`${rel}: expected 1 H1, got ${h1s.length}`);

    if (urlPath && !sitemapUrls.has(urlPath) && !urlPath.startsWith('/embed/')) {
      fail(`${rel}: page ${urlPath} missing from sitemap`);
    }
  }

  // Inline scripts must not use import (breaks non-module scripts)
  $('script').each((_, el) => {
    const type = ($(el).attr('type') || '').toLowerCase();
    const src = $(el).attr('src');
    if (src) return;
    if (type && type !== 'text/javascript' && type !== 'module' && !type.includes('ld+json')) {
      return;
    }
    if (type.includes('ld+json')) return;
    const body = $(el).html() || '';
    if (/\bimport\s+/.test(body) && type !== 'module') {
      fail(`${rel}: inline script uses import without type=module`);
    }
  });

  // JSON-LD validity + tool/guide requirements
  const ldBlocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      ldBlocks.push(JSON.parse($(el).html() || '{}'));
    } catch (e) {
      fail(`${rel}: invalid JSON-LD (${e.message})`);
    }
  });

  if (urlPath && urlPath.startsWith('/tools/') && urlPath !== '/tools/') {
    const hasGuideLink =
      $('a[href^="/guides/"]').length > 0 ||
      html.includes('/guides/');
    if (!hasGuideLink) fail(`${rel}: tool page has no guide link`);

    const flat = JSON.stringify(ldBlocks);
    if (!flat.includes('FAQPage')) fail(`${rel}: tool page missing FAQPage schema`);
    if (!flat.includes(PERSON_ID) && !flat.includes('"Person"')) {
      fail(`${rel}: tool page missing Person / author schema`);
    }
    // Visible Hammad byline
    const authorText = $('main').text();
    if (!/Hammad/i.test(authorText)) fail(`${rel}: tool page missing visible Hammad author byline`);
  }

  if (urlPath && urlPath.startsWith('/guides/') && urlPath !== '/guides/') {
    const words = wordCountFromHtml(html);
    if (words < 800) fail(`${rel}: guide too thin (~${words} words; need ≥800, target ~1000+)`);
    const flat = JSON.stringify(ldBlocks);
    if (!flat.includes('FAQPage')) fail(`${rel}: guide missing FAQPage schema`);
  }
}

// --- IndexNow ---
const placeholderPath = path.join(dist, `${PLACEHOLDER_KEY}.txt`);
if (fs.existsSync(placeholderPath)) {
  fail(`placeholder IndexNow key file present: dist/${PLACEHOLDER_KEY}.txt`);
}
const publicPlaceholder = path.join(root, 'public', `${PLACEHOLDER_KEY}.txt`);
if (fs.existsSync(publicPlaceholder)) {
  fail(`placeholder IndexNow key still in public/: ${PLACEHOLDER_KEY}.txt`);
}

const keyFiles = fs
  .readdirSync(dist)
  .filter((n) => /^[a-f0-9]{32}\.txt$/i.test(n) && n.toLowerCase() !== `${PLACEHOLDER_KEY}.txt`);
if (keyFiles.length === 0) {
  fail('no IndexNow key file in dist/ (expected public/<32-hex>.txt)');
} else {
  for (const name of keyFiles) {
    const body = fs.readFileSync(path.join(dist, name), 'utf8').trim();
    const key = name.replace(/\.txt$/i, '');
    if (body !== key) {
      fail(`IndexNow file ${name} content must equal the key (got ${JSON.stringify(body)})`);
    }
  }
}

// --- /sitemap.xml redirect ---
const redirects = readIfExists('_redirects') || '';
const hasSitemapRedirect =
  /\/sitemap\.xml\s+\/sitemap-index\.xml\s+301\b/.test(redirects) ||
  /\/sitemap\.xml\s+\/sitemap-index\.xml\s+308\b/.test(redirects);
if (!hasSitemapRedirect) {
  fail('dist/_redirects missing `/sitemap.xml` → `/sitemap-index.xml` 301/308');
}

// --- /_astro/* immutable cache header ---
const headers = readIfExists('_headers') || fs.readFileSync(path.join(root, 'public/_headers'), 'utf8');
if (!/\/_astro\/\*\s*\n\s*Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/i.test(headers)) {
  fail('public/_headers missing /_astro/* immutable Cache-Control');
}

// --- wrangler: worker 308 + html_handling + previews; no dangerous top-level vars ---
const wranglerPath = path.join(root, 'wrangler.jsonc');
if (fs.existsSync(wranglerPath)) {
  const wrangler = fs.readFileSync(wranglerPath, 'utf8');
  if (!/"html_handling"\s*:\s*"force-trailing-slash"/.test(wrangler)) {
    fail('wrangler.jsonc missing assets.html_handling: "force-trailing-slash"');
  }
  if (!/"previews"\s*:\s*\{/.test(wrangler)) {
    fail('wrangler.jsonc missing "previews": {} (required by npx wrangler preview)');
  }
  if (!/"run_worker_first"\s*:\s*true/.test(wrangler)) {
    fail('wrangler.jsonc missing run_worker_first: true (308 trailing-slash worker)');
  }
  if (!/"main"\s*:\s*"src\/worker\.ts"/.test(wrangler)) {
    fail('wrangler.jsonc missing main: "src/worker.ts"');
  }
  const stripped = wrangler.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutPreviews = stripped.replace(/"previews"\s*:\s*\{[\s\S]*?\}/, '');
  if (/"vars"\s*:\s*\{/.test(withoutPreviews)) {
    fail('wrangler.jsonc has top-level vars without matching previews.vars — breaks wrangler preview');
  }
}

const workerPath = path.join(root, 'src/worker.ts');
if (!fs.existsSync(workerPath)) {
  fail('missing src/worker.ts (308 trailing-slash redirects)');
} else {
  const worker = fs.readFileSync(workerPath, 'utf8');
  if (!/308/.test(worker)) fail('src/worker.ts must issue 308 redirects');
  if (!/\{1,\s*16\}/.test(worker) && !/\{1,16\}/.test(worker)) {
    fail('src/worker.ts FILE_EXT should allow long extensions ({1,16})');
  }
}

if (!fs.existsSync(path.join(root, 'docs/CUSTOM-DOMAIN.md'))) {
  fail('missing docs/CUSTOM-DOMAIN.md');
}

console.log('SEO guardrails:', { pages: htmlFiles.length, sitemapUrls: sitemapUrls.size, errors: errors.length });
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  process.exit(1);
}
console.log('SEO guardrails passed.');
