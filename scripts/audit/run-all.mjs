#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const steps = [
  'seo-audit.mjs',
  'seo-guardrails.mjs',
  'page-checklist.mjs',
  'adsense-audit.mjs',
  'bundle-audit.mjs',
  '../link-check.mjs',
];

for (const step of steps) {
  console.log(`\n=== ${step} ===`);
  const res = spawnSync('node', [path.join(dir, step)], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status ?? 1);
}
console.log('\nAll audits passed.');
