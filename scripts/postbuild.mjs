#!/usr/bin/env node
/**
 * Post-build: patch robots.txt / llms.txt origins from the single site URL setting.
 * Canonical origin = process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL (src/config/site.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load DEFAULT_SITE_URL without pulling Vite-only import.meta.env quirks:
// site.ts is ESM TypeScript — use the same fallback string via dynamic import after build,
// or read from a tiny shared constant. Prefer importing the built-free export via tsx-less path:
// duplicate read of the constant by evaluating the exported default through vitest-free regex
// from site.ts so this script stays dependency-free.
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

// robots.txt: replace placeholder (and any legacy baked hosts)
patch('robots.txt', [
  ['__SITE_ORIGIN__', siteUrl],
  ['https://example.com', siteUrl],
]);

// llms.txt is generated fully below when tools/guides are known; still patch placeholders
patch('llms.txt', [
  ['__SITE_ORIGIN__', siteUrl],
  ['https://example.com', siteUrl],
]);

// Prefer regenerating llms.txt from source data so every tool + guide is listed
try {
  // Lightweight parse: read tools.ts / guides.ts slugs without a TS loader
  const toolsSrc = fs.readFileSync(path.join(process.cwd(), 'src/data/tools.ts'), 'utf8');
  const guidesSrc = fs.readFileSync(path.join(process.cwd(), 'src/data/guides.ts'), 'utf8');
  const toolSlugs = [...toolsSrc.matchAll(/slug:\s*'([^']+)'/g)]
    .map((m) => m[1])
    .filter((s, i, arr) => arr.indexOf(s) === i && !s.includes('/'));
  // tools.ts also has category slugs — keep only those that appear as tool entries by
  // requiring nearby "name:" tool pattern: use lines after "export const tools"
  const toolsBlock = toolsSrc.split('export const tools')[1] || toolsSrc;
  const guideBlock = guidesSrc.split('export const guides')[1] || guidesSrc;
  const onlyTools = [...toolsBlock.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
  const onlyGuides = [...guideBlock.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);

  const toolLines = onlyTools.map(
    (slug) => `- ${siteUrl}/tools/${slug}/`,
  );
  const guideLines = onlyGuides.map(
    (slug) => `- ${siteUrl}/guides/${slug}/`,
  );

  const llms = `# LocalFile Convert — ${siteUrl}/
# Privacy-first in-browser file converters. Your file never leaves your device.

## Summary
Niche professional format converters (YAML/JSON, CSV, images, STL, bank-statement PDF) that run entirely in the browser. No upload for conversion.

## Tools
${toolLines.join('\n')}

## Guides
- ${siteUrl}/guides/
${guideLines.join('\n')}

## Trust
- ${siteUrl}/about/
- ${siteUrl}/methodology/
- ${siteUrl}/privacy/
- ${siteUrl}/authors/
`;
  write('llms.txt', llms);
  // Keep public/llms.txt as a placeholder template for the repo; dist is authoritative after build
} catch (e) {
  console.warn('postbuild: llms regenerate skipped:', e.message);
}

console.log(`postbuild: patched robots/llms for ${siteUrl}`);

// silence unused
void require;
