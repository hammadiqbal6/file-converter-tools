#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const dist = path.join(process.cwd(), 'dist');
const required = ['/about/', '/contact/', '/privacy/', '/terms/', '/methodology/'];
const errors = [];

function existsRoute(route) {
  const p = path.join(dist, route.replace(/^\//, ''), 'index.html');
  return fs.existsSync(p);
}

for (const r of required) {
  if (!existsRoute(r)) errors.push(`missing required page: ${r}`);
}

const privacy = fs.readFileSync(path.join(dist, 'privacy/index.html'), 'utf8');
const privacyText = cheerio.load(privacy)('body').text().toLowerCase();
if (!privacyText.includes('adsense') && !privacyText.includes('google')) {
  errors.push('privacy policy should mention Google/AdSense cookies');
}
if (!privacyText.includes('aboutads')) errors.push('privacy policy should link opt-out (aboutads / ads settings)');

if (!fs.existsSync(path.join(dist, 'ads.txt'))) errors.push('missing ads.txt');

// thin homepage check
const home = cheerio.load(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'));
const words = home('main').text().split(/\s+/).filter(Boolean).length;
if (words < 80) errors.push(`homepage too thin (${words} words)`);

console.log('AdSense readiness:', { errors: errors.length });
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  process.exit(1);
}
console.log('AdSense readiness passed.');
