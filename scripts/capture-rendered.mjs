#!/usr/bin/env node
/**
 * Renders live dubizzle.com.eg pages in real Chrome and saves both the rendered DOM and
 * a full-page screenshot, for pages that a plain HTTP fetch can't capture:
 *
 * - /en/motors/ and /en/motors/car-finance/ are a separate Next.js app whose content is
 *   built client-side — the server HTML is an empty shell.
 * - Ad detail pages lazy-load their gallery, specs and similar-ads after first paint.
 *
 * Uses the system Chrome with a throwaway profile, so it never touches the user's own
 * browser session. Logged-in screens use capture-account.mjs instead. URLs come from
 * design-kit/reference/capture-manifest.json.
 *
 *   npm run capture:rendered -- home motors property car-dpv
 *   npm run capture:rendered -- motors --layout=mobile
 */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { absolutize } from './lib/absolutize.mjs';
import { recordResponses, snapshotHtml } from './lib/snapshot.mjs';
import { buildGallery } from './build-screens-gallery.mjs';
import {
  ORIGIN,
  LAYOUTS,
  sleep,
  scrollThrough,
  settleFixedElements,
  captureAndDismissInterstitial,
  removePushPrompt,
} from './lib/render-helpers.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(OUT, 'screens');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const manifest = JSON.parse(readFileSync(join(ROOT, 'design-kit/reference/capture-manifest.json'), 'utf8'));
const urls = Object.assign({}, ...Object.values(manifest.tiers));

/** Pages that legitimately aren't HTTP 200, and pages captured with a dialog opened. */
const EXPECTED_STATUS = { 'not-found': 404 };
const OPEN_DIALOG = { login: /^(Login or Signup|Login or Sign up|Login|Log in)$/i };
/** Short pages whose text-length sanity check needs a lower bar. */
const MIN_TEXT = { 'not-found': 100, 'seller-page': 300 };

const args = process.argv.slice(2);
const layoutArg = args.find((a) => a.startsWith('--layout='))?.split('=')[1];
const layouts = layoutArg ? [layoutArg] : Object.keys(LAYOUTS);
const names = args.filter((a) => !a.startsWith('--'));

if (!names.length) {
  console.error('Name the pages to render, e.g.: npm run capture:rendered -- home motors car-dpv');
  process.exit(2);
}
const unknown = names.filter((n) => !urls[n]);
if (unknown.length) {
  console.error(`Not in capture-manifest.json: ${unknown.join(', ')}`);
  process.exit(2);
}

mkdirSync(SCREENS, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), 'dbz-capture-'));
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  userDataDir: profile,
  args: ['--no-first-run', '--no-default-browser-check', '--lang=en-US'],
});

const results = [];
try {
  for (const name of names) {
    for (const layout of layouts) {
      const { viewport, userAgent } = LAYOUTS[layout];
      const page = await browser.newPage();
      const base = `${name}.${layout}`;
      try {
        await page.setUserAgent(userAgent);
        await page.setViewport(viewport);
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });
        const recorder = recordResponses(page);

        const response = await page.goto(ORIGIN + urls[name], { waitUntil: 'networkidle2', timeout: 90_000 });
        const status = response?.status() ?? 0;
        if (status !== (EXPECTED_STATUS[name] ?? 200) || (!EXPECTED_STATUS[name] && /\/notfound\b/.test(page.url()))) {
          results.push({ name, layout, status: 'FAILED', detail: `HTTP ${status} at ${page.url()}` });
          continue;
        }

        await sleep(1500);
        const hadPrompt =
          layout === 'mobile' && (await captureAndDismissInterstitial(page, join(SCREENS, `${base}.app-prompt.png`)));

        if (OPEN_DIALOG[name]) {
          const opened = await page.evaluate((source) => {
            const re = new RegExp(source, 'i');
            const target = [...document.querySelectorAll('a, button, [role="button"], span, div')].find(
              (el) => (re.test(el.textContent.trim()) || re.test(el.getAttribute('aria-label') || '')) && el.getBoundingClientRect().height > 0 && el.children.length <= 2,
            );
            target?.click();
            return Boolean(target);
          }, OPEN_DIALOG[name].source);
          if (!opened) {
            results.push({ name, layout, status: 'FAILED', detail: 'dialog trigger not found' });
            continue;
          }
          await sleep(2500);
          await page.waitForNetworkIdle({ idleTime: 800, timeout: 20_000 }).catch(() => {});
        } else {
          await scrollThrough(page);
          await page.waitForNetworkIdle({ idleTime: 800, timeout: 20_000 }).catch(() => {});
        }

        const facts = await page.evaluate(() => ({
          h1: document.querySelector('h1')?.textContent.trim() ?? null,
          text: document.body.innerText.length,
          height: document.documentElement.scrollHeight,
        }));
        if (facts.text < (MIN_TEXT[name] ?? 800)) {
          results.push({ name, layout, status: 'FAILED', detail: `only ${facts.text} chars of visible text` });
          continue;
        }

        await removePushPrompt(page);
        writeFileSync(join(OUT, `${base}.html`), absolutize(await snapshotHtml(page, recorder), ORIGIN));
        // Dialog screens are one viewport: a full-page shot re-lays the fixed dialog out of view.
        const settled = OPEN_DIALOG[name] ? { hidden: 0, toBottom: 0, pinned: 0 } : await settleFixedElements(page);
        await page.screenshot({ path: join(SCREENS, `${base}.png`), fullPage: !OPEN_DIALOG[name] });

        results.push({
          name,
          layout,
          status: 'saved',
          detail:
            `${facts.text.toLocaleString()} chars · ${facts.height}px tall · h1: ${facts.h1?.slice(0, 40) ?? '—'}` +
            ` · fixed: ${settled.hidden} hidden, ${settled.toBottom} to bottom, ${settled.pinned} pinned` +
            (hadPrompt ? ' · app prompt saved + dismissed' : ''),
        });
      } catch (error) {
        results.push({ name, layout, status: 'FAILED', detail: error.message.split('\n')[0] });
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  rmSync(profile, { recursive: true, force: true });
}

buildGallery();
for (const r of results) console.log(`${r.status.padEnd(6)}  ${`${r.name}.${r.layout}`.padEnd(24)} ${r.detail}`);
const failed = results.filter((r) => r.status === 'FAILED').length;
console.log(`\n${results.length - failed} rendered, ${failed} failed · screenshots in design-kit/reference/live/screens/`);
process.exit(failed ? 1 : 0);
