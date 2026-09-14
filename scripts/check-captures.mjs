#!/usr/bin/env node
/**
 * Capture fidelity check: a saved page is only useful as ground truth if the HTML renders
 * like the live page did. For every live screenshot in reference/live/screens/, this opens
 * the saved HTML at the same layout, screenshots it, and compares the two pixel by pixel.
 *
 * Writes the re-render to screens/_check/<name>.<layout>.png and a report to
 * screens/_check/report.json. Needs the kit server (npm run kit).
 *
 *   npm run check:captures                  # all
 *   npm run check:captures -- home car-dpv  # some
 *   npm run check:templates                 # live templates (design-kit/templates) vs the same screenshots
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { LAYOUTS, sleep, settleFixedElements } from './lib/render-helpers.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(LIVE, 'screens');
const CHECK = join(SCREENS, '_check');
const KIT = process.env.KIT_URL || 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
/** Share of pixels allowed to differ (after downscaling) before a capture counts as broken. */
const TOLERANCE = 0.03;
/** Screens captured with a dialog open are compared at viewport size (see capture-rendered.mjs). */
const VIEWPORT_ONLY = new Set(['login']);

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const TEMPLATE_MODE = process.argv.includes('--templates');
const TEMPLATES = join(ROOT, 'design-kit/templates');

/** Each check: the page to render, the live screenshot it must match, and a report key. */
let checks;
if (TEMPLATE_MODE) {
  const { templates } = JSON.parse(readFileSync(join(TEMPLATES, 'live-templates.json'), 'utf8'));
  checks = Object.entries(templates).flatMap(([name, { capture }]) =>
    ['desktop', 'mobile']
      .filter((layout) => existsSync(join(TEMPLATES, layout, `${name}.html`)) && existsSync(join(SCREENS, `${capture}.${layout}.png`)))
      .filter(() => !only.length || only.includes(name))
      .map((layout) => ({ base: `${name}.${layout}`, layout, url: `/templates/${layout}/${name}.html`, png: `${capture}.${layout}` })),
  );
} else {
  checks = readdirSync(SCREENS)
    .filter((f) => /^[\w-]+\.(desktop|mobile)\.png$/.test(f))
    .map((f) => f.replace(/\.png$/, ''))
    .filter((base) => !only.length || only.includes(base.split('.')[0]))
    .filter((base) => existsSync(join(LIVE, `${base}.html`)))
    .map((base) => ({ base, layout: base.split('.')[1], url: `/reference/live/${base}.html`, png: base }));
}

mkdirSync(CHECK, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'dbz-fidelity-'));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, userDataDir: profile });

/** Compare two PNGs in the browser: both scaled to the same width, diff = share of pixels off by >32 in any channel. */
async function compare(page, a, b) {
  return page.evaluate(
    async (a, b) => {
      const load = (src) =>
        new Promise((ok, fail) => {
          const img = new Image();
          img.onload = () => ok(img);
          img.onerror = fail;
          img.src = src;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const W = 240;
      const ha = Math.round((ia.height / ia.width) * W);
      const hb = Math.round((ib.height / ib.width) * W);
      const H = Math.min(ha, hb, 8000);
      const px = (img, h) => {
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        c.getContext('2d').drawImage(img, 0, 0, W, h);
        return c.getContext('2d').getImageData(0, 0, W, H).data;
      };
      const da = px(ia, ha);
      const db = px(ib, hb);
      let off = 0;
      const rows = new Array(H).fill(0);
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) > 32 || Math.abs(da[i + 1] - db[i + 1]) > 32 || Math.abs(da[i + 2] - db[i + 2]) > 32) {
          off++;
          rows[Math.floor(i / 4 / W)]++;
        }
      }
      // first stretch where most of a row differs — where the page starts to diverge
      const firstBad = rows.findIndex((n) => n > W * 0.25);
      return { diff: off / (W * H), liveHeight: ia.height, renderHeight: ib.height, firstBadAt: firstBad < 0 ? null : firstBad / H };
    },
    a,
    b,
  );
}

const results = [];
const cmp = await browser.newPage();
await cmp.goto(`${KIT}/reference/capture-manifest.json`); // same origin as the PNGs, so the canvas isn't tainted
for (const { base, layout, url, png } of checks) {
  const { viewport, userAgent } = LAYOUTS[layout];
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  let navigatedAway = false;
  page.on('framenavigated', (f) => {
    if (f === page.mainFrame() && !f.url().startsWith(KIT) && f.url() !== 'about:blank') navigatedAway = f.url();
  });
  try {
    await page.setUserAgent(userAgent);
    await page.setViewport(viewport);
    await page.goto(`${KIT}${url}`, { waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(1500);
    const dialog = VIEWPORT_ONLY.has(base.split('.')[0]);
    if (!dialog) await settleFixedElements(page);
    const out = join(CHECK, `${base}.png`);
    await page.screenshot({ path: out, fullPage: !dialog });
    const r = await compare(cmp, `${KIT}/reference/live/screens/${png}.png`, `${KIT}/reference/live/screens/_check/${base}.png`);
    const heightRatio = r.renderHeight / r.liveHeight;
    const ok = r.diff <= TOLERANCE && Math.abs(1 - heightRatio) < 0.05 && !navigatedAway;
    results.push({ base, ok, diff: +(r.diff * 100).toFixed(1), heightRatio: +heightRatio.toFixed(2), firstBadAt: r.firstBadAt, navigatedAway, errors: errors.slice(0, 3) });
  } catch (error) {
    results.push({ base, ok: false, error: error.message.split('\n')[0], navigatedAway, errors: errors.slice(0, 3) });
  } finally {
    await page.close();
  }
}
await browser.close();
rmSync(profile, { recursive: true, force: true });

writeFileSync(join(CHECK, TEMPLATE_MODE ? 'templates-report.json' : 'report.json'), JSON.stringify(results, null, 2));
if (TEMPLATE_MODE) writeFileSync(join(TEMPLATES, '_live/fidelity.json'), JSON.stringify(results.map(({ base, ok, diff }) => ({ base, ok, diff })), null, 2));
for (const r of results) {
  const where = r.firstBadAt == null ? '' : ` · diverges from ${Math.round(r.firstBadAt * 100)}% down`;
  const detail = r.error ?? `${r.diff}% pixels differ · height ×${r.heightRatio}${where}${r.navigatedAway ? ` · NAVIGATED to ${r.navigatedAway}` : ''}${r.errors.length ? ` · ${r.errors.length}+ JS errors` : ''}`;
  console.log(`${r.ok ? 'ok    ' : 'BROKEN'}  ${r.base.padEnd(32)} ${detail}`);
}
const broken = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - broken} faithful, ${broken} broken · re-renders in design-kit/reference/live/screens/_check/`);
process.exit(broken ? 1 : 0);
