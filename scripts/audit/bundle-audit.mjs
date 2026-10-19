#!/usr/bin/env node
/**
 * Initial JS budget per HTML page: sum gzip sizes of module scripts in HTML (not lazy chunks).
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as cheerio from 'cheerio';

const dist = path.join(process.cwd(), 'dist');
const MAX_GZIP_BYTES = 50 * 1024;
const errors = [];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === 'index.html') files.push(p);
  }
  return files;
}

function gzipSize(buf) {
  return zlib.gzipSync(buf).length;
}

for (const file of walk(dist)) {
  const rel = path.relative(dist, file);
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
  let total = 0;
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (!src || !src.startsWith('/')) return;
    const asset = path.join(dist, src.replace(/^\//, ''));
    if (fs.existsSync(asset)) total += gzipSize(fs.readFileSync(asset));
  });
  if (total > MAX_GZIP_BYTES) {
    errors.push(`${rel}: initial JS gzip ${total} bytes > ${MAX_GZIP_BYTES}`);
  }
}

console.log('Bundle audit:', { maxGzip: MAX_GZIP_BYTES, failures: errors.length });
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  process.exit(1);
}
console.log('Bundle audit passed.');
