#!/usr/bin/env node
/**
 * Submit all sitemap URLs to IndexNow (Bing and partners — not Google).
 *
 * Reads dist/sitemap-index.xml (and child sitemaps), POSTs in batches of
 * 10,000. Never fails the build/deploy: all errors are caught; exit 0.
 *
 *   node scripts/indexnow.mjs
 *   node scripts/indexnow.mjs --dry-run
 *
 * Env:
 *   PUBLIC_SITE_URL   — site origin (no trailing slash); used for host/keyLocation
 *   INDEXNOW_KEY      — override key (default: e0d80dcb289204f10564144f215e4a8e)
 *   INDEXNOW_DISABLE=1 — skip entirely
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_KEY = 'e0d80dcb289204f10564144f215e4a8e';
const BATCH_SIZE = 10_000;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** Single origin setting — same as src/config/site.ts DEFAULT_SITE_URL */
function readDefaultSiteUrl() {
  const siteTs = readFileSync(join(ROOT, 'src/config/site.ts'), 'utf8');
  const m = siteTs.match(/export const DEFAULT_SITE_URL\s*=\s*\n?\s*['"]([^'"]+)['"]/);
  if (!m) throw new Error('indexnow: could not parse DEFAULT_SITE_URL from src/config/site.ts');
  return m[1];
}
const DEFAULT_SITE = readDefaultSiteUrl();

function log(...args) {
  console.log('[indexnow]', ...args);
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const url = m[1].trim();
    if (url) locs.push(url);
  }
  return locs;
}

function localPathFromLoc(loc) {
  try {
    return decodeURIComponent(new URL(loc).pathname.replace(/^\//, ''));
  } catch {
    return loc.split('/').pop() || '';
  }
}

function collectUrls() {
  const urls = new Set();
  const indexPath = join(DIST, 'sitemap-index.xml');

  if (existsSync(indexPath)) {
    const childLocs = extractLocs(readFileSync(indexPath, 'utf8'));
    for (const childUrl of childLocs) {
      const childPath = join(DIST, localPathFromLoc(childUrl));
      if (!existsSync(childPath)) {
        log('warning: child sitemap missing:', childPath);
        continue;
      }
      for (const loc of extractLocs(readFileSync(childPath, 'utf8'))) {
        urls.add(loc);
      }
    }
    return [...urls];
  }

  for (const name of readdirSync(DIST)) {
    if (!/^sitemap.*\.xml$/i.test(name)) continue;
    for (const loc of extractLocs(readFileSync(join(DIST, name), 'utf8'))) {
      urls.add(loc);
    }
  }
  return [...urls];
}

function resolveSite(urlList) {
  const fromEnv = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (urlList.length) {
    const u = new URL(urlList[0]);
    return `${u.protocol}//${u.host}`;
  }
  return DEFAULT_SITE;
}

async function postBatch(body) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => '');
  log('HTTP', res.status, text.slice(0, 200));
  return res.status;
}

async function main() {
  if (process.env.INDEXNOW_DISABLE === '1') {
    log('skipped (INDEXNOW_DISABLE=1)');
    return;
  }

  if (!existsSync(DIST)) {
    log('dist/ missing — run npm run build first; skipping');
    return;
  }

  const dryRun = process.argv.includes('--dry-run');
  const key = process.env.INDEXNOW_KEY || process.env.PUBLIC_INDEXNOW_KEY || DEFAULT_KEY;
  const urlList = collectUrls();

  if (!urlList.length) {
    log('no URLs found in dist sitemaps; skipping');
    return;
  }

  const site = resolveSite(urlList);
  const host = new URL(site).host;
  const keyLocation = `${site}/${key}.txt`;

  log(`found ${urlList.length} URL(s); host=${host}; batches of ${BATCH_SIZE}`);

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    const body = { host, key, keyLocation, urlList: batch };
    const n = Math.floor(i / BATCH_SIZE) + 1;
    if (dryRun) {
      log(`--dry-run batch ${n}: ${batch.length} URL(s)`);
      log(JSON.stringify(body, null, 2));
      continue;
    }
    log(`posting batch ${n} (${batch.length} URL(s))…`);
    await postBatch(body);
  }

  if (dryRun) log('dry-run complete (nothing posted)');
}

main()
  .catch((err) => {
    console.error('[indexnow] error (non-fatal):', err);
  })
  .finally(() => {
    process.exit(0);
  });
