#!/usr/bin/env node
/**
 * Hard SEO guardrails — fail the build if dist/ regresses the indexing bugs
 * documented in docs/SEO-GUARDRAILS.md.
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

function readIfExists(rel) {
  const p = path.join(dist, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

if (!fs.existsSync(dist)) {
  console.error('seo-guardrails: dist/ missing — run npm run build first');
  process.exit(1);
}

// --- example.com must not appear in SEO surfaces (ignore vendor JS) ---
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
}

const htmlFiles = walkHtml(dist);
for (const file of htmlFiles) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const robots = ($('meta[name="robots"]').attr('content') || '').toLowerCase();

  if (canonical.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel}: canonical contains ${FORBIDDEN_HOST}`);
  }
  if (ogUrl.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel}: og:url contains ${FORBIDDEN_HOST}`);
  }
  if (ogImage.toLowerCase().includes(FORBIDDEN_HOST)) {
    fail(`${rel}: og:image contains ${FORBIDDEN_HOST}`);
  }

  // og:image must not end with trailing slash (file asset)
  if (ogImage && /\/$/.test(ogImage)) {
    fail(`${rel}: og:image ends with trailing slash (${ogImage})`);
  }

  // Production pages (not 404 / embed) must be indexable
  const isEmbed = rel.startsWith('embed/');
  const is404 = rel === '404.html' || rel.endsWith('/404.html');
  if (!isEmbed && !is404 && robots.includes('noindex')) {
    fail(`${rel}: unexpected noindex on production page`);
  }
}

// --- IndexNow: no placeholder; real key file present ---
const placeholderPath = path.join(dist, `${PLACEHOLDER_KEY}.txt`);
if (fs.existsSync(placeholderPath)) {
  fail(`placeholder IndexNow key file present: dist/${PLACEHOLDER_KEY}.txt`);
}
const publicPlaceholder = path.join(root, 'public', `${PLACEHOLDER_KEY}.txt`);
if (fs.existsSync(publicPlaceholder)) {
  fail(`placeholder IndexNow key still in public/: ${PLACEHOLDER_KEY}.txt`);
}
const publicIndexnowDir = path.join(root, 'public', 'indexnow');
if (fs.existsSync(publicIndexnowDir)) {
  const leftovers = fs.readdirSync(publicIndexnowDir);
  if (leftovers.some((n) => n.includes(PLACEHOLDER_KEY))) {
    fail('placeholder IndexNow key under public/indexnow/');
  }
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
    if (key === PLACEHOLDER_KEY) fail(`IndexNow key is placeholder ${PLACEHOLDER_KEY}`);
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

// --- wrangler html_handling + previews (repo config, not dist) ---
const wranglerPath = path.join(root, 'wrangler.jsonc');
if (fs.existsSync(wranglerPath)) {
  const wrangler = fs.readFileSync(wranglerPath, 'utf8');
  if (!/"html_handling"\s*:\s*"force-trailing-slash"/.test(wrangler)) {
    fail('wrangler.jsonc missing assets.html_handling: "force-trailing-slash"');
  }
  if (!/"previews"\s*:\s*\{/.test(wrangler)) {
    fail('wrangler.jsonc missing "previews": {} (required by npx wrangler preview)');
  }
  // Flag dangerous top-level vars that break preview without previews.vars
  if (/"vars"\s*:\s*\{/.test(wrangler) && !/"previews"\s*:\s*\{[^}]*"vars"/.test(wrangler.replace(/\s+/g, ' '))) {
    // Allow if only inside previews — simple heuristic: top-level vars after stripping comments
    const stripped = wrangler.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const topVars = /(?:^|[,\{])\s*"vars"\s*:/.test(stripped.replace(/"previews"\s*:\s*\{[\s\S]*?\}/, ''));
    if (topVars) {
      fail('wrangler.jsonc has top-level vars without matching previews.vars — breaks wrangler preview');
    }
  }
}

console.log('SEO guardrails:', { pages: htmlFiles.length, errors: errors.length });
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  process.exit(1);
}
console.log('SEO guardrails passed.');
