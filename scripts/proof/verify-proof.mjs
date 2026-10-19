#!/usr/bin/env node
/**
 * CI-safe check: build, test, audit, and validate committed docs/proof/ (no Lighthouse/Playwright).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');
const proof = path.join(root, 'docs/proof');

const REQUIRED_LH = [
  'home-mobile',
  'hub-data-mobile',
  'hub-documents-mobile',
  'hub-images-mobile',
  'hub-cad-mobile',
  'tool-yaml-json-mobile',
  'tool-json-to-csv-mobile',
  'tool-psd-to-png-mobile',
  'tool-stl-to-obj-mobile',
  'tool-pdf-bank-mobile',
];

const SCREENSHOTS = [
  'home-360.png',
  'home-768.png',
  'hub-data-360.png',
  'hub-data-768.png',
  'tool-yaml-json-360.png',
  'tool-yaml-json-768.png',
  'tool-psd-to-png-360.png',
  'tool-psd-to-png-768.png',
  'tool-stl-to-obj-360.png',
  'tool-stl-to-obj-768.png',
];

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  return res.status ?? 1;
}

function mustExist(rel, errors) {
  const p = path.join(proof, rel);
  if (!fs.existsSync(p)) errors.push(`Missing ${rel}`);
}

function main() {
  const errors = [];

  console.log('=== verify: npm test ===');
  if (run('npm', ['test']) !== 0) process.exit(1);

  console.log('=== verify: npm run build ===');
  if (run('npm', ['run', 'build']) !== 0) process.exit(1);

  console.log('=== verify: npm run audit ===');
  if (run('npm', ['run', 'audit']) !== 0) process.exit(1);

  console.log('=== verify: docs/proof artifacts ===');
  for (const f of [
    'README.md',
    'tests.txt',
    'seo-audit.txt',
    'bundle-size.txt',
    'sitemap-robots.txt',
    'adsense-readiness.md',
    'lighthouse/summary.md',
    'structured-data/extracted.json',
    'structured-data/validation.json',
    'mobile/viewport-check.txt',
  ]) {
    mustExist(f, errors);
  }

  for (const id of REQUIRED_LH) {
    mustExist(`lighthouse/${id}.report.json`, errors);
    mustExist(`lighthouse/${id}.report.html`, errors);
  }

  for (const shot of SCREENSHOTS) {
    mustExist(`mobile/${shot}`, errors);
  }

  const readme = fs.readFileSync(path.join(proof, 'README.md'), 'utf8');
  if (!readme.includes('**Overall:** PASS')) {
    errors.push('docs/proof/README.md must show Overall: PASS (re-run npm run proof locally)');
  }

  const summary = fs.readFileSync(path.join(proof, 'lighthouse', 'summary.md'), 'utf8');
  if (summary.includes('| FAIL |') || /\| [^|]+ \| FAIL \|/.test(summary)) {
    errors.push('lighthouse/summary.md contains FAIL rows');
  }

  const validation = JSON.parse(fs.readFileSync(path.join(proof, 'structured-data/validation.json'), 'utf8'));
  if (validation.failed?.length) {
    errors.push(`structured-data/validation.json has ${validation.failed.length} failure(s)`);
  }

  if (errors.length) {
    console.error('\nProof verify failed:\n' + errors.map((e) => ` - ${e}`).join('\n'));
    process.exit(1);
  }

  console.log('\nProof verify passed (committed artifacts + build/test/audit).');
}

main();
