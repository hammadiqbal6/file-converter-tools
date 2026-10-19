#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const astro = path.join(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/astro/bin/astro.mjs');
const args = process.argv.slice(2);
const res = spawnSync('npx', ['--yes', '-p', 'node@22.22.0', '--', 'node', astro, ...args], {
  stdio: 'inherit',
  shell: false,
});
process.exit(res.status ?? 1);
