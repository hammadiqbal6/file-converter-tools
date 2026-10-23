#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/** Keep in sync with DEFAULT_SITE_URL in src/config/site.ts */
const DEFAULT_SITE_URL = 'https://file-converter-tools.hammadiqbal117.workers.dev';
const dist = path.join(process.cwd(), 'dist');
const siteUrl = (process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

function patch(file, replacers) {
  const p = path.join(dist, file);
  if (!fs.existsSync(p)) return;
  let text = fs.readFileSync(p, 'utf8');
  for (const [from, to] of replacers) text = text.replaceAll(from, to);
  fs.writeFileSync(p, text);
}

// Replace legacy example.com placeholders and the committed default origin
// so a custom PUBLIC_SITE_URL still wins after build.
patch('robots.txt', [
  ['https://example.com', siteUrl],
  [DEFAULT_SITE_URL, siteUrl],
]);
patch('llms.txt', [
  ['https://example.com', siteUrl],
  [DEFAULT_SITE_URL, siteUrl],
]);

console.log(`postbuild: patched robots/llms for ${siteUrl}`);
