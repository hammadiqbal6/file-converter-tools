#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const dist = path.join(process.cwd(), 'dist');
const errors = [];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name.endsWith('.html')) files.push(p);
  }
  return files;
}

const htmlFiles = walk(dist);
const routes = new Set(
  htmlFiles.map((f) => {
    const rel = path.relative(dist, f).replace(/index\.html$/, '').replace(/\\/g, '/');
    if (!rel) return '/';
    return `/${rel}`.replace(/\/+/g, '/').replace(/\/$/, '') + '/';
  }),
);

for (const file of htmlFiles) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
  $('a[href^="/"]').each((_, a) => {
    const href = $(a).attr('href')?.split('#')[0];
    if (!href || href.includes('mailto:')) return;
    let norm = href;
    if (!norm.endsWith('/') && !norm.includes('.')) norm += '/';
    if (norm.startsWith('/embed/')) return;
    const target = path.join(dist, norm.replace(/^\//, ''), 'index.html');
    const targetFile = path.join(dist, norm.replace(/^\//, ''));
    if (!fs.existsSync(target) && !fs.existsSync(targetFile) && !routes.has(norm)) {
      errors.push(`${path.relative(dist, file)} → ${href}`);
    }
  });
}

if (errors.length) {
  console.error('Link check failed:', errors.length);
  errors.slice(0, 30).forEach((e) => console.error(e));
  process.exit(1);
}
console.log(`Link check passed (${htmlFiles.length} HTML files).`);
