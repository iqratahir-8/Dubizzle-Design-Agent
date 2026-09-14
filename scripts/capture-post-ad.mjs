#!/usr/bin/env node
/**
 * Captures the Post an Ad flow, desktop and mobile, from the signed-in capture window:
 *
 *   post-category      /en/post — choose a category
 *   post-subcategory   Vehicles → its subcategories
 *   post-details       Cars for Sale → the empty details form (/en/post/attributes)
 *   post-details-filled the same form with sample data typed in — ready to post, never posted
 *   upsell             the packages page linked from My Ads ("Heavy discount on Packages")
 *
 * NEVER PUBLISHES. Two independent guards:
 *   1. The script never clicks Post now / Post / Submit / Pay / Republish / Remove.
 *   2. Every non-GET request is aborted for the whole run, so even an accidental click cannot
 *      create, save, draft, pay or send anything (analytics beacons are blocked too).
 * Personal data goes through the same two-layer redaction and leak gate as capture-account.mjs;
 * the form's Name and Mobile Phone fields are overwritten with sample values.
 *
 *   npm run capture:post-ad                    # all steps, both layouts
 *   npm run capture:post-ad -- --layout=mobile
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolutize } from './lib/absolutize.mjs';
import { recordResponses, snapshotHtml } from './lib/snapshot.mjs';
import { buildGallery } from './build-screens-gallery.mjs';
import { ORIGIN, LAYOUTS, sleep, scrollThrough, settleFixedElements, captureAndDismissInterstitial, removePushPrompt } from './lib/render-helpers.mjs';
import { SAMPLE, readAccountIdentity, redactPage, sanitizeHtml, leaks, visibleLeaks } from './lib/redact.mjs';
import { connectToSession, isSignedIn } from './capture-session.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(OUT, 'screens');

const layoutArg = process.argv.find((a) => a.startsWith('--layout='))?.split('=')[1];
const layouts = layoutArg ? [layoutArg] : Object.keys(LAYOUTS);

/** Labels this script must never activate. Checked before every click. */
const FORBIDDEN = /^(post now|post|post your ad|submit|publish|pay|pay now|buy|republish|remove|delete|send|save|save changes|continue to payment)$/i;

mkdirSync(SCREENS, { recursive: true });
const browser = await connectToSession();

const probe = await browser.newPage();
await probe.goto(`${ORIGIN}/en/`, { waitUntil: 'networkidle2', timeout: 90_000 });
await sleep(2000);
if (!(await isSignedIn(probe))) {
  console.error('The capture window is signed out. Sign in there, then run: npm run capture:login -- --check');
  process.exit(1);
}
const identity = await readAccountIdentity(probe, ORIGIN);
await probe.close();
if (!identity?.fullName) {
  console.error('Could not read the account name to redact it — refusing to capture.');
  process.exit(1);
}

async function clickText(page, text) {
  if (FORBIDDEN.test(text)) throw new Error(`refusing to click "${text}"`);
  return page.evaluate((text) => {
    const el = [...document.querySelectorAll('a, button, [role="button"], li, div, span, label')]
      .filter((e) => e.getBoundingClientRect().height > 0 && e.textContent.trim() === text)
      .pop();
    el?.click();
    return Boolean(el);
  }, text);
}

/** Types into the input/textarea whose placeholder matches. Returns whether it was found. */
async function typeInto(page, placeholder, value) {
  const handle = await page.evaluateHandle((placeholder) => {
    return [...document.querySelectorAll('input, textarea')].find((e) => (e.getAttribute('placeholder') || '').toLowerCase().startsWith(placeholder.toLowerCase()) && e.getBoundingClientRect().height > 0) ?? null;
  }, placeholder);
  const el = handle.asElement();
  if (!el) return false;
  await el.click({ clickCount: 3 });
  await el.type(value, { delay: 15 });
  return true;
}

/** Opens a dropdown-style input and picks the first option offered. */
async function pickFirst(page, placeholder) {
  if (!(await typeInto(page, placeholder, ''))) return false;
  await sleep(700);
  return page.evaluate(() => {
    const option = [...document.querySelectorAll('[role="option"], li')].find((e) => {
      const r = e.getBoundingClientRect();
      return r.height > 0 && r.height < 80 && e.textContent.trim() && !/^(post|submit|pay)/i.test(e.textContent.trim());
    });
    option?.click();
    return Boolean(option);
  });
}

/** Dropdown pickers open as modal sheets with a dark backdrop — close whatever is still open. */
async function closeOverlays(page) {
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Escape');
    await sleep(300);
  }
  await page.evaluate(() => {
    document.activeElement?.blur();
    // Any remaining full-screen backdrop: click its empty edge, which closes it without choosing anything.
    const backdrop = [...document.querySelectorAll('body *')].find((e) => {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return s.position === 'fixed' && r.width >= innerWidth - 2 && r.height >= innerHeight - 2 && /rgba\(0, 0, 0, 0\.[2-9]/.test(s.backgroundColor);
    });
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: innerHeight - 5 }));
  });
  await sleep(600);
}

