#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');

function patch(file, replacers) {
  const p = path.join(dist, file);
  if (!fs.existsSync(p)) return;
  let text = fs.readFileSync(p, 'utf8');
  for (const [from, to] of replacers) text = text.replaceAll(from, to);
  fs.writeFileSync(p, text);
}

patch('robots.txt', [
  ['https://example.com', siteUrl],
  ['Sitemap: https://example.com/sitemap-index.xml', `Sitemap: ${siteUrl}/sitemap-index.xml`],
]);
patch('llms.txt', [['https://example.com', siteUrl]]);

console.log(`postbuild: patched robots/llms for ${siteUrl}`);
