#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dist = path.join(process.cwd(), 'dist');
const outDir = path.join(process.cwd(), 'artifacts', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const server = spawn('npx', ['--yes', 'serve', dist, '-l', '4321'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

const base = 'http://127.0.0.1:4321';
const pages = [
  { name: 'home-360', url: '/', width: 360 },
  { name: 'hub-data-360', url: '/category/data/', width: 360 },
  { name: 'tool-yaml-json-360', url: '/tools/yaml-to-json/', width: 360 },
  { name: 'tool-psd-360', url: '/tools/psd-to-png/', width: 360 },
  { name: 'home-390', url: '/', width: 390 },
];

const browser = await chromium.launch();
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: p.width, height: 800 } });
  await page.goto(base + p.url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true });
  await page.close();
}
await browser.close();
server.kill();
console.log('Screenshots saved to', outDir);
