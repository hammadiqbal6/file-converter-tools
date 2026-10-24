#!/usr/bin/env node
/**
 * Per-page checklist audit (docs + uploads/page-checklist.md).
 * Fast: runs on dist/ HTML only. Fail the PR when a page breaks hard rules.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const dist = path.join(process.cwd(), 'dist');
const errors = [];
const warnings = [];

const PLACEHOLDER_RE =
  /Ad slot reserved|configure PUBLIC_ADSENSE|lorem ipsum|TODO:|TBD\b|works offline after load|00000000000000000000000000000000/i;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === 'index.html') files.push(p);
  }
  return files;
}

function urlPathFromFile(file) {
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  return rel === '/' ? '/' : rel.endsWith('/') ? rel : `${rel}/`;
}

function collectSitemapPaths() {
  const paths = new Set();
  const index = path.join(dist, 'sitemap-index.xml');
  const single = path.join(dist, 'sitemap-0.xml');
  const files = [];
  if (fs.existsSync(index)) {
    const xml = fs.readFileSync(index, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const loc = m[1];
      if (loc.endsWith('.xml')) {
        const name = path.basename(new URL(loc).pathname);
        const local = path.join(dist, name);
        if (fs.existsSync(local)) files.push(local);
      } else {
        try {
          paths.add(new URL(loc).pathname);
        } catch {
          /* ignore */
        }
      }
    }
  }
  if (fs.existsSync(single)) files.push(single);
  for (const f of files) {
    const xml = fs.readFileSync(f, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        paths.add(new URL(m[1]).pathname);
      } catch {
        /* ignore */
      }
    }
  }
  return paths;
}

function parseJsonLd($, urlPath) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      blocks.push(JSON.parse($(el).html() || '{}'));
    } catch (e) {
      errors.push(`${urlPath}: invalid JSON-LD (${e.message})`);
    }
  });
  return blocks;
}

function visibleText($el) {
  return ($el.text() || '').replace(/\s+/g, ' ').trim();
}

function wordCount(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}

const sitemapPaths = collectSitemapPaths();
const pages = walk(dist);
const titles = new Map();
const descriptions = new Map();

