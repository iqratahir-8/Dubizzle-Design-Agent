#!/usr/bin/env node
/**
 * Captures the parts of dubizzle.com.eg that only exist after an interaction — the header's
 * mega menus, the location dropdown, the search suggestions, the mobile search and location
 * overlays, and (with --account) the signed-in user menu.
 *
 * A page capture always shows these closed, so the design system had no record of them.
 * Each state here opens on a real page with real mouse/keyboard input, then is frozen the
 * same way page captures are (scripts/lib/snapshot.mjs) and screenshotted at viewport size —
 * a full-page shot would re-lay the overlay out of view.
 *
 *   npm run capture:states                       # every public state, both layouts
 *   npm run capture:states -- menu-vehicles      # named states
 *   npm run capture:states -- --layout=desktop
 *   npm run capture:states -- --account          # the signed-in ones (needs capture:login)
 */
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { absolutize } from './lib/absolutize.mjs';
import { recordResponses, snapshotHtml } from './lib/snapshot.mjs';
import { buildGallery } from './build-screens-gallery.mjs';
import { ORIGIN, LAYOUTS, sleep, captureAndDismissInterstitial, removePushPrompt } from './lib/render-helpers.mjs';
import { readAccountIdentity, redactPage, sanitizeHtml, leaks, visibleLeaks, scrubContactsPage, scrubContactsHtml, contactLeaks } from './lib/redact.mjs';
import { STATES } from './lib/states.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const SCREENS = join(OUT, 'screens');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const layoutArg = args.find((a) => a.startsWith('--layout='))?.split('=')[1];
const accountMode = args.includes('--account');
const names = args.filter((a) => !a.startsWith('--'));
const unknown = names.filter((n) => !STATES[n]);
if (unknown.length) {
  console.error(`Unknown state(s): ${unknown.join(', ')}. Known: ${Object.keys(STATES).join(', ')}`);
  process.exit(2);
}
const selected = (names.length ? names : Object.keys(STATES)).filter((n) =>
  accountMode ? STATES[n].account : !STATES[n].account,
);
if (!selected.length) {
  console.error(accountMode ? 'No signed-in states selected.' : 'No public states selected.');
  process.exit(2);
}

/** Finds the element a step names, in the page. Kept in one place so hover and click agree. */
const FIND = `(step) => {
  if (step.at) {
    let el = document.elementFromPoint(step.at[0], step.at[1]);
    // Walk up to whatever carries the click handler — the point usually lands on a label.
    while (el && el !== document.body) {
      const key = Object.keys(el).find((k) => k.startsWith('__reactProps'));
      if (key && el[key].onClick) return el;
      el = el.parentElement;
    }
    return document.elementFromPoint(step.at[0], step.at[1]);
  }
  const inRange = (el) => {
    if (!step.within) return true;
    const y = el.getBoundingClientRect().y;
    return y >= step.within[0] && y <= step.within[1];
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 8 && r.height > 8; };
  if (step.selector) {
    const hit = [...document.querySelectorAll(step.selector)].find((el) => visible(el) && inRange(el));
    if (hit) return hit;
  }
  // Desktop and mobile often word the same control differently ("Login or Signup"
  // vs "Login or Sign up"), so step.text may be a list: the first match wins.
  // NOTE: this whole function lives inside a template literal — no backticks here.
  const texts = [step.text, step.fallbackText].flat().filter(Boolean);
  if (!texts.length) return null;
  const pool = [...document.querySelectorAll('button, a, div, span, [role="button"]')];
  for (const text of texts) {
    const candidates = pool.filter((el) => el.textContent.trim() === text && visible(el) && inRange(el));
    // The innermost match is the one carrying the handler; outer wrappers repeat the text.
    const hit = candidates.find((el) => !candidates.some((other) => other !== el && el.contains(other)));
    if (hit) return hit;
  }
  // Nothing matched exactly — fall back to a case-insensitive, space-insensitive compare,
  // which absorbs "Show phone number" vs "Show Phone Number" and stray &nbsp;.
  const norm = (v) => v.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const text of texts) {
    const loose = pool.filter((el) => norm(el.textContent) === norm(text) && visible(el) && inRange(el));
    const hit = loose.find((el) => !loose.some((other) => other !== el && el.contains(other)));
    if (hit) return hit;
  }
  return null;
}`;

