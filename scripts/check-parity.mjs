#!/usr/bin/env node
/**
 * Component parity check: the React library (Storybook) and the HTML design kit
 * (patterns.css) implement the same components twice, so they drift. This renders each
 * component in both, reads computed styles, and reports every property that differs.
 *
 * Needs both servers running:
 *   npm run dev            # Storybook on :6006
 *   npm run kit            # design kit on :4321
 *   npm run check:parity   # exits 1 on any mismatch
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';

const SB = process.env.STORYBOOK_URL || 'http://localhost:6006';
const KIT = process.env.KIT_URL || 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Properties that define how a component looks, independent of the page it sits in. */
const BOX = ['height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopLeftRadius', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'backgroundColor', 'backgroundImage', 'boxShadow'];
const TYPE = ['color', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'textTransform'];
const ALL = [...BOX, ...TYPE];
const SIZED = [...ALL, 'width'];
const SIZED_NO_W = ALL;
/** Cards stretch to their container — compare everything but the height it grows to. */
const BOX_NO_H = [...BOX.filter((p) => p !== 'height'), ...TYPE];

/**
 * Each pair names a Storybook story + an element in it, and the matching element on the
 * kit's reference page. `n` picks the nth match. Storybook class names are CSS-Module
 * hashes, so React elements are found by tag/role or by the module's class stem.
 */
