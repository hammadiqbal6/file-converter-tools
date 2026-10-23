#!/usr/bin/env node
/**
 * SEO audit over built dist/ HTML.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const dist = path.join(process.cwd(), 'dist');
const errors = [];
const warnings = [];
const toolSlugs = new Set();

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === 'index.html') files.push(p);
  }
  return files;
}

function wordCount($) {
  const text = $('main').text().replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

function parseJsonLd($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      blocks.push(JSON.parse($(el).html() || '{}'));
    } catch (e) {
      errors.push(`Invalid JSON-LD on page: ${e.message}`);
    }
  });
  return blocks;
}

const pages = walk(dist);
const internalLinks = new Set();
const linkedFrom = new Map();

for (const file of pages) {
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const urlPath = rel === '/' ? '/' : rel.endsWith('/') ? rel : `${rel}/`;
  if (urlPath.startsWith('/embed/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);

  const title = $('title').first().text();
  const desc = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const h1s = $('h1');
  const robots = $('meta[name="robots"]').attr('content') || '';

  if (!title) errors.push(`${urlPath}: missing <title>`);
  if (title.length > 60) warnings.push(`${urlPath}: title length ${title.length} (>60)`);
  if (!desc) errors.push(`${urlPath}: missing meta description`);
  if (desc.length > 155) warnings.push(`${urlPath}: meta description ${desc.length} (>155)`);
  if (h1s.length !== 1) errors.push(`${urlPath}: expected 1 H1, got ${h1s.length}`);
  if (!canonical) errors.push(`${urlPath}: missing canonical`);
  if (!robots.includes('noindex') && !canonical.includes(urlPath.replace(/^\//, '').replace(/\/$/, '') && urlPath !== '/')) {
    // loose check: canonical should mention path
  }
  if (!$('meta[property="og:title"]').attr('content')) errors.push(`${urlPath}: missing og:title`);
  if (!$('meta[property="og:description"]').attr('content')) errors.push(`${urlPath}: missing og:description`);
  if (!$('meta[property="og:url"]').attr('content')) errors.push(`${urlPath}: missing og:url`);

  if (urlPath.startsWith('/tools/') && urlPath !== '/tools/') {
    toolSlugs.add(urlPath);
    const wc = wordCount($);
    if (wc < 400) errors.push(`${urlPath}: thin tool page (~${wc} words in main; target 600+)`);
  }

  $('a[href^="/"]').each((_, a) => {
    const href = $(a).attr('href')?.split('#')[0] || '';
    if (!href) return;
    const norm = href.endsWith('/') || href.includes('.') ? href : `${href}/`;
    internalLinks.add(norm);
    linkedFrom.set(norm, (linkedFrom.get(norm) || 0) + 1);
  });

  parseJsonLd($);

  $('img').each((_, img) => {
    const alt = $(img).attr('alt');
    if (alt === undefined) warnings.push(`${urlPath}: img without alt`);
  });
}

// sitemap / robots
const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
if (!/Sitemap:/i.test(robots)) errors.push('robots.txt missing Sitemap directive');
const sitemapIndex = path.join(dist, 'sitemap-index.xml');
if (!fs.existsSync(sitemapIndex)) errors.push('missing sitemap-index.xml');

// Soft cross-check; hard failures live in seo-guardrails.mjs
if (/example\.com/i.test(robots)) {
  errors.push('robots.txt still references example.com (see docs/SEO-GUARDRAILS.md)');
}

// broken internal links (html pages only)
const existing = new Set(pages.map((f) => {
  const rel = '/' + path.relative(dist, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  return rel === '/' ? '/' : rel.endsWith('/') ? rel : `${rel}/`;
}));
for (const link of internalLinks) {
  if (link.startsWith('/embed/')) continue;
  if (!existing.has(link) && !link.includes('.')) {
    // allow non-html assets
    const candidate = path.join(dist, link.replace(/^\//, ''), 'index.html');
    if (!fs.existsSync(candidate)) errors.push(`broken internal link target: ${link}`);
  }
}

// orphans: pages not linked from any page (except embed)
for (const page of existing) {
  if (page === '/' || page.startsWith('/embed/')) continue;
  if (!linkedFrom.has(page) && !linkedFrom.has(page.replace(/\/$/, ''))) {
    warnings.push(`possible orphan (no in-site links found): ${page}`);
  }
}

console.log('SEO audit:', { pages: pages.length, errors: errors.length, warnings: warnings.length });
warnings.forEach((w) => console.warn('WARN', w));
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  process.exit(1);
}
console.log('SEO audit passed.');