async function runStep(page, step) {
  if (step.wait) return sleep(step.wait);
  if (step.type) {
    await page.keyboard.type(step.type.text, { delay: 90 });
    return;
  }
  const target = step.hover ?? step.click;
  // A trigger below the fold ("Show phone number" sits at y≈1278) has viewport
  // coordinates outside the window, so clicking them hits nothing. Scroll it into
  // view first, then re-measure. Elements already on screen are left alone so the
  // header hovers don't move the page.
  const scrolled = await page.evaluate(
    (find, s) => {
      const el = new Function('return ' + find)()(s);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.top >= 0 && r.bottom <= window.innerHeight) return false;
      el.scrollIntoView({ block: 'center' });
      return true;
    },
    FIND,
    target,
  );
  if (scrolled) await sleep(900);
  const box = await page.evaluate(
    (find, s) => {
      const el = new Function('return ' + find)()(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    FIND,
    target,
  );
  if (!box) throw new Error(`no element for ${JSON.stringify(target)} (or it stayed off-screen)`);
  if (step.hover) {
    // A real mouse move — React's onMouseEnter doesn't fire for synthetic events.
    await page.mouse.move(box.x - 40, box.y + 60);
    await page.mouse.move(box.x, box.y, { steps: 12 });
  } else {
    await page.mouse.click(box.x, box.y);
  }
}

mkdirSync(SCREENS, { recursive: true });

let browser;
let identity = null;
let profile = null;
if (accountMode) {
  const { connectToSession, isSignedIn } = await import('./capture-session.mjs');
  browser = await connectToSession();
  const probe = await browser.newPage();
  await probe.setViewport(LAYOUTS.desktop.viewport);
  await probe.goto(`${ORIGIN}/en/`, { waitUntil: 'networkidle2', timeout: 90_000 });
  await sleep(2000);
  if (!(await isSignedIn(probe))) {
    console.error('The capture window is signed out. Sign in there, then: npm run capture:login -- --check');
    await probe.close();
    await browser.disconnect();
    process.exit(1);
  }
  identity = await readAccountIdentity(probe, ORIGIN);
  await probe.close();
  if (!identity?.fullName) {
    console.error('Could not read the account name to redact it — refusing to capture.');
    await browser.disconnect();
    process.exit(1);
  }
} else {
  profile = mkdtempSync(join(tmpdir(), 'dbz-states-'));
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    userDataDir: profile,
    args: ['--no-first-run', '--no-default-browser-check', '--lang=en-US'],
  });
}

