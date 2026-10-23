#!/usr/bin/env node
/**
 * Post-build: patch robots.txt / regenerate llms.txt from tools + guide sources.
 * Canonical origin = process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL (src/config/site.ts).
 */
import fs from 'node:fs';
import path from 'node:path';

const siteTs = fs.readFileSync(path.join(process.cwd(), 'src/config/site.ts'), 'utf8');
const defaultMatch = siteTs.match(
  /export const DEFAULT_SITE_URL\s*=\s*\n?\s*['"]([^'"]+)['"]/,
);
if (!defaultMatch) {
  console.error('postbuild: could not parse DEFAULT_SITE_URL from src/config/site.ts');
  process.exit(1);
}
const DEFAULT_SITE_URL = defaultMatch[1];

const dist = path.join(process.cwd(), 'dist');
const siteUrl = (process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

function write(rel, text) {
  const p = path.join(dist, rel);
  if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
}

function patch(file, replacers) {
  const p = path.join(dist, file);
  if (!fs.existsSync(p)) return;
  let text = fs.readFileSync(p, 'utf8');
  for (const [from, to] of replacers) text = text.replaceAll(from, to);
  fs.writeFileSync(p, text);
}

function firstStringField(src, field) {
  const re = new RegExp(`${field}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`);
  const m = src.match(re);
  return m ? m[1].trim() : '';
}

/** Tool slugs from src/data/tools.ts (export const tools array only). */
function loadToolSlugs() {
  const toolsSrc = fs.readFileSync(path.join(process.cwd(), 'src/data/tools.ts'), 'utf8');
  const toolsBlock = toolsSrc.split('export const tools')[1] || '';
  return [...toolsBlock.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
}

/**
 * Guides from src/data/guide-articles/*.ts (source of truth).
 * guides.ts only re-exports modules, so regex on that file finds no slugs.
 */
function loadGuides() {
  const dir = path.join(process.cwd(), 'src/data/guide-articles');
  if (!fs.existsSync(dir)) return [];
  const guides = [];
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const src = fs.readFileSync(path.join(dir, name), 'utf8');
    const slug = firstStringField(src, 'slug');
    if (!slug) continue;
    const description = firstStringField(src, 'description') || firstStringField(src, 'title') || slug;
    guides.push({ slug, description });
  }
  guides.sort((a, b) => a.slug.localeCompare(b.slug));
  return guides;
}

patch('robots.txt', [
  ['__SITE_ORIGIN__', siteUrl],
  ['https://example.com', siteUrl],
]);

patch('llms.txt', [
  ['__SITE_ORIGIN__', siteUrl],
  ['https://example.com', siteUrl],
]);

try {
  const onlyTools = loadToolSlugs();
  const guides = loadGuides();

  const toolLines = onlyTools.map((slug) => `- ${siteUrl}/tools/${slug}/`);
  const guideLines = guides.map(
    (g) => `- ${siteUrl}/guides/${g.slug}/ — ${g.description}`,
  );

  const llms = `# LocalFile Convert — ${siteUrl}/
# Privacy-first in-browser file converters. Your file never leaves your device.

## Summary
Niche professional format converters (YAML/JSON, CSV, images, STL, bank-statement PDF) that run entirely in the browser. No upload for conversion.

## Tools
${toolLines.join('\n')}

## Guides
- ${siteUrl}/guides/ — Guide index (format explainers and privacy-first conversion)
${guideLines.join('\n')}

## Trust
- ${siteUrl}/about/
- ${siteUrl}/methodology/
- ${siteUrl}/privacy/
- ${siteUrl}/authors/
`;
  write('llms.txt', llms);
  console.log(
    `postbuild: llms.txt → ${onlyTools.length} tools, ${guides.length} guides for ${siteUrl}`,
  );
} catch (e) {
  console.warn('postbuild: llms regenerate skipped:', e.message);
}

console.log(`postbuild: patched robots/llms for ${siteUrl}`);