for (const file of pages) {
  const urlPath = urlPathFromFile(file);
  if (urlPath.startsWith('/embed/')) continue;

  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);

  if (PLACEHOLDER_RE.test(html)) {
    errors.push(`${urlPath}: placeholder / ad stub / offline claim / IndexNow placeholder text found`);
  }

  const title = $('title').first().text().trim();
  const desc = ($('meta[name="description"]').attr('content') || '').trim();
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  const h1s = $('h1');

  if (!title) errors.push(`${urlPath}: missing title`);
  else {
    if (titles.has(title)) errors.push(`${urlPath}: duplicate title (also ${titles.get(title)})`);
    else titles.set(title, urlPath);
  }

  if (!desc) errors.push(`${urlPath}: missing meta description`);
  else {
    if (descriptions.has(desc)) {
      errors.push(`${urlPath}: duplicate meta description (also ${descriptions.get(desc)})`);
    } else descriptions.set(desc, urlPath);
  }

  if (h1s.length !== 1) errors.push(`${urlPath}: expected exactly 1 h1, got ${h1s.length}`);
  if (!canonical) errors.push(`${urlPath}: missing canonical`);
  if (!viewport) errors.push(`${urlPath}: missing viewport`);

  // Raw link paths shown as visible text (e.g. "/tools/foo/" as link text only)
  $('a[href^="/"]').each((_, a) => {
    const href = ($(a).attr('href') || '').split('#')[0];
    const text = visibleText($(a));
    if (text && text === href) {
      errors.push(`${urlPath}: raw link path shown as text (${href})`);
    }
  });

  parseJsonLd($, urlPath);

  const isTool = /^\/tools\/[^/]+\/$/.test(urlPath);
  const isGuide = /^\/guides\/[^/]+\/$/.test(urlPath);
  const isHub =
    urlPath === '/' ||
    urlPath === '/tools/' ||
    urlPath === '/guides/' ||
    urlPath.startsWith('/category/');

  if (isTool || isGuide || isHub) {
    if (sitemapPaths.size && !sitemapPaths.has(urlPath)) {
      errors.push(`${urlPath}: missing from sitemap`);
    }
  }

  if (isTool) {
    const h1 = h1s.first();
    const answer = h1.nextAll('.answer-first, .lead.answer-first').first();
    if (!answer.length) errors.push(`${urlPath}: missing answer-first lead after h1`);
    else {
      const words = wordCount(visibleText(answer));
      if (words > 60) errors.push(`${urlPath}: answer-first has ${words} words (max 60 before tool)`);
    }
    // Dropzone / file input should exist for converters
    if (!$('[data-dropzone], input[type="file"]').length) {
      errors.push(`${urlPath}: missing file dropzone / file input`);
    }
    // Byline should not sit between h1 and tool
    const between = [];
    let el = h1[0]?.nextSibling;
    const toolShell = $('.tool-shell')[0];
    while (el && el !== toolShell) {
      if (el.type === 'tag') between.push(el);
      el = el.nextSibling;
    }
    const betweenHtml = between.map((n) => $.html(n)).join('');
    if (/author-meta|meta-row/.test(betweenHtml) && !/answer-first/.test(betweenHtml)) {
      // author meta alone before tool
    }
    if ($(h1).nextAll('.author-meta, .meta-row.author-meta').first().length) {
      const meta = $(h1).nextAll('.author-meta, .meta-row.author-meta').first();
      const tool = $('.tool-shell').first();
      if (meta.length && tool.length) {
        const metaIdx = h1.parent().children().index(meta);
        const toolIdx = h1.parent().children().index(tool);
        // AuthorMeta is inside .trust-row after tool in our layout; if found before tool-shell in document order:
        const metaPrecedes =
          meta.parentsUntil('main, body').addBack().prevAll('.tool-shell').length === 0 &&
          meta.prevAll('.tool-shell').length === 0 &&
          meta.closest('.tool-shell').length === 0;
        // Simpler: trust-row must come after tool-shell
        const trust = $('.trust-row').first();
        if (trust.length && $('.tool-shell').first().nextAll('.trust-row').first().length === 0) {
          // check document position
          const all = $('main .container').children().toArray();
          const ti = all.findIndex((n) => $(n).is('.tool-shell') || $(n).find('.tool-shell').length);
          const ri = all.findIndex((n) => $(n).is('.trust-row') || $(n).find('.trust-row').length);
          if (ri >= 0 && ti >= 0 && ri < ti) {
            errors.push(`${urlPath}: author byline appears before the tool (answer-first order)`);
          }
        }
      }
    }
    if ($('.privacy-note').parents('.tool-panel, .hero, .tool-hero').length) {
      errors.push(`${urlPath}: privacy note still above/inside the tool panel (covers fold)`);
    }
  }

  if (isGuide) {
    const h1 = h1s.first();
    const answer = h1.nextAll('.answer-box').first();
    if (!answer.length) {
      errors.push(`${urlPath}: answer-box must be first block after h1`);
    } else {
      // Author meta must not precede answer-box
      const prevMeta = h1.nextUntil('.answer-box').filter('.author-meta, .meta-row, .trust-row');
      if (prevMeta.length) errors.push(`${urlPath}: byline/meta before answer-box`);
      const text = visibleText(answer);
      if (!/\d/.test(text)) {
        errors.push(`${urlPath}: answer-box should include a number or measurable figure`);
      }
    }
  }
}

console.log(`Page checklist: ${pages.length} HTML files scanned`);
if (warnings.length) warnings.forEach((w) => console.warn('WARN', w));
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  console.error(`Page checklist failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log('Page checklist passed.');