const results = [];
try {
  for (const name of selected) {
    const state = STATES[name];
    for (const layout of state.layouts.filter((l) => !layoutArg || l === layoutArg)) {
      const { viewport, userAgent } = LAYOUTS[layout];
      const base = `${name}.${layout}`;
      const page = await browser.newPage();
      try {
        await page.setUserAgent(userAgent);
        await page.setViewport(viewport);
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });
        const recorder = recordResponses(page);

        // domcontentloaded, then settle: the signed-in session keeps long-poll requests open,
        // so waiting for the network to go idle can time out on a page that is already there.
        const response = await page.goto(ORIGIN + state.url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await page.waitForNetworkIdle({ idleTime: 800, timeout: 20_000 }).catch(() => {});
        if ((response?.status() ?? 0) !== 200) {
          results.push({ base, status: 'FAILED', detail: `HTTP ${response?.status()}` });
          continue;
        }
        await sleep(1500);
        if (layout === 'mobile') await captureAndDismissInterstitial(page, null);
        await removePushPrompt(page);

        for (const step of state.steps) await runStep(page, step);

        // A frozen page has no mouse, so every :hover style would be lost — including the
        // 4px underline that says which nav item opened the mega menu. Copy the hovered
        // chain's visual properties into inline styles, and mark it, before freezing.
        const hoverMark = await page.evaluate(() => {
          const KEEP = ['boxShadow', 'backgroundColor', 'color', 'fontWeight', 'textDecorationLine', 'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor', 'opacity'];
          const chain = [...document.querySelectorAll(':hover')].slice(-4);
          let label = null;
          for (const el of chain) {
            const style = getComputedStyle(el);
            for (const prop of KEEP) el.style[prop] = style[prop];
            el.setAttribute('data-hovered', 'true');
            const text = el.textContent.trim();
            if (text && text.length < 40) label = text;
          }
          return label;
        });

        // Third-party contact details (a seller's revealed phone) go before the
        // screenshot, whether or not this is a signed-in capture.
        if (state.scrubContacts) await scrubContactsPage(page);
        if (identity) await redactPage(page, identity);
        const opened = await page.evaluate(() => {
          const panels = [...document.querySelectorAll('*')].filter((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return r.width > 200 && r.height > 120 && (s.position === 'absolute' || s.position === 'fixed');
          });
          return { panels: panels.length, text: document.body.innerText.length };
        });

        /* Finding the trigger is not proof the state opened. login-dialog.mobile
           matched an element, clicked it, and saved the plain home page — the exact
           silent-wrong-state failure this harness is supposed to make impossible.
           So every state must show evidence. Counting absolutely-positioned boxes is
           too weak on its own — the mobile DPV has a sticky contact bar and a back
           button, so dpv-gallery.mobile "passed" while showing no gallery. Prefer an
           explicit expect: {text} (copy that only exists in the open state) or
           {selector}. No evidence, no capture. */
        const proof = state.expect
          ? await page.evaluate(
              (e) =>
                e.selector
                  ? !!document.querySelector(e.selector)
                  : document.body.innerText.toLowerCase().includes(String(e.text).toLowerCase()),
              state.expect,
            )
          : opened.panels > 0;
        if (!proof) {
          results.push({
            base,
            status: 'FAILED',
            detail: `state did not open — expected ${state.expect ? JSON.stringify(state.expect) : 'an overlay'}`,
          });
          continue;
        }

        // Images are embedded, unlike page captures of account screens: the page behind an
        // overlay carries a rotating ad, so a capture that re-fetched its images would show a
        // different creative every time it was rendered and never match its own screenshot.
        // Avatars and other personal images are replaced by redactPage above, before this runs.
        let html = absolutize(await snapshotHtml(page, recorder, { inlineImages: true, restoreScroll: false }), ORIGIN);
        if (state.scrubContacts) {
          html = scrubContactsHtml(html);
          const contacts = contactLeaks(html);
          if (contacts.length) {
            results.push({ base, status: 'FAILED', detail: `refused to save — third-party contact details: ${contacts.join(', ')}` });
            continue;
          }
        }
        if (identity) {
          html = sanitizeHtml(html, identity);
          const leaked = leaks(html, identity);
          if (leaked.length) {
            results.push({ base, status: 'FAILED', detail: `refused to save — contains: ${leaked.join(', ')}` });
            continue;
          }
          const onScreen = await visibleLeaks(page, identity);
          if (onScreen.length) {
            results.push({ base, status: 'FAILED', detail: `refused — visible on screen: ${onScreen.join(', ')}` });
            continue;
          }
        }
        // Say in the file itself which element is hovered — "which menu is this?" is otherwise
        // only answerable from the file name.
        /* The hover label is PAGE TEXT — on the phone-reveal state it was the seller's
           actual number — and this stamp is injected after contactLeaks() has already
           run, so anything in it bypassed every gate and landed in the saved file.
           Scrub the label, then re-check the finished HTML rather than trusting that
           the only thing added since was safe. */
        const safeMark = hoverMark ? scrubContactsHtml(hoverMark).replace(/"/g, "'") : '';
        const stamp = `<meta name="live-state" content="${name}${safeMark ? ` · hovering ${safeMark}` : ''}">`;
        html = html.replace(/<head([^>]*)>/i, (m) => `${m}\n${stamp}`);
        const finalLeaks = contactLeaks(html);
        if (finalLeaks.length) {
          results.push({ base, status: 'FAILED', detail: `refused to save — after stamping: ${finalLeaks.join(', ')}` });
          continue;
        }
        writeFileSync(join(OUT, `${base}.html`), html);
        /* Viewport-size: the state is an overlay, and a full-page shot re-lays it out
           of view. But a non-overlay state (an expanded details table) sits wherever it
           sits, and freezing the DOM returns the page to scroll 0 — so the shot would
           show the top of the page and prove nothing. Put the evidence back on screen
           first, so the PNG shows what the HTML captured. */
        let shotAt = null;
        let cleanupNote = '';
        if (state.expect) {
          // scrollIntoView is unreliable after the freeze (the frozen document can be
          // height-locked), so compute the absolute offset and scroll the window.
          shotAt = await page.evaluate((e) => {
            let el = e.selector && document.querySelector(e.selector);
            if (!el && e.text) {
              const needle = String(e.text).toLowerCase();
              el = [...document.querySelectorAll('body *')].find(
                (n) => n.children.length === 0 && n.textContent.toLowerCase().includes(needle),
              );
            }
            if (!el) return null;
            const top = el.getBoundingClientRect().top + window.scrollY;
            // An overlay is fixed to the viewport — scrolling to it would scroll the page
            // behind it instead. Only move for content that actually sits down the page.
            const fixed = (n) => {
              for (let p = n; p && p !== document.body; p = p.parentElement) {
                if (getComputedStyle(p).position === 'fixed') return true;
              }
              return false;
            };
            if (fixed(el)) return { scrolled: window.scrollY, fixed: true };
            window.scrollTo(0, Math.max(0, top - window.innerHeight / 2));
            return { scrolled: window.scrollY, fixed: false };
          }, state.expect);
          await sleep(500);
        }
        await page.screenshot({ path: join(SCREENS, `${base}.png`), fullPage: false });

        /* Some states are produced by an action that writes to the account — favouriting
           an ad, for example. The capture is frozen by this point, so the live page is
           reloaded and the action reversed. Cleanup runs even if the capture failed, and
           its outcome is reported: an undo that silently didn't happen would leave the
           user's account changed by a capture run. */
        if (state.cleanup) {
          try {
            await page.goto(ORIGIN + state.url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
            await page.waitForNetworkIdle({ idleTime: 800, timeout: 15_000 }).catch(() => {});
            await sleep(2500);
            for (const step of state.cleanup) await runStep(page, step);
            await sleep(1500);
            cleanupNote = ' · undone';
          } catch (error) {
            cleanupNote = ` · CLEANUP FAILED (${error.message.split('\n')[0].slice(0, 40)}) — undo by hand`;
          }
        }
        results.push({
          base,
          status: 'saved',
          // safeMark, never hoverMark: the raw label is page text and on the phone-reveal
          // state it was a real number. cleanupNote is included so a silent undo is
          // impossible to mistake for a completed one.
          detail: `${state.label} · ${opened.panels} overlay element(s)${safeMark ? ` · hovering "${safeMark}"` : ''}${
            shotAt ? ` · shot at y=${shotAt.scrolled}${shotAt.fixed ? ' (fixed overlay)' : ''}` : ''
          }${cleanupNote}`,
        });
      } catch (error) {
        results.push({ base, status: 'FAILED', detail: error.message.split('\n')[0] });
      } finally {
        await page.close();
      }
    }
  }
} finally {
  if (accountMode) await browser.disconnect();
  else await browser.close();
  if (profile) rmSync(profile, { recursive: true, force: true });
}

buildGallery();
for (const r of results) console.log(`${r.status.padEnd(6)}  ${r.base.padEnd(30)} ${r.detail}`);
const failed = results.filter((r) => r.status === 'FAILED').length;
console.log(`\n${results.length - failed} saved, ${failed} failed · screenshots in design-kit/reference/live/screens/`);
process.exit(failed ? 1 : 0);
