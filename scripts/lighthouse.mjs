#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url?.split('?')[0] || '/');
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  else if (!path.extname(urlPath)) urlPath = path.join(urlPath, 'index.html');
  const file = path.join(dist, urlPath.replace(/^\//, ''));
  if (!fs.existsSync(file)) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }
  res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
process.env.LHCI_SERVER_PORT = String(port);

// Rewrite lhci urls to actual port
const cfgPath = path.join(process.cwd(), 'lighthouserc.cjs');
const cfg = fs.readFileSync(cfgPath, 'utf8');
const tmp = cfg.replace(/http:\/\/localhost/g, `http://127.0.0.1:${port}`);
const tmpPath = path.join(process.cwd(), 'lighthouserc.tmp.cjs');
fs.writeFileSync(tmpPath, tmp);

const res = spawnSync('npx', ['lhci', 'autorun', '--config', tmpPath], { stdio: 'inherit', env: process.env });
server.close();
fs.unlinkSync(tmpPath);
process.exit(res.status ?? 1);
