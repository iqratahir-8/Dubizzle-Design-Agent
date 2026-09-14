import { join } from 'node:path';

export const ORIGIN = 'https://www.dubizzle.com.eg';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const LAYOUTS = {
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

/** Lazy sections only mount when scrolled into view; walk the page once so they do. */
export async function scrollThrough(page) {
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
 * sections. Only for the screenshot — take the HTML before calling this:
 * - fixed elements entirely outside the viewport are closed drawers/sheets → hide
 * - fixed elements pinned to the bottom (bottom nav, contact bar) → move to page end
 * - other visible fixed elements (top bars) → pin at their document position
 */
export async function settleFixedElements(page) {
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
 * via "Continue in Browser", which only closes the prompt. Returns whether one was found.
 */
export async function captureAndDismissInterstitial(page, screenshotPath) {
  const target = await page.evaluateHandle(() =>
    [...document.querySelectorAll('button, a, [role="button"], div, span')].find((el) => {
      if (el.textContent.trim() !== 'Continue in Browser') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    }),
  );
  const element = target.asElement();
  if (!element) return false;
  if (screenshotPath) await page.screenshot({ path: screenshotPath });
  await element.click();
  await sleep(1200);
  return true;
}

export const screenPath = (dir, base, suffix = '') => join(dir, `${base}${suffix}.png`);

/**
 * The site's own "This website would like to send you awesome updates" push-permission
 * prompt sits over the search bar on first visit. It's not part of the page design, so it's
 * removed before capture (removed from the DOM, not answered).
 */
export async function removePushPrompt(page) {
  return page.evaluate(() => {
    const hit = [...document.querySelectorAll('body *')].find(
      (el) => el.children.length === 0 && /would like to send you/i.test(el.textContent),
    );
    if (!hit) return false;
    let box = hit;
    while (box.parentElement && box.parentElement !== document.body) {
      const pos = getComputedStyle(box).position;
      if (pos === 'fixed' || pos === 'absolute') break;
      box = box.parentElement;
    }
    box.remove();
    return true;
  });
}
