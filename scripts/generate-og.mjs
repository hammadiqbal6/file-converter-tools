#!/usr/bin/env node
/**
 * Generate lightweight per-page OG SVG images under public/og/.
 * Referenced as og:image (no trailing slash). Regenerated before build.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'public', 'og');
const toolsDir = path.join(outDir, 'tools');
const guidesDir = path.join(outDir, 'guides');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapTitle(title, max = 36) {
  const words = title.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function svgFor(title, subtitle = 'Private · In-browser') {
  const lines = wrapTitle(title);
  const text = lines
    .map(
      (line, i) =>
        `<text x="80" y="${300 + i * 58}" fill="#f4f7f6" font-size="48" font-family="ui-sans-serif,system-ui,sans-serif" font-weight="700">${esc(line)}</text>`,
    )
    .join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f3d3e"/>
      <stop offset="100%" stop-color="#1a5c5e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="16" height="630" fill="#c45c26"/>
  <text x="80" y="120" fill="#9fc0be" font-size="28" font-family="ui-sans-serif,system-ui,sans-serif" font-weight="700" letter-spacing="0.08em">LOCALFILE CONVERT</text>
  ${text}
  <text x="80" y="560" fill="#cfd9d7" font-size="26" font-family="ui-sans-serif,system-ui,sans-serif">${esc(subtitle)}</text>
</svg>
`;
}

function slugsFrom(file, exportName) {
  const src = fs.readFileSync(file, 'utf8');
  const block = src.split(`export const ${exportName}`)[1] || '';
  return [...block.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
}

function titlesFrom(file, exportName) {
  const src = fs.readFileSync(file, 'utf8');
  const block = src.split(`export const ${exportName}`)[1] || src;
  const items = [];
  const re = /slug:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(block))) items.push({ slug: m[1], title: m[2] });
  // de-dupe by slug keeping first
  const seen = new Set();
  return items.filter((x) => (seen.has(x.slug) ? false : (seen.add(x.slug), true)));
}

/** Guide articles live as one file per slug under guide-articles/. */
function titlesFromGuideArticles() {
  const dir = path.join(root, 'src/data/guide-articles');
  if (!fs.existsSync(dir)) return [];
  const items = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.ts')) continue;
    const src = fs.readFileSync(path.join(dir, name), 'utf8');
    const slug = (src.match(/slug:\s*['"]([^'"]+)['"]/) || [])[1] || name.replace(/\.ts$/, '');
    const title = (src.match(/title:\s*['"]([^'"]+)['"]/) || [])[1] || slug;
    items.push({ slug, title });
  }
  return items;
}

fs.mkdirSync(toolsDir, { recursive: true });
fs.mkdirSync(guidesDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'home.svg'), svgFor('Private file converters', 'Your file never leaves your device'));

const tools = titlesFrom(path.join(root, 'src/data/tools.ts'), 'tools');
for (const t of tools) {
  fs.writeFileSync(path.join(toolsDir, `${t.slug}.svg`), svgFor(t.title));
}

const guides = [
  ...titlesFrom(path.join(root, 'src/data/guides.ts'), 'guides'),
  ...titlesFromGuideArticles(),
].filter((g, i, arr) => arr.findIndex((x) => x.slug === g.slug) === i);
for (const g of guides) {
  fs.writeFileSync(path.join(guidesDir, `${g.slug}.svg`), svgFor(g.title, 'Guide'));
}

console.log(`generate-og: ${tools.length} tools, ${guides.length} guides`);