async function fillSampleCar(page) {
  const filled = [];
  const step = async (label, fn) => {
    try {
      if (await fn()) filled.push(label);
    } catch {
      /* optional field — skip */
    }
    await sleep(400);
  };
  await step('brand', async () => {
    if (!(await typeInto(page, 'Enter brand', 'Toyota'))) return false;
    await sleep(1200);
    return page.evaluate(() => {
      const option = [...document.querySelectorAll('[role="option"], li, div')].find((e) => /^Toyota\b/.test(e.textContent.trim()) && e.children.length <= 3 && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 80 && !e.matches('input'));
      option?.click();
      return Boolean(option);
    });
  });
  await step('year', () => typeInto(page, 'Enter year', '2020'));
  await step('condition', () => clickText(page, 'Used'));
  await step('kilometers', () => typeInto(page, 'Enter kilometers', '85000'));
  await step('fuel', () => pickFirst(page, 'Select fuel type'));
  await step('transmission', () => clickText(page, 'Automatic'));
  await step('body', () => pickFirst(page, 'Select body type'));
  await step('color', () => pickFirst(page, 'Select color'));
  await step('title', () => typeInto(page, 'Enter title', 'Toyota Corolla 2020 — first owner, full service history'));
  await step('description', () => typeInto(page, 'Describe the item', 'Sample listing for the design system. Well maintained, original paint, all services at the agency.'));
  await step('price', () => typeInto(page, 'Enter Price', '950000'));
  await step('name', () => typeInto(page, 'Enter name', SAMPLE.fullName));
  await step('phone', () => typeInto(page, 'Enter phone number', SAMPLE.phone.replace(/\s/g, '')));
  await closeOverlays(page);
  return filled;
}

const results = [];
for (const layout of layouts) {
  const { viewport, userAgent } = LAYOUTS[layout];
  const page = await browser.newPage();
  const blocked = new Set();
  try {
    await page.setUserAgent(userAgent);
    await page.setViewport(viewport);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return request.continue();
      blocked.add(new URL(request.url()).host);
      return request.abort();
    });
    const recorder = recordResponses(page);

    const save = async (slug, { fullPage = true } = {}) => {
      // Don't freeze a page mid-load: the packages page shows a full-screen "Loading..." overlay.
      await page
        .waitForFunction(() => ![...document.querySelectorAll('body *')].some((e) => e.children.length === 0 && /^loading\.*$/i.test(e.textContent.trim()) && e.getBoundingClientRect().height > 0), { timeout: 30_000 })
        .catch(() => {});
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 15_000 }).catch(() => {});
      await removePushPrompt(page);
      await redactPage(page, identity);
      const html = sanitizeHtml(absolutize(await snapshotHtml(page, recorder, { inlineImages: false, restoreScroll: false }), ORIGIN), identity);
      const leaked = leaks(html, identity);
      if (leaked.length) {
        results.push({ base: `${slug}.${layout}`, status: 'FAILED', detail: `refused to save — still contains: ${leaked.join(', ')}` });
        return;
      }
      if (fullPage) await settleFixedElements(page);
      await redactPage(page, identity);
      const onScreen = await visibleLeaks(page, identity);
      if (onScreen.length) {
        results.push({ base: `${slug}.${layout}`, status: 'FAILED', detail: `refused — still visible on screen: ${onScreen.join(', ')}` });
        return;
      }
      writeFileSync(join(OUT, `${slug}.${layout}.html`), html);
      await page.screenshot({ path: join(SCREENS, `${slug}.${layout}.png`), fullPage });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      results.push({ base: `${slug}.${layout}`, status: 'saved', detail: `${height}px tall · ${page.url().replace(ORIGIN, '')}` });
    };

    await page.goto(`${ORIGIN}/en/post`, { waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(2000);
    if (layout === 'mobile') await captureAndDismissInterstitial(page, null);
    await save('post-category');

    if (!(await clickText(page, 'Vehicles'))) throw new Error('Vehicles category not found');
    await sleep(2000);
    await save('post-subcategory');

    if (!(await clickText(page, 'Cars for Sale'))) throw new Error('Cars for Sale not found');
    await page.waitForFunction(() => location.pathname.includes('/post/attributes'), { timeout: 30_000 });
    await sleep(2500);
    await scrollThrough(page);
    await save('post-details');

    const filled = await fillSampleCar(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    await save('post-details-filled');
    results.at(-1).detail += ` · filled: ${filled.join(', ')}`;

    await page.goto(`${ORIGIN}/en/payments/businesspackages/myads-banner`, { waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(2500);
    await save('upsell-select', { fullPage: false });
    // Choosing a category only filters which packages are shown — nothing is bought.
    // The two pickers are native <select>s: category, then subcategory (filled once a category is chosen).
    for (const [index, label] of [[0, 'Vehicles'], [1, 'Cars for Sale']]) {
      const value = await page.evaluate((index, label) => {
        const select = document.querySelectorAll('select')[index];
        return [...(select?.options ?? [])].find((o) => o.textContent.trim() === label)?.value ?? null;
      }, index, label);
      if (value != null) {
        await page.evaluate((index, value) => {
          const select = document.querySelectorAll('select')[index];
          const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
          setter.call(select, value);
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }, index, value);
      }
      await sleep(1200);
    }
    if (await clickText(page, 'Show packages')) {
      await sleep(3500);
      await scrollThrough(page);
      await save('upsell');
    } else {
      results.push({ base: `upsell.${layout}`, status: 'FAILED', detail: 'Show packages button not found' });
    }
  } catch (error) {
    results.push({ base: `post-ad.${layout}`, status: 'FAILED', detail: error.message.split('\n')[0] });
  } finally {
    await page.close();
  }
  results.push({ base: `(${layout})`, status: 'info', detail: `blocked non-GET requests to: ${[...blocked].join(', ') || 'none'}` });
}

await browser.disconnect();
buildGallery();
for (const r of results) console.log(`${r.status.padEnd(6)}  ${r.base.padEnd(30)} ${r.detail}`);
const failed = results.filter((r) => r.status === 'FAILED').length;
process.exit(failed ? 1 : 0);
