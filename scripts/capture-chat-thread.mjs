#!/usr/bin/env node
/**
 * Captures ONE open chat conversation, desktop and mobile, from the signed-in capture window.
 *
 * Why its own script rather than a state in capture-states.mjs: that runner prepares its page
 * (its own User-Agent, its identity probe, its interstitial passes) and the chat app answers
 * that page with the login dialog — every capture came back as a login box. A plain page in
 * the same window stays signed in, so this script keeps the page setup minimal and reuses the
 * runner's redaction and gates unchanged.
 *
 * Privacy, in order:
 *   1. The thread to open is named by the account holder — never discovered by the script, and
 *      never stored in the repo. Opening a conversation marks it read, which the other person
 *      can see, so the choice stays theirs.
 *   2. redactPage replaces every name, message, phone and email with fixtures.
 *   3. scrubContactsPage/Html replaces third-party contact details.
 *   4. Nothing is written unless visibleLeaks, leaks and contactLeaks all come back empty.
 *
 *   CHAT_THREAD_URL='/en/chat/user/<id>/<ad>' npm run capture:chat-thread
 */
import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolutize } from './lib/absolutize.mjs';
import { recordResponses, snapshotHtml } from './lib/snapshot.mjs';
import { sleep, settleFixedElements } from './lib/render-helpers.mjs';
import { readAccountIdentity, redactPage, sanitizeHtml, leaks, visibleLeaks, scrubContactsPage, scrubContactsHtml, contactLeaks } from './lib/redact.mjs';
import { connectToSession } from './capture-session.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(OUT, 'screens');
const ORIGIN = 'https://www.dubizzle.com.eg';

const path = process.env.CHAT_THREAD_URL;
if (!path || !/^\/[a-z]{2}\/chat\/.+/.test(path)) {
  console.error("Set the thread to capture, e.g. CHAT_THREAD_URL='/en/chat/user/<id>/<ad>' npm run capture:chat-thread");
  process.exit(2);
}

/* Mobile keeps its own User-Agent — the mobile site is a different build, and without it the
   capture is just the desktop layout in a narrow window. */
const LAYOUTS = {
  desktop: { viewport: { width: 1440, height: 900 }, userAgent: null },
  mobile: {
    viewport: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
};

const browser = await connectToSession();
const identityPage = await browser.newPage();
const identity = await readAccountIdentity(identityPage, ORIGIN);
await identityPage.close();
if (!identity?.fullName) {
  console.error('Could not read the account name to redact it — refusing to capture.');
  process.exit(1);
}

const results = [];
for (const [layout, { viewport, userAgent }] of Object.entries(LAYOUTS)) {
  const base = `chat-thread.${layout}`;
  const page = await browser.newPage();
  try {
    if (userAgent) await page.setUserAgent(userAgent);
    await page.setViewport(viewport);
    const recorder = recordResponses(page);
    await page.goto(ORIGIN + path, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    /* The thread hydrates well after DOMContentLoaded; a shorter wait freezes an empty pane. */
    await sleep(14_000);

    const state = await page.evaluate(() => ({
      login: /Login into your Dubizzle account/i.test(document.body.innerText),
      messages: [...document.querySelectorAll('body *')].filter((e) => !e.children.length && e.textContent.trim().length > 12).length,
    }));
    if (state.login) {
      results.push({ base, status: 'FAILED', detail: 'the page is signed out — sign in with npm run capture:login and retry' });
      continue;
    }
    if (state.messages < 2) {
      results.push({ base, status: 'FAILED', detail: 'no conversation rendered — check the URL belongs to this account' });
      continue;
    }

    await scrubContactsPage(page);
    const counts = await redactPage(page, identity);
    await sleep(800);
    await settleFixedElements(page);

    const onScreen = await visibleLeaks(page, identity);
    if (onScreen.length) {
      results.push({ base, status: 'FAILED', detail: `refused — visible on screen: ${onScreen.join(', ')}` });
      continue;
    }
    await page.screenshot({ path: join(SCREENS, `${base}.png`), fullPage: false });

    let html = absolutize(await snapshotHtml(page, recorder, { inlineImages: true, restoreScroll: false }), ORIGIN);
    html = scrubContactsHtml(sanitizeHtml(html, identity));
    const refused = [...leaks(html, identity), ...contactLeaks(html)];
    if (refused.length) {
      results.push({ base, status: 'FAILED', detail: `refused to save — ${refused.join(', ')}` });
      continue;
    }
    html = html.replace(/<head([^>]*)>/i, (m) => `${m}\n<meta name="live-state" content="chat-thread">`);
    writeFileSync(join(OUT, `${base}.html`), html);
    results.push({ base, status: 'saved', detail: `${(html.length / 1e6).toFixed(1)}MB · redacted ${counts.bubbles} message(s), ${counts.chatRows} row(s)` });
  } catch (error) {
    results.push({ base, status: 'FAILED', detail: error.message });
  } finally {
    await page.close().catch(() => {});
  }
}

for (const r of results) console.log(`${r.status.padEnd(7)} ${r.base.padEnd(24)} ${r.detail}`);
const failed = results.filter((r) => r.status === 'FAILED').length;
console.log(`\n${results.length - failed} saved, ${failed} failed · screenshots in design-kit/reference/live/screens/`);
process.exit(failed ? 1 : 0);
