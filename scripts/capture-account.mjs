#!/usr/bin/env node
/**
 * Captures logged-in dubizzle.com.eg screens (My Ads, Chats, Edit Profile, Settings,
 * packages) in desktop and mobile, from the signed-in capture window opened by
 * `npm run capture:login`. Every capture is redacted twice (see lib/redact.mjs) and is
 * refused outright if the account name or any script tag survives.
 *
 * Read-only by construction: the script only navigates, scrolls and reads. It never
 * clicks inside page content — no Post now, Remove, Republish, Save, Send or Pay — so it
 * cannot change the account. Opening a chat thread would mark it read, so threads are
 * not opened here.
 *
 *   npm run capture:account                     # all screens, both layouts
 *   npm run capture:account -- my-ads chat      # named screens
 *   npm run capture:account -- --layout=mobile
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolutize } from './lib/absolutize.mjs';
import { buildGallery } from './build-screens-gallery.mjs';
import { ORIGIN, LAYOUTS, sleep, scrollThrough, settleFixedElements, captureAndDismissInterstitial } from './lib/render-helpers.mjs';
import { readAccountIdentity, redactPage, sanitizeHtml, leaks } from './lib/redact.mjs';
import { connectToSession, isSignedIn } from './capture-session.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(OUT, 'screens');

export const ACCOUNT_SCREENS = {
  'my-ads': '/en/myads',
  chat: '/en/chat',
  'edit-profile': '/en/editProfile/info',
  'settings-privacy': '/en/settings/privacy',
  'settings-notifications': '/en/settings/notifications',
  packages: '/en/payments/businesspackages/my-account',
};

const args = process.argv.slice(2);
const layoutArg = args.find((a) => a.startsWith('--layout='))?.split('=')[1];
const layouts = layoutArg ? [layoutArg] : Object.keys(LAYOUTS);
const names = args.filter((a) => !a.startsWith('--'));
const selected = names.length ? names : Object.keys(ACCOUNT_SCREENS);
const unknown = selected.filter((n) => !ACCOUNT_SCREENS[n]);
if (unknown.length) {
  console.error(`Unknown screen(s): ${unknown.join(', ')}. Known: ${Object.keys(ACCOUNT_SCREENS).join(', ')}`);
  process.exit(2);
}

mkdirSync(SCREENS, { recursive: true });
const browser = await connectToSession();

// Identity is read once from a desktop page, where the header shows the name.
const probe = await browser.newPage();
await probe.setViewport(LAYOUTS.desktop.viewport);
await probe.goto(`${ORIGIN}/en/`, { waitUntil: 'networkidle2', timeout: 90_000 });
await sleep(2000);
if (!(await isSignedIn(probe))) {
  console.error('The capture window is signed out. Sign in there, then run: npm run capture:login -- --check');
  await probe.close();
  await browser.disconnect();
  process.exit(1);
}
const identity = await readAccountIdentity(probe, ORIGIN);
await probe.close();
if (!identity?.fullName) {
  console.error('Could not read the account name to redact it — refusing to capture unredacted screens.');
  await browser.disconnect();
  process.exit(1);
}

const results = [];
for (const name of selected) {
  for (const layout of layouts) {
    const { viewport, userAgent } = LAYOUTS[layout];
    const base = `${name}.${layout}`;
    const page = await browser.newPage();
    try {
      await page.setUserAgent(userAgent);
      await page.setViewport(viewport);
      const response = await page.goto(ORIGIN + ACCOUNT_SCREENS[name], { waitUntil: 'networkidle2', timeout: 90_000 });
      const status = response?.status() ?? 0;
      await sleep(2000);
      if (status !== 200 || /\/notfound\b/.test(page.url())) {
        results.push({ base, status: 'FAILED', detail: `HTTP ${status} at ${page.url().replace(ORIGIN, '')}` });
        continue;
      }
      if (layout === 'mobile') await captureAndDismissInterstitial(page, null);
      await scrollThrough(page);
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 15_000 }).catch(() => {});

      const counts = await redactPage(page, identity);
      const html = sanitizeHtml(absolutize(await page.content(), ORIGIN), identity);
      const leaked = leaks(html, identity);
      if (leaked.length) {
        results.push({ base, status: 'FAILED', detail: `refused to save — still contains: ${leaked.join(', ')}` });
        continue;
      }
      writeFileSync(join(OUT, `${base}.html`), html);
      await settleFixedElements(page);
      await page.screenshot({ path: join(SCREENS, `${base}.png`), fullPage: true });

      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      results.push({
        base,
        status: 'saved',
        detail: `${height}px tall · redacted: ${counts.text} text, ${counts.chatRows} chat rows, ${counts.inputs} fields, ${counts.avatars} avatars`,
      });
    } catch (error) {
      results.push({ base, status: 'FAILED', detail: error.message.split('\n')[0] });
    } finally {
      await page.close();
    }
  }
}

await browser.disconnect();
buildGallery();
for (const r of results) console.log(`${r.status.padEnd(6)}  ${r.base.padEnd(32)} ${r.detail}`);
const failed = results.filter((r) => r.status === 'FAILED').length;
console.log(`\n${results.length - failed} saved, ${failed} failed`);
process.exit(failed ? 1 : 0);
