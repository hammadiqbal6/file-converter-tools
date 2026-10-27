/**
 * Local UI/UX verification after audit fixes.
 * Checks: GA consent gating, Escape closes nav, axe AA light+dark, reduced-motion CSS.
 */
import { chromium, devices } from 'playwright';
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const axeSource = require('axe-core').source;

const BASE = process.env.VERIFY_BASE || 'http://127.0.0.1:4321';
const OUT = process.env.VERIFY_OUT || '/opt/cursor/artifacts/ui-ux-verify';
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'shots'), { recursive: true });

const pages = ['/', '/tools/csv-to-json/'];

function gaHits(reqs) {
  return reqs.filter((u) => /google-analytics\.com|googletagmanager\.com/i.test(u));
}

async function runAxe(page) {
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    // @ts-ignore
    const results = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });
    return {
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help,
        samples: v.nodes.slice(0, 3).map((n) => n.failureSummary || n.html?.slice(0, 120)),
      })),
    };
  });
}

async function shot(page, name) {
  const path = join(OUT, 'shots', `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

const report = { base: BASE, checks: [], axe: {}, screenshots: [] };
let failed = false;

const browser = await chromium.launch({ headless: true });

// --- Consent: no GA before Accept ---
{
  const context = await browser.newContext();
  await context.clearCookies();
  const page = await context.newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500); // banner defer window
  const before = gaHits(reqs);
  const bannerVisible = await page.locator('#cookie-banner.is-visible').isVisible().catch(() => false);
  const hasReject = (await page.locator('#cookie-reject').count()) > 0;
  const hasAccept = (await page.locator('#cookie-accept').count()) > 0;
  report.checks.push({
    id: 'no-ga-before-consent',
    pass: before.length === 0,
    detail: { gaRequests: before, bannerVisible, hasReject, hasAccept },
  });
  if (before.length) failed = true;
  if (!hasReject || !hasAccept) failed = true;

  report.screenshots.push(await shot(page, 'home-light-before-consent'));

  // Reject should still keep GA off
  if (hasReject) {
    const beforeReject = reqs.length;
    await page.locator('#cookie-reject').click();
    await page.waitForTimeout(1500);
    const afterReject = gaHits(reqs.slice(beforeReject));
    report.checks.push({
      id: 'no-ga-after-reject',
      pass: afterReject.length === 0,
      detail: { gaRequests: afterReject },
    });
    if (afterReject.length) failed = true;
  }
  await context.close();
}

// --- Accept loads GA ---
{
  const context = await browser.newContext();
  const page = await context.newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#cookie-accept', { state: 'visible', timeout: 8000 });
  await page.locator('#cookie-accept').click();
  await page.waitForTimeout(2500);
  const after = gaHits(reqs);
  report.checks.push({
    id: 'ga-after-accept',
    pass: after.length > 0,
    detail: { gaRequests: after.slice(0, 5) },
  });
  // Note: GA may be blocked by network policy in some VMs; treat as soft if blocked.
  if (after.length === 0) {
    report.checks[report.checks.length - 1].soft = true;
    report.checks[report.checks.length - 1].note =
      'No GA request observed after Accept (may be egress-blocked); script injection still verified below.';
    const injected = await page.evaluate(() => Boolean(window.__lfGaLoaded || window.gtag));
    report.checks.push({ id: 'ga-script-injected-after-accept', pass: injected, detail: { injected } });
    if (!injected) failed = true;
  }
  await context.close();
}

// --- Escape closes mobile menu ---
{
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#nav-toggle').click();
  const open = await page.locator('#site-nav').evaluate((el) => el.classList.contains('is-open'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const closed = await page.locator('#site-nav').evaluate((el) => !el.classList.contains('is-open'));
  const expanded = await page.locator('#nav-toggle').getAttribute('aria-expanded');
  const focused = await page.evaluate(() => document.activeElement?.id === 'nav-toggle');
  report.checks.push({
    id: 'escape-closes-menu',
    pass: open && closed && expanded === 'false' && focused,
    detail: { open, closed, expanded, focused },
  });
  if (!(open && closed && expanded === 'false' && focused)) failed = true;
  report.screenshots.push(await shot(page, 'home-mobile-menu-closed-after-escape'));
  await context.close();
}

// --- Reduced motion CSS present ---
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const rm = await page.evaluate(() => {
    const css = [...document.styleSheets]
      .flatMap((s) => {
        try {
          return [...s.cssRules].map((r) => r.cssText);
        } catch {
          return [];
        }
      })
      .join('\n');
    return /prefers-reduced-motion:\s*reduce/i.test(css);
  });
  report.checks.push({ id: 'reduced-motion-css', pass: rm });
  if (!rm) failed = true;
  await context.close();
}

// --- Axe light + dark on homepage and tool page ---
for (const path of pages) {
  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({
      colorScheme: scheme,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // Dismiss banner so it doesn't dominate screenshots / axe noise differently
    const accept = page.locator('#cookie-accept');
    if (await accept.isVisible().catch(() => false)) await accept.click();
    await page.waitForTimeout(300);
    const axe = await runAxe(page);
    const key = `${scheme}${path}`;
    report.axe[key] = axe;
    const contrast = axe.violations.filter((v) => v.id === 'color-contrast');
    const serious = axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact || ''));
    report.checks.push({
      id: `axe-${scheme}${path}`,
      pass: contrast.length === 0,
      detail: {
        contrastCount: contrast.length,
        seriousCount: serious.length,
        violations: axe.violations,
      },
    });
    if (contrast.length) failed = true;
    const slug = path === '/' ? 'home' : path.replace(/\//g, '_').replace(/^_|_$/g, '');
    report.screenshots.push(await shot(page, `${slug}-${scheme}`));
    await context.close();
  }
}

await browser.close();

const outPath = join(OUT, 'report.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ failed, outPath, checks: report.checks.map((c) => ({ id: c.id, pass: c.pass, soft: c.soft })) }, null, 2));
process.exit(failed ? 1 : 0);
