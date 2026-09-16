#!/usr/bin/env node
/**
 * Reads the whole desktop header mega menu off the live site into one JSON file:
 * every category in the strip, every subcategory in its column, and the links in the panel
 * each subcategory opens. Screenshots show one menu at a time; this is the content behind
 * all of them, so the MegaMenu component and the design kit can show the real thing.
 *
 * Menus open on hover and their panels are built on hover too, so this drives a real mouse
 * over every item in turn (React ignores synthetic mouse events).
 *
 *   node scripts/extract-mega-menus.mjs   →  design-kit/content/mega-menus.json
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { ORIGIN, LAYOUTS, sleep } from './lib/render-helpers.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/content/mega-menus.json');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const profile = mkdtempSync(join(tmpdir(), 'dbz-megamenu-'));
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  userDataDir: profile,
  args: ['--no-first-run', '--no-default-browser-check', '--lang=en-US'],
});

const page = await browser.newPage();
await page.setViewport(LAYOUTS.desktop.viewport);
await page.setUserAgent(LAYOUTS.desktop.userAgent);
await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });
await page.goto(`${ORIGIN}/en/`, { waitUntil: 'networkidle2', timeout: 90_000 });
await sleep(2000);

const path = (href) => {
  try {
    return new URL(href, ORIGIN).pathname;
  } catch {
    return null;
  }
};

/** The strip items, by their position: the nav row sits directly under the search row. */
const strip = await page.evaluate(() => {
  const items = [...document.querySelectorAll('div')].filter((el) => {
    const key = Object.keys(el).find((k) => k.startsWith('__reactProps'));
    const r = el.getBoundingClientRect();
    return r.y > 130 && r.y < 200 && r.width > 30 && key && el[key].onMouseEnter;
  });
  return items.map((el) => {
    const r = el.getBoundingClientRect();
    // innerText, not textContent: the menus are in the DOM while hidden, and textContent
    // would return the whole menu as the item's label.
    return { label: el.innerText.trim().split('\n')[0], x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
});

/**
 * Approach comes from above: entering a strip item from below drags the pointer through the
 * open menu's column, which switches the active subcategory before anything can be read.
 */
async function hover(x, y, from = 'above') {
  await page.mouse.move(x - 30, from === 'above' ? y - 45 : y);
  await page.mouse.move(x, y, { steps: 8 });
  await sleep(450);
}

/** The open menu: the column on the left, and whatever panel is showing on the right. */
const readMenu = () =>
  page.evaluate(() => {
    // Every menu is in the DOM at all times, hidden, so everything here filters by visibility.
    // The open menu is two boxes hanging from the bottom of the 48px strip: a 302px column of
    // subcategories and, when the hovered subcategory has one, a 430px panel beside it. The
    // panel is rendered INSIDE the hovered row, so its text has to be excluded from that row's
    // own label — otherwise the panel's title reads as the subcategory's subtitle.
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const atMenuTop = (el, min, max) => {
      const r = el.getBoundingClientRect();
      return r.y > 180 && r.y < 210 && r.height > 200 && r.width > min && r.width < max;
    };
    const ownText = (root, exclude) => {
      const out = [];
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const node = walk.currentNode;
        if (exclude && exclude.contains(node)) continue;
        const text = node.textContent.trim();
        if (text) out.push(text);
      }
      return out;
    };

    const divs = [...document.querySelectorAll('div')].filter(vis);
    const column = divs.find((el) => atMenuTop(el, 280, 330) && el.children.length >= 2);
    if (!column) return null;
    const wrap = divs.find((el) => atMenuTop(el, 390, 470));

    const row = (el, exclude) => {
      const text = ownText(el, exclude);
      const a = el.tagName === 'A' ? el : [...el.querySelectorAll('a')].find((link) => vis(link) && !exclude?.contains(link));
      const r = el.getBoundingClientRect();
      return {
        label: text[0] ?? null,
        subtitle: text[1] ?? null,
        href: a?.getAttribute('href') ?? null,
        chevron: Boolean([...el.querySelectorAll('svg')].some((svg) => !exclude?.contains(svg))),
        active: getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)',
        x: r.x + r.width / 2,
        y: r.y + r.height / 2,
      };
    };

    const categories = [...column.children].filter(vis).map((el) => row(el, wrap)).filter((c) => c.label);

    let panel = null;
    if (wrap) {
      const anchors = [...wrap.querySelectorAll('a')].filter(vis);
      const seeAll = anchors.find((a) => /^see all$/i.test(a.innerText.trim()));
      const rest = anchors.filter((a) => a !== seeAll);
      // Rows can be links or, where a further level hangs off them, plain elements with a
      // chevron — so take the list container (the deepest element holding every link) and read
      // its children, rather than the links alone.
      let list = rest[0] ?? null;
      while (list && !rest.every((a) => list.contains(a))) list = list.parentElement;
      // A links grid can be two columns of links rather than a flat list — expand any row that
      // holds several links into those links.
      const expand = (el) => {
        const links = [...el.querySelectorAll('a')].filter(vis);
        return links.length > 1 && el.tagName !== 'A' ? links : [el];
      };
      const rows = (list ? [...list.children].filter(vis).flatMap(expand) : rest)
        .map((el) => row(el, null))
        .filter((l) => l.label && !/^see all$/i.test(l.label));
      const title = ownText(wrap, null).filter((t) => !/^see all$/i.test(t))[0] ?? null;
      panel = {
        title,
        seeAllHref: seeAll?.getAttribute('href') ?? null,
        columns: new Set(rows.map((r) => Math.round(r.x))).size > 1 ? 2 : 1,
        links: rows
          .filter((l) => l.label !== title)
          .map(({ label, href, chevron }) => ({ label, href, chevron })),
      };
    }
    return { categories, panel };
  });

const menus = [];
for (const item of strip) {
  await hover(item.x, item.y);
  const first = await readMenu();
  if (!first) {
    menus.push({ label: item.label, categories: [] });
    continue;
  }
  const categories = [];
  for (const category of first.categories) {
    await hover(category.x, category.y, 'side');
    const state = await readMenu();
    const panel = state?.panel?.links?.length ? state.panel : null;
    // A subtitle is the "Dogs; Cats; Birds" line under a More Categories row. When the row is
    // the open one its panel is rendered inside it, so anything matching the panel's title is
    // the panel bleeding through, not a subtitle.
    const subtitle =
      category.subtitle && category.subtitle !== category.label && category.subtitle !== panel?.title
        ? category.subtitle
        : null;
    categories.push({
      label: category.label,
      subtitle,
      href: path(category.href),
      chevron: category.chevron,
      panel: panel
        ? {
            title: panel.title,
            seeAllHref: path(panel.seeAllHref),
            columns: panel.columns,
            links: panel.links.map((l) => ({ label: l.label, href: path(l.href), chevron: l.chevron })),
          }
        : null,
    });
  }
  menus.push({ label: item.label, categories });
  // Leave the strip so the next hover is a fresh enter.
  await page.mouse.move(700, 700);
  await sleep(300);
}

await browser.close();
rmSync(profile, { recursive: true, force: true });

writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      _purpose:
        'The desktop header mega menu, read off dubizzle.com.eg by scripts/extract-mega-menus.mjs. Drives the MegaMenu component story and the design kit example. Re-run after a release.',
      _captured: new Date().toISOString().slice(0, 10),
      menus,
    },
    null,
    2,
  )}\n`,
);

const categories = menus.reduce((n, m) => n + m.categories.length, 0);
const links = menus.reduce((n, m) => n + m.categories.reduce((k, c) => k + (c.panel?.links.length ?? 0), 0), 0);
console.log(`${menus.length} menus · ${categories} subcategories · ${links} panel links → design-kit/content/mega-menus.json`);
for (const m of menus) console.log(`  ${m.label.padEnd(34)} ${m.categories.length} subcategories`);