export const PAIRS = [
  ['Button / primary', { story: 'components-button--primary', sel: 'button' }, { sel: '#buttons .btn--primary:not(.btn--sm):not(.btn--lg):not([disabled])' }],
  ['Button / secondary', { story: 'components-button--secondary', sel: 'button' }, { sel: '#buttons .btn--secondary:not([disabled])' }],
  ['Button / tertiary', { story: 'components-button--tertiary', sel: 'button' }, { sel: '#buttons .btn--tertiary' }],
  ['Button / ghost', { story: 'components-button--ghost', sel: 'button' }, { sel: '#buttons .btn--ghost' }],
  ['Button / disabled', { story: 'components-button--disabled', sel: 'button' }, { sel: '#buttons .btn--primary[disabled]' }],
  ['Button / small', { story: 'components-button--sizes', sel: 'button', n: 0 }, { sel: '#buttons .btn--sm' }],
  ['Button / large', { story: 'components-button--sizes', sel: 'button', n: 2 }, { sel: '#buttons .btn--lg' }],
  ['Contact / chat', { story: 'components-contactbutton--all-variants', sel: 'button', n: 0 }, { sel: '#buttons .contact-btn--chat' }],
  ['Contact / call', { story: 'components-contactbutton--all-variants', sel: 'button', n: 1 }, { sel: '#buttons .contact-btn--call' }],
  ['Contact / whatsapp', { story: 'components-contactbutton--all-variants', sel: 'button', n: 2 }, { sel: '#buttons .contact-btn--whatsapp' }],
  ['Chip / quick desktop', { story: 'components-chip--quick-row', sel: 'div > div:nth-child(1) > button', props: SIZED_NO_W }, { sel: '[data-parity="quick-desktop"] .chip' }],
  ['Chip / quick mobile', { story: 'components-chip--quick-row', sel: 'div > div:nth-child(2) > button', props: SIZED_NO_W }, { sel: '[data-parity="quick-mobile"] .chip' }],
  ['Chip / filter applied', { story: 'components-chip--filter-bar', sel: 'button', n: 1, props: SIZED_NO_W }, { sel: '[data-parity="filter-bar"] .chip', n: 1 }],
  ['Chip / filter not applied', { story: 'components-chip--filter-bar', sel: 'button', n: 2, props: SIZED_NO_W }, { sel: '[data-parity="filter-bar"] .chip', n: 2 }],
  ['Chip / filter count badge', { story: 'components-chip--filter-bar', sel: '[class*="_count_"]' }, { sel: '[data-parity="filter-bar"] .chip__count' }],
  ['Chip / segment selected', { story: 'components-chip--segment', sel: 'button', n: 0, props: SIZED }, { sel: '[data-parity="segment"] .chip', n: 0 }],
  ['Chip / segment', { story: 'components-chip--segment', sel: 'button', n: 1, props: SIZED }, { sel: '[data-parity="segment"] .chip', n: 1 }],
  ['Pill / regular', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 0 }, { sel: '#tags .pill--regular' }],
  ['Pill / success', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 1 }, { sel: '#tags .pill--success' }],
  ['Pill / featured', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 2 }, { sel: '#tags .pill--featured' }],
  ['Pill / error', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 3 }, { sel: '#tags .pill--error' }],
  ['Pill / boosted', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 4 }, { sel: '#tags .pill--boosted' }],
  ['Input / field', { story: 'components-input--default', sel: '[class*="field"]' }, { sel: '#forms input.input' }],
  ['Input / label', { story: 'components-input--default', sel: 'label' }, { sel: '#forms .field__label' }],
  ['Input / error text', { story: 'components-input--with-error', sel: '[class*="errorText"]' }, { sel: '#forms .field__error' }],
  ['Select / control', { story: 'components-select--default', sel: '[role="combobox"]', props: BOX }, { sel: '#forms .select' }],
  ['Checkbox / checked box', { story: 'components-checkbox--checked', sel: '[class*="box"]', props: SIZED }, { sel: '#forms .control input:checked + .control__box' }],
  ['Radio / selected', { story: 'components-radio--group', sel: '[class*="outer"]', props: SIZED }, { sel: '#forms .control input:checked + .control__radio' }],
  ['Toggle / on track', { story: 'components-toggle--on', sel: '[class*="track"]', props: SIZED }, { sel: '#forms .control input:checked + .control__track' }],
  ['Tabs / active tab', { story: 'components-tabs--line', sel: '[role="tab"][aria-selected="true"]' }, { sel: '#nav-components .tabs__tab--active' }],
  ['Tabs / inactive tab', { story: 'components-tabs--line', sel: '[role="tab"][aria-selected="false"]' }, { sel: '#nav-components .tabs__tab:not(.tabs__tab--active)' }],
  ['Pagination / active', { story: 'components-pagination--default', sel: 'button[aria-current="page"]', props: SIZED }, { sel: '#nav-components .pagination__btn--active' }],
  ['AdCard desktop / card', { story: 'components-adcard--property', sel: 'article', props: SIZED }, { sel: '[data-parity="grid-desktop"]' }],
  ['AdCard desktop / image', { story: 'components-adcard--property', sel: '[class*="_media_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__media' }],
  ['AdCard desktop / price row', { story: 'components-adcard--property', sel: '[class*="_priceRow_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__price-row' }],
  ['AdCard desktop / price', { story: 'components-adcard--property', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__price' }],
  ['AdCard desktop / title', { story: 'components-adcard--property', sel: '[class*="_title_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__title' }],
  ['AdCard desktop / specs', { story: 'components-adcard--property', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__specs' }],
  ['AdCard desktop / meta', { story: 'components-adcard--property', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__meta' }],
  ['AdCard desktop / location', { story: 'components-adcard--property', sel: '[class*="_location_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__location' }],
  ['AdCard desktop / time', { story: 'components-adcard--property', sel: '[class*="_time_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__time' }],
  ['AdCard mobile / card', { story: 'components-adcard--mobile', sel: 'article', props: SIZED }, { sel: '[data-parity="grid-mobile"]' }],
  ['AdCard mobile / image', { story: 'components-adcard--mobile', sel: '[class*="_media_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__media' }],
  ['AdCard mobile / price row', { story: 'components-adcard--mobile', sel: '[class*="_priceRow_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__price-row' }],
  ['AdCard mobile / price', { story: 'components-adcard--mobile', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__price' }],
  ['AdCard mobile / title', { story: 'components-adcard--mobile', sel: '[class*="_title_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__title' }],
  ['AdCard mobile / specs', { story: 'components-adcard--mobile', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__specs' }],
  ['AdCard mobile / meta', { story: 'components-adcard--mobile', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__meta' }],
  ['AdCard mobile / location', { story: 'components-adcard--mobile', sel: '[class*="_location_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__location' }],
  ['AdCard mobile / time', { story: 'components-adcard--mobile', sel: '[class*="_time_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__time' }],
  ['AdCard desktop / down payment', { story: 'components-adcard--property', sel: '[class*="_downPayment_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__dp' }],
  ['AdCard / featured badge', { story: 'components-adcard--featured', sel: '[class*="_badge_"]', props: ALL }, { sel: '#featured-grid-card .ad-card__badge' }],
  ['AdListCard desktop / card', { story: 'components-adlistcard--property', sel: 'article', props: BOX_NO_H }, { sel: '[data-parity="list-desktop"]' }],
  ['AdListCard desktop / image', { story: 'components-adlistcard--property', sel: '[class*="_media_"]', props: BOX_NO_H }, { sel: '[data-parity="list-desktop"] .ad-list-card__media' }],
  ['AdListCard desktop / body', { story: 'components-adlistcard--property', sel: '[class*="_body_"]', props: BOX_NO_H }, { sel: '[data-parity="list-desktop"] .ad-list-card__body' }],
  ['AdListCard desktop / price', { story: 'components-adlistcard--property', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__price' }],
  ['AdListCard desktop / down payment', { story: 'components-adlistcard--property', sel: '[class*="_downPayment_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__dp' }],
  ['AdListCard desktop / type', { story: 'components-adlistcard--property', sel: '[class*="_type_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__type' }],
  ['AdListCard desktop / specs', { story: 'components-adlistcard--property', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__specs' }],
  ['AdListCard desktop / attribute chip', { story: 'components-adlistcard--property', sel: '[class*="_attribute_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .attr-chip' }],
  ['AdListCard desktop / meta', { story: 'components-adlistcard--property', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__meta' }],
  ['AdListCard desktop / actions', { story: 'components-adlistcard--property', sel: '[class*="_actions_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__actions' }],
  ['AdListCard desktop / featured badge', { story: 'components-adlistcard--property', sel: '[class*="_badge_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-card__badge' }],
  ['AdListCard mobile / card', { story: 'components-adlistcard--mobile-property', sel: 'article', props: BOX_NO_H }, { sel: '[data-parity="list-mobile"]' }],
  ['AdListCard mobile / image', { story: 'components-adlistcard--mobile-property', sel: '[class*="_media_"]', props: BOX_NO_H }, { sel: '[data-parity="list-mobile"] .ad-list-card__media' }],
  ['AdListCard mobile / body', { story: 'components-adlistcard--mobile-property', sel: '[class*="_body_"]', props: BOX_NO_H }, { sel: '[data-parity="list-mobile"] .ad-list-card__body' }],
  ['AdListCard mobile / price', { story: 'components-adlistcard--mobile-property', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__price' }],
  ['AdListCard mobile / down payment', { story: 'components-adlistcard--mobile-property', sel: '[class*="_downPayment_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__dp' }],
  ['AdListCard mobile / type', { story: 'components-adlistcard--mobile-property', sel: '[class*="_type_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__type' }],
  ['AdListCard mobile / specs', { story: 'components-adlistcard--mobile-property', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__specs' }],
  ['AdListCard mobile / attribute chip', { story: 'components-adlistcard--mobile-property', sel: '[class*="_attribute_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .attr-chip' }],
  ['AdListCard mobile / meta', { story: 'components-adlistcard--mobile-property', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__meta' }],
  ['AdListCard mobile / actions', { story: 'components-adlistcard--mobile-property', sel: '[class*="_actions_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__actions' }],
  ['AdListCard mobile / featured badge', { story: 'components-adlistcard--mobile-property', sel: '[class*="_badge_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-card__badge' }],
  ['AdListCard desktop / title', { story: 'components-adlistcard--property', sel: '[class*="_title_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__title' }],
];

async function read(page, sel, n = 0, props = ALL) {
  return page.evaluate(
    (sel, n, props) => {
      const el = document.querySelectorAll(sel)[n];
      if (!el) return null;
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, p === 'fontFamily' ? cs[p].split(',')[0].replace(/["']/g, '').trim() : cs[p]]));
    },
    sel,
    n,
    props,
  );
}

/** Sub-pixel noise from rem math and rounding isn't drift. */
function same(a, b) {
  if (a === b) return true;
  const na = parseFloat(a);
  const nb = parseFloat(b);
  return /^-?[\d.]+px$/.test(a) && /^-?[\d.]+px$/.test(b) && Math.abs(na - nb) < 0.6;
}

const profile = mkdtempSync(join(tmpdir(), 'dbz-parity-'));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, userDataDir: profile });
const kit = await browser.newPage();
await kit.setViewport({ width: 1440, height: 900 });
await kit.goto(`${KIT}/index.html`, { waitUntil: 'networkidle0', timeout: 60_000 });

const sb = await browser.newPage();
await sb.setViewport({ width: 1440, height: 900 });

let mismatched = 0;
let missing = 0;
const lines = [];
let currentStory = null;
for (const [name, react, html] of PAIRS) {
  if (react.story !== currentStory) {
    await sb.goto(`${SB}/iframe.html?id=${react.story}&viewMode=story`, { waitUntil: 'networkidle0', timeout: 60_000 });
    await sb.waitForSelector('#storybook-root > *', { timeout: 30_000 });
    currentStory = react.story;
  }
  const props = react.props ?? ALL;
  const a = await read(sb, react.sel.split(',').map((x) => (x.trim().startsWith('#storybook-root') ? x : `#storybook-root ${x.trim()}`)).join(', '), react.n, props);
  const b = await read(kit, html.sel, html.n, props);
  if (!a || !b) {
    missing++;
    lines.push(`MISSING  ${name}: ${!a ? 'storybook' : ''}${!a && !b ? ' + ' : ''}${!b ? 'kit' : ''} element not found`);
    continue;
  }
  const diffs = props.filter((p) => !same(a[p], b[p]));
  if (diffs.length) {
    mismatched++;
    lines.push(`DIFF     ${name}`);
    for (const p of diffs) lines.push(`           ${p.padEnd(20)} storybook ${String(a[p]).slice(0, 60).padEnd(34)} kit ${String(b[p]).slice(0, 60)}`);
  } else {
    lines.push(`same     ${name}`);
  }
}

await browser.close();
rmSync(profile, { recursive: true, force: true });
console.log(lines.join('\n'));
console.log(`\n${PAIRS.length - mismatched - missing} identical, ${mismatched} differ, ${missing} not found`);
process.exit(mismatched || missing ? 1 : 0);
