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
 * browser session. URLs come from design-kit/reference/capture-manifest.json.
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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(OUT, 'screens');
const ORIGIN = 'https://www.dubizzle.com.eg';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const manifest = JSON.parse(readFileSync(join(ROOT, 'design-kit/reference/capture-manifest.json'), 'utf8'));
const urls = Object.assign({}, ...Object.values(manifest.tiers));

const LAYOUTS = {
  desktop: {
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  },
  mobile: {
    // 390pt is the checklist's mobile width (iPhone 14/15). DPR 2 keeps PNGs a sane size.
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
};

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Lazy sections only mount when scrolled into view; walk the page once so they do. */
async function scrollThrough(page) {
  let lastHeight = 0;
  for (let step = 0; step < 60; step++) {
    const { y, height, vh } = await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.8);
      return { y: window.scrollY, height: document.documentElement.scrollHeight, vh: window.innerHeight };
    });
    await sleep(350);
    if (y + vh >= height - 2 && height === lastHeight) break;
    lastHeight = height;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
}

/**
 * A full-page screenshot keeps position:fixed elements where they sat in the first
 * viewport, so the mobile bottom nav lands mid-page over content, and drawers parked
 * just below the viewport (the location picker) render inline as if they were page
 * sections. Only for the screenshot — the saved HTML is taken before this runs:
 * - fixed elements entirely outside the viewport are closed drawers/sheets → hide
 * - fixed elements pinned to the bottom (bottom nav, contact bar) → move to page end
 * - other visible fixed elements (top bars) → pin at their document position
 */
async function settleFixedElements(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const counts = { hidden: 0, toBottom: 0, pinned: 0 };
    for (const el of document.querySelectorAll('body *')) {
      const style = getComputedStyle(el);
      if (style.position !== 'fixed' || style.display === 'none' || style.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      // Off-canvas is checked before size: the swipeable bottom sheet's fixed root is
      // zero-height and parked at top: 100vh, with its panel overflowing out of it.
      if (r.top >= vh - 1 || (r.bottom <= 1 && r.height > 0)) {
        el.style.setProperty('visibility', 'hidden', 'important');
        counts.hidden++;
      } else if (r.width === 0 || r.height === 0) {
        continue;
      } else if (r.bottom >= vh - 2 && r.top > vh / 2) {
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('top', `${docHeight - r.height}px`, 'important');
        el.style.setProperty('bottom', 'auto', 'important');
        counts.toBottom++;
      } else {
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('top', `${r.top + window.scrollY}px`, 'important');
        counts.pinned++;
      }
    }
    document.body.style.setProperty('position', 'relative', 'important');
    return counts;
  });
}

/**
 * Mobile web opens an app-install sheet ("Continue in App / Get App") over a dark
 * backdrop. It's a real first-visit screen, so it's saved on its own — then dismissed
 * via "Continue in Browser", which only closes the prompt, so the page capture isn't
 * dimmed. Returns whether one was found.
 */
async function captureAndDismissInterstitial(page, base) {
  const target = await page.evaluateHandle(() =>
    [...document.querySelectorAll('button, a, [role="button"], div, span')].find((el) => {
      if (el.textContent.trim() !== 'Continue in Browser') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    }),
  );
  const element = target.asElement();
  if (!element) return false;
  await page.screenshot({ path: join(SCREENS, `${base}.app-prompt.png`) });
  await element.click();
  await sleep(1200);
  return true;
}

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
      try {
        await page.setUserAgent(userAgent);
        await page.setViewport(viewport);
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });

        const response = await page.goto(ORIGIN + urls[name], { waitUntil: 'networkidle2', timeout: 90_000 });
        const status = response?.status() ?? 0;
        if (status !== 200 || /\/notfound\b/.test(page.url())) {
          results.push({ name, layout, status: 'FAILED', detail: `HTTP ${status} at ${page.url()}` });
          continue;
        }

        const base = `${name}.${layout}`;
        await sleep(1500);
        const hadPrompt = layout === 'mobile' && (await captureAndDismissInterstitial(page, base));

        await scrollThrough(page);
        await page.waitForNetworkIdle({ idleTime: 800, timeout: 20_000 }).catch(() => {});

        const facts = await page.evaluate(() => ({
          h1: document.querySelector('h1')?.textContent.trim() ?? null,
          text: document.body.innerText.length,
          height: document.documentElement.scrollHeight,
        }));
        if (facts.text < 800) {
          results.push({ name, layout, status: 'FAILED', detail: `only ${facts.text} chars of visible text` });
          continue;
        }

        writeFileSync(join(OUT, `${base}.html`), absolutize(await page.content(), ORIGIN));
        const settled = await settleFixedElements(page);
        await page.screenshot({ path: join(SCREENS, `${base}.png`), fullPage: true });

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

for (const r of results) console.log(`${r.status.padEnd(6)}  ${`${r.name}.${r.layout}`.padEnd(24)} ${r.detail}`);
const failed = results.filter((r) => r.status === 'FAILED').length;
console.log(`\n${results.length - failed} rendered, ${failed} failed · screenshots in design-kit/reference/live/screens/`);
process.exit(failed ? 1 : 0);
