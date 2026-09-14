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
  ['Chip / inactive', { story: 'components-chip--inactive', sel: '#storybook-root span' }, { sel: '#tags .chip:not(.chip--active)' }],
  ['Chip / active', { story: 'components-chip--active', sel: '#storybook-root span' }, { sel: '#tags .chip--active' }],
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
  ['AdCard / card', { story: 'components-adcard--featured', sel: '[class*="card"]' }, { sel: '#cards .ad-card' }],
  ['AdCard / price', { story: 'components-adcard--featured', sel: '[class*="price"]' }, { sel: '#cards .ad-card__price' }],
  ['AdCard / title', { story: 'components-adcard--featured', sel: '[class*="title"]' }, { sel: '#cards .ad-card__title' }],
  ['AdCard / featured badge', { story: 'components-adcard--featured', sel: '[class*="badge"]' }, { sel: '#cards .ad-card__badge--featured' }],
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
