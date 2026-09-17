#!/usr/bin/env node
/**
 * Builds design-kit/index.html — the visual reference for the design system.
 *
 * Storybook covers the React library for engineers; this is the designer-facing
 * view: one page, no build, no node_modules, open it in any browser. The token
 * sections are generated from tokens.json so the palette and scales can't drift
 * from what the components actually use.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(ROOT, 'design-kit/tokens/tokens.json'), 'utf8'));
const icons = JSON.parse(readFileSync(join(ROOT, 'design-kit/icons/icons.json'), 'utf8'));


/* ── Header mega menu ─────────────────────────────────────────────────────────
   Built from design-kit/content/mega-menus.json, the live menu read by
   scripts/extract-mega-menus.mjs, so the kit shows every real category. Vehicles is pinned
   open (.is-open) so the page has one to look at; hovering any item opens that item's menu. */
const megaMenus = JSON.parse(readFileSync(join(ROOT, 'design-kit/content/mega-menus.json'), 'utf8'));
const fixtures = JSON.parse(readFileSync(join(ROOT, 'design-kit/content/fixtures.json'), 'utf8'));

const CHEVRON =
  '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

const esc = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function megaMenuDemo() {
  const item = (menu, index) => {
    const categories = menu.categories
      .map((category, i) => {
        const subtitle = category.subtitle ? `<span class="mega-menu__cat-subtitle">${esc(category.subtitle)}</span>` : '';
        return (
          `<a class="mega-menu__cat${i === 0 ? ' mega-menu__cat--active' : ''}" href="${esc(category.href ?? '#')}">` +
          `<span class="mega-menu__cat-text"><span class="mega-menu__cat-label">${esc(category.label)}</span>${subtitle}</span>` +
          `${category.panel ? CHEVRON : ''}</a>`
        );
      })
      .join('');
    const panel = menu.categories[0]?.panel;
    const panelHtml = panel
      ? `<div class="mega-menu__panel-wrap"><div class="mega-menu__panel">` +
        `<div class="mega-menu__panel-head"><span class="mega-menu__panel-title">${esc(panel.title ?? menu.categories[0].label)}</span>` +
        `<a class="mega-menu__see-all" href="${esc(panel.seeAllHref ?? '#')}">See All</a></div>` +
        `<div class="mega-menu__links${panel.columns === 2 ? ' mega-menu__links--2' : ''}">` +
        panel.links
          .map((link) => `<a class="mega-menu__link" href="${esc(link.href ?? '#')}"><span>${esc(link.label)}</span>${link.chevron ? CHEVRON : ''}</a>`)
          .join('') +
        `</div></div></div>`
      : '';
    return (
      `<div class="mega-nav__item${index === 0 ? ' is-open' : ''}">` +
      `<a class="mega-nav__label" href="#">${esc(menu.label)}</a>` +
      `<div class="mega-menu"><div class="mega-menu__column">${categories}</div>${panelHtml}</div></div>`
    );
  };
  const subcategories = megaMenus.menus.reduce((n, m) => n + m.categories.length, 0);
  return (
    '      <h3>Header mega menu</h3>\n' +
    `      <p class="note">All ${megaMenus.menus.length} category menus, with the live content read on ${megaMenus._captured} ` +
    `(${subcategories} subcategories). <strong>Hover a category</strong> to open its menu — the open one is marked by a 4px underline. ` +
    'Vehicles is pinned open with <code>.is-open</code> and steps aside as soon as you hover the strip. Swapping the right panel as you ' +
    'move down the left column is the React component\'s behaviour; this page shows the first subcategory\'s panel.</p>\n' +
    '      <div class="demo" style="display:block;min-height:46rem;overflow:visible">' +
    `<nav class="mega-nav" data-parity="mega">${megaMenus.menus.map(item).join('')}</nav>` +
    '</div>\n'
  );
}


/* ── Mobile search + location pages ───────────────────────────────────────────
   The kit shows the same content the components ship: suggestions from the live capture and
   the governorates from fixtures.json. */
function mobilePagesDemo() {
  const SEARCH_ICON =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5" stroke-linecap="round"></path></svg>';
  const ARROW =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const CHEVRON20 =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const suggestions = [
    ['toyota', 'Cars for Sale', false],
    ['toyota', 'Car Spare Parts', true],
    ['toyota', 'Cars for Rent', false],
    ['toyota auris', 'Cars for Sale', false],
  ];
  const searchPage =
    '<div class="m-search-page" data-parity="m-search-page">' +
    '<div class="m-search-page__header">' +
    '<button class="m-search-page__back" type="button" aria-label="Back"><svg width="15" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>' +
    `<div class="m-search-page__field">${SEARCH_ICON}<input class="m-search-page__input" type="search" value="toyota"></div>` +
    '</div><ul class="m-search-page__list">' +
    suggestions
      .map(
        ([query, category, active]) =>
          `<li class="m-search-page__row${active ? ' m-search-page__row--active' : ''}">` +
          '<button class="m-search-page__row-button" type="button"><span class="m-search-page__text">' +
          `<em class="m-search-page__query">${query}</em><span class="m-search-page__category">${category}</span></span>${ARROW}</button></li>`,
      )
      .join('') +
    '</ul></div>';

  const section = (title, rows, chevron) =>
    `<section class="m-location-page__section"><span class="m-location-page__section-title">${title}</span>` +
    rows
      .map(
        (row) =>
          '<button class="m-location-page__row" type="button">' +
          `<span class="m-location-page__row-label">${esc(row)}, Egypt</span>${chevron ? CHEVRON20 : ''}</button>`,
      )
      .join('') +
    '</section>';

  const locationPage =
    '<div class="m-location-page" data-parity="m-location-page"><div class="m-location-page__body">' +
    '<div class="m-location-page__title-row"><button class="m-location-page__close" type="button" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"></path></svg></button>' +
    '<span class="m-location-page__title">Location</span></div>' +
    `<div class="m-location-page__field">${SEARCH_ICON}<input class="m-location-page__input" type="search" value="Egypt"></div>` +
    '<button class="m-location-page__current" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 3L3 10.5l7.5 3 3 7.5L21 3z"></path></svg>Use current location</button>' +
    section('Popular Locations', ['Cairo', 'Giza', 'Alexandria', 'Matruh', 'Red Sea'], false) +
    section('Choose Region', fixtures.locations.governorates, true) +
    '</div><div class="m-location-page__cta-bar"><button class="m-location-page__cta" type="button">Select Egypt</button></div></div>';

  return (
    '      <h3>Mobile search and location pages</h3>\n' +
    '      <p class="note">On mobile these are pages, not the desktop dropdowns — the search field and the location row each open a full screen.</p>\n' +
    '      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem">' +
    `<div><div style="width:39rem;border:1px solid var(--gray-02);border-radius:var(--radius-lg);overflow:hidden">${searchPage}</div></div>` +
    `<div><div style="width:39rem;height:60rem;overflow-y:auto;border:1px solid var(--gray-02);border-radius:var(--radius-lg)">${locationPage}</div></div>` +
    '</div>\n'
  );
}

const colorTokens = tokens.groups.color ?? {};

/** Resolves a `var(--x)` chain down to a literal so swatches can be painted. */
function literal(value, depth = 0) {
  if (depth > 10 || typeof value !== 'string') return value;
  const match = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (!match) return value;
  const target = colorTokens[match[1]] ?? tokens.groups.spacing?.[match[1]] ?? tokens.groups.radius?.[match[1]];
  return target ? literal(target, depth + 1) : value;
}

/** Dark swatches need light labels. */
function isDark(hex) {
  const m = String(hex).match(/^#([0-9a-f]{6})$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

const SCALES = [
  ['Red — primary', /^--red-\d+$/],
  ['Gray — neutral', /^--gray-\d+$/],
  ['Blue', /^--blue-\d+$/],
  ['Yellow', /^--yellow-\d+$/],
  ['Green', /^--green-\d+$/],
];

const SEMANTIC_COLORS = [
  ['--color-primary', 'Brand, CTAs, active states'],
  ['--color-primary-hover', 'Primary button hover'],
  ['--color-primary-active', 'Primary button pressed'],
  ['--color-secondary', 'Links, info, secondary actions'],
  ['--color-success', 'Success, verified'],
  ['--color-warning', 'Warning, Featured accent'],
  ['--color-error', 'Errors, destructive'],
  ['--text-primary', 'Body text'],
  ['--text-secondary', 'Labels, secondary text'],
  ['--text-tertiary', 'Placeholder, meta, disabled'],
  ['--surface-page', 'Page background'],
  ['--surface-subtle', 'Section background'],
  ['--surface-muted', 'Muted background'],
  ['--border-default', 'Default borders'],
  ['--border-input', 'Input borders'],
];

function swatchGrid(entries) {
  return entries
    .map(([name, note]) => {
      const raw = colorTokens[name];
      if (raw === undefined) return '';
      const value = literal(raw);
      return `<figure class="sw">
        <div class="sw__chip${isDark(value) ? ' sw__chip--dark' : ''}" style="background:var(${name})">${value}</div>
        <figcaption><code>${name}</code>${note ? `<span>${note}</span>` : ''}</figcaption>
      </figure>`;
    })
    .join('\n');
}

const colorSections = SCALES.map(([label, pattern]) => {
  const entries = Object.keys(colorTokens)
    .filter((n) => pattern.test(n))
    .sort()
    .map((n) => [n, '']);
  return `<h3>${label}</h3>\n<div class="sw-grid">\n${swatchGrid(entries)}\n</div>`;
}).join('\n');

const TYPE_SIZES = ['--text-xs', '--text-sm', '--text-md', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl'];
const WEIGHTS = [
  ['--weight-regular', 'Regular'],
  ['--weight-semibold', 'Semibold'],
  ['--weight-bold', 'Bold'],
];
const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--space-8', '--space-9', '--space-10'];
const RADII = [
  ['--radius-sm', 'Small elements'],
  ['--radius-md', 'Inputs, buttons'],
  ['--radius-lg', 'Cards, sections'],
  ['--radius-xl', 'Dropdowns'],
  ['--radius-pill', 'Pills, tags'],
];
const SHADOWS = [
  ['--shadow-card', 'Card at rest'],
  ['--shadow-card-hover', 'Card hover'],
  ['--shadow-dropdown', 'Dropdown menus'],
  ['--shadow-control', 'Small controls'],
];

const resolvedSpacing = (name) =>
  literal(tokens.groups.spacing?.[name] ?? '') || tokens.groups.spacing?.[name] || '';

const sampleIcons = Object.entries(icons.categories)
  .flatMap(([category, list]) => list.slice(0, 6).map((i) => ({ ...i, category })))
  .slice(0, 24);

const page = `<!doctype html>
<!-- GENERATED by scripts/build-preview.mjs — rebuild with: npm run build:preview -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>dubizzle Egypt — Design System</title>
<link rel="stylesheet" href="tokens/tokens.css">
<link rel="stylesheet" href="patterns/patterns.css">
<style>
  body { background: var(--surface-page); }
  .shell { display: grid; grid-template-columns: 24rem minmax(0, 1fr); gap: var(--space-8); max-width: 148rem; margin-inline: auto; padding: 0 var(--space-6); }
  .nav { position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto; padding-block: var(--space-6); }
  .nav__brand { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-6); }
  .nav__brand img { height: 3.2rem; }
  .nav a { display: block; padding: 0.6rem var(--space-2); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--text-secondary); }
  .nav a:hover { background: var(--surface-subtle); color: var(--text-primary); }
  .nav hr { border: none; border-top: 0.1rem solid var(--border-default); margin: var(--space-3) 0; }
  .doc { padding-block: var(--space-8) var(--space-10); min-width: 0; }
  .doc > section { padding-block: var(--space-6); border-top: 0.1rem solid var(--border-default); }
  .doc > section:first-of-type { border-top: none; }
  :where(.doc) h1 { font-size: 3.2rem; margin: 0 0 var(--space-2); }
  :where(.doc) h2 { font-size: var(--text-2xl); margin: 0 0 var(--space-2); }
  /* Scoped to section-level headings only — an unscoped .doc h3 outranks .ad-card__title
     and silently misrepresents the component it is supposed to be demonstrating. */
  .doc > section > h3, .do-dont > div > h3 { font-size: var(--text-md); margin: var(--space-6) 0 var(--space-3); color: var(--text-secondary); }
  :where(.doc) p.note { color: var(--text-secondary); font-size: var(--text-sm); margin: 0 0 var(--space-4); max-width: 70rem; }
  .demo { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); padding: var(--space-4); border: 0.1rem solid var(--border-default); border-radius: var(--radius-lg); background: var(--surface-page); }
  .demo--stack { flex-direction: column; align-items: stretch; }
  .demo--muted { background: var(--surface-subtle); }
  .sw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: var(--space-2); }
  .sw { margin: 0; }
  .sw__chip { height: 6.4rem; border-radius: var(--radius-md); border: 0.1rem solid var(--border-default); display: flex; align-items: flex-end; padding: var(--space-2); font-size: 1.1rem; font-family: monospace; color: var(--text-primary); }
  .sw__chip--dark { color: var(--text-inverse); }
  .sw figcaption { margin-top: var(--space-1); display: flex; flex-direction: column; gap: 0.2rem; }
  .sw code { font-size: 1.1rem; color: var(--text-primary); }
  .sw span { font-size: 1.1rem; color: var(--text-tertiary); }
  .row { display: flex; align-items: baseline; gap: var(--space-4); padding-block: var(--space-2); border-bottom: 0.1rem solid var(--border-default); }
  .row:last-child { border-bottom: none; }
  .row code { width: 14rem; flex: none; font-size: 1.2rem; color: var(--text-secondary); }
  .bar { height: 1.6rem; background: var(--color-primary); border-radius: var(--radius-sm); }
  .radius-box { width: 9rem; height: 6rem; background: var(--surface-muted); border: 0.1rem solid var(--border-default); }
  .shadow-box { width: 12rem; height: 7rem; background: var(--surface-page); border-radius: var(--radius-lg); margin: var(--space-2); }
  .icon-tile { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); width: 9rem; }
  .icon-tile img { width: 2.4rem; height: 2.4rem; }
  .icon-tile span { font-size: 1rem; color: var(--text-tertiary); text-align: center; }
  .do-dont { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
  .do-dont ul { display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-sm); }
  .do-dont li { padding-inline-start: var(--space-4); position: relative; color: var(--text-secondary); }
  .do-dont li::before { position: absolute; inset-inline-start: 0; top: 0.4rem; width: 1.4rem; height: 1.4rem; content: ''; }
  .do li::before { background: var(--color-success); mask: url('icons/status/check-circle.svg') center / contain no-repeat; -webkit-mask: url('icons/status/check-circle.svg') center / contain no-repeat; }
  .dont li::before { background: var(--color-error); mask: url('icons/action/close.svg') center / contain no-repeat; -webkit-mask: url('icons/action/close.svg') center / contain no-repeat; }
  .frame { width: 100%; height: 46rem; border: 0.1rem solid var(--border-default); border-radius: var(--radius-lg); background: var(--surface-page); }
  .frame--tall { height: 60rem; }
  .frame-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(34rem, 1fr)); gap: var(--space-4); }
  .frame-label { font-size: var(--text-sm); font-weight: var(--weight-semibold); margin-bottom: var(--space-2); }
  @media (max-width: 950px) {
    .shell { grid-template-columns: minmax(0, 1fr); }
    .nav { position: static; height: auto; }
    .do-dont { grid-template-columns: minmax(0, 1fr); }
  }
</style>
</head>
<body>

<div class="shell">
  <nav class="nav">
    <div class="nav__brand"><img src="icons/brand/logo-with-text.svg" alt="dubizzle"></div>
    <a href="#overview">Overview</a>
    <hr>
    <a href="#colors">Colors</a>
    <a href="#typography">Typography</a>
    <a href="#spacing">Spacing</a>
    <a href="#radii">Radii &amp; shadows</a>
    <a href="#layout">Layout &amp; grid</a>
    <a href="#icons">Icons</a>
    <hr>
    <a href="#buttons">Buttons</a>
    <a href="#forms">Form controls</a>
    <a href="#tags">Chips &amp; pills</a>
    <a href="#cards">Ad cards</a>
    <a href="#nav-components">Tabs &amp; pagination</a>
    <hr>
    <a href="#chrome">Header &amp; footer</a>
    <a href="#mobile">Mobile web</a>
    <a href="#templates">Page templates</a>
    <a href="#rules">Rules</a>
  </nav>

  <main class="doc">

    <section id="overview">
      <h1>dubizzle Egypt Design System</h1>
      <p class="note">
        Extracted from the production <code>dubizzle-maple</code> monorepo — ${tokens.tokenCount.toLocaleString()} tokens,
        ${icons.total} icons, and page templates captured from the live site. Red-primary on white, dense and utilitarian.
        Everything on this page is rendered from the same stylesheets the templates use.
      </p>
      <div class="demo">
        <a class="btn btn--primary" href="templates/index.html">Browse page templates</a>
        <a class="btn btn--secondary" href="reference/live/gallery.html">Live screens</a>
        <a class="btn btn--secondary" href="icons/index.html">Browse all ${icons.total} icons</a>
        <a class="btn btn--ghost" href="tokens/tokens.css">View tokens.css</a>
      </div>
    </section>

    <section id="colors">
      <h2>Colors</h2>
      <p class="note">
        Red is action and brand — never decoration. The UI is white and light gray with red accents.
        Use the semantic aliases in your work; the raw scales exist so the aliases have somewhere to point.
      </p>
      <h3>Semantic aliases — use these</h3>
      <div class="sw-grid">
${swatchGrid(SEMANTIC_COLORS)}
      </div>
${colorSections}
    </section>

    <section id="typography">
      <h2>Typography</h2>
      <p class="note">Proxima Nova for Latin, GESS for Arabic. Base unit is 1rem = 10px.</p>
      <h3>Size scale</h3>
      <div class="demo demo--stack">
${TYPE_SIZES.map(
  (name) => `        <div class="row">
          <code>${name} · ${tokens.groups['font-size']?.[name] ?? literal(name)}</code>
          <span style="font-size:var(${name});font-weight:600">Post your ad in minutes</span>
        </div>`,
).join('\n')}
      </div>
      <h3>Weights</h3>
      <div class="demo demo--stack">
${WEIGHTS.map(
  ([name, label]) => `        <div class="row">
          <code>${name}</code>
          <span style="font-size:1.8rem;font-weight:var(${name})">${label} — Apartment for sale in Zamalek</span>
        </div>`,
).join('\n')}
      </div>
      <h3>Arabic (GESS)</h3>
      <div class="demo">
        <span style="font-family:var(--font-arabic);font-size:2.4rem;font-weight:700">استكشف أكبر سوق في مصر</span>
      </div>
    </section>

    <section id="spacing">
      <h2>Spacing</h2>
      <p class="note">4px base unit. <code>--space-4</code> (16px) is the default. There is no 13px and no 18px.</p>
      <div class="demo demo--stack">
${SPACES.map(
  (name) => `        <div class="row">
          <code>${name} · ${resolvedSpacing(name)}</code>
          <span class="bar" style="width:var(${name})"></span>
        </div>`,
).join('\n')}
      </div>
    </section>

    <section id="radii">
      <h2>Radii &amp; shadows</h2>
      <p class="note">
        Nothing is more rounded than 1.2rem except pills and avatars. All four shadows are
        near-invisible by design — never author a new one.
      </p>
      <h3>Border radius</h3>
      <div class="demo">
${RADII.map(
  ([name, note]) => `        <figure class="sw" style="width:9rem">
          <div class="radius-box" style="border-radius:var(${name})"></div>
          <figcaption><code>${name}</code><span>${note}</span></figcaption>
        </figure>`,
).join('\n')}
      </div>
      <h3>Shadows</h3>
      <div class="demo demo--muted">
${SHADOWS.map(
  ([name, note]) => `        <figure class="sw" style="width:13rem">
          <div class="shadow-box" style="box-shadow:var(${name})"></div>
          <figcaption><code>${name}</code><span>${note}</span></figcaption>
        </figure>`,
).join('\n')}
      </div>
    </section>

    <section id="layout">
      <h2>Layout &amp; grid</h2>
      <p class="note">Extracted from the facelift stylesheets. 768px is the real mobile/desktop split.</p>
      <div class="demo demo--stack">
        <div class="row"><code>Page width</code><span>1280px max, 2.4rem gutters</span></div>
        <div class="row"><code>Search layout</code><span>30.4rem filter rail + fluid results, 1.6rem gap</span></div>
        <div class="row"><code>Results grid</code><span>1 column → 2 at 768px → 3 at 1280px, 1.2rem gap</span></div>
        <div class="row"><code>Ad detail</code><span>content column + 34rem seller rail</span></div>
        <div class="row"><code>Header</code><span>5.9rem with verticals, sticky, z-index 6</span></div>
        <div class="row"><code>Breakpoints</code><span>360 · 480 · <strong>768</strong> · 950 · 1280</span></div>
      </div>
    </section>

    <section id="icons">
      <h2>Icons</h2>
      <p class="note">
        ${icons.total} icons in ${Object.keys(icons.categories).length} categories, all from production.
        Never use emoji, never pull in Lucide or Font Awesome. <!-- ds-ignore -->
      </p>
      <div class="demo">
${sampleIcons
  .map(
    (icon) => `        <div class="icon-tile">
          <img src="icons/${icon.category}/${icon.name}.${icon.path.split('.').pop()}" alt="" loading="lazy">
          <span>${icon.name}</span>
        </div>`,
  )
  .join('\n')}
      </div>
      <p class="note" style="margin-top:1.6rem"><a class="btn btn--secondary" href="icons/index.html">See all ${icons.total} icons</a></p>
    </section>

    <section id="buttons">
      <h2>Buttons</h2>
      <p class="note">Four variants, three sizes. One primary per view — it's the main action.</p>
      <h3>Variants</h3>
      <div class="demo">
        <button class="btn btn--primary">Post Your Ad</button>
        <button class="btn btn--secondary">Cancel</button>
        <button class="btn btn--tertiary">Skip for now</button>
        <button class="btn btn--ghost">View more</button>
      </div>
      <h3>Sizes</h3>
      <div class="demo">
        <button class="btn btn--primary btn--sm">Small</button>
        <button class="btn btn--primary">Default</button>
        <button class="btn btn--primary btn--lg">Large</button>
      </div>
      <h3>Disabled</h3>
      <div class="demo">
        <button class="btn btn--primary" disabled>Primary</button>
        <button class="btn btn--secondary" disabled>Secondary</button>
      </div>
      <h3>Contact CTAs</h3>
      <p class="note">Fixed tints — Chat red, Call blue, WhatsApp green. Don't restyle them.</p>
      <div class="demo">
        <button class="contact-btn contact-btn--chat"><img src="icons/action/chat.svg" alt=""> Chat</button>
        <button class="contact-btn contact-btn--call"><img src="icons/action/call.svg" alt=""> Call</button>
        <button class="contact-btn contact-btn--whatsapp"><img src="icons/social/whatsapp.svg" alt=""> WhatsApp</button>
      </div>
    </section>

    <section id="forms">
      <h2>Form controls</h2>
      <div class="demo demo--stack" style="max-width:46rem">
        <div class="field">
          <label class="field__label" for="p-name">Ad title</label>
          <input class="input" id="p-name" type="text" placeholder="e.g. Apartment for sale in Zamalek 200m">
          <span class="field__hint">Include the area, size and finishing.</span>
        </div>
        <div class="field">
          <label class="field__label" for="p-city">City</label>
          <select class="select" id="p-city">
            <option>Cairo</option>
            <option>Giza</option>
            <option>Alexandria</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="p-desc">Description</label>
          <textarea class="textarea" id="p-desc" placeholder="Describe the property."></textarea>
        </div>
        <div class="field">
          <label class="field__label" for="p-err">Phone number</label>
          <input class="input" id="p-err" type="text" value="012" style="border-color:var(--color-error)">
          <span class="field__error">Enter a valid Egyptian phone number</span>
        </div>
      </div>
      <h3>Selection controls</h3>
      <div class="demo">
        <label class="control"><input type="checkbox" checked><span class="control__box"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Checked</label>
        <label class="control"><input type="checkbox"><span class="control__box"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Unchecked</label>
        <label class="control"><input type="radio" name="demo" checked><span class="control__radio"></span> Selected</label>
        <label class="control"><input type="radio" name="demo"><span class="control__radio"></span> Unselected</label>
        <label class="control"><input type="checkbox" checked><span class="control__track"></span> Toggle on</label>
        <label class="control"><input type="checkbox"><span class="control__track"></span> Toggle off</label>
      </div>
    </section>

    <section id="tags">
      <h2>Chips &amp; pills</h2>
      <p class="note">
        Chips are interactive filters; pills are read-only status. Listing pages use three chip styles
        (measured on dubizzle.com.eg — docs/LIVE-MEASUREMENTS.md). React: <code>&lt;Chip variant=…&gt;</code>.
      </p>
      <h3>Quick filters — <code>.chip</code> · desktop / <code>.chip--mobile</code></h3>
      <div class="demo" data-parity="quick-desktop">
        <button class="chip" type="button">Mercedes-Benz</button><button class="chip" type="button">Hyundai</button><button class="chip" type="button">Fiat</button><button class="chip" type="button">BMW</button><button class="chip" type="button">Kia</button>
      </div>
      <div class="demo" data-parity="quick-mobile">
        <button class="chip chip--mobile" type="button">Mercedes-Benz</button><button class="chip chip--mobile" type="button">Hyundai</button><button class="chip chip--mobile" type="button">Fiat</button><button class="chip chip--mobile" type="button">BMW</button><button class="chip chip--mobile" type="button">Kia</button>
      </div>
      <h3>Filter bar (mobile) — <code>.chip--filter</code>, <code>.is-selected</code> = filter applied</h3>
      <div class="demo" data-parity="filter-bar">
        <button class="chip chip--filter is-selected" type="button" aria-label="Filters"><img src="icons/action/filters.svg" alt="" width="16" height="16"><span class="chip__count">2</span></button>
        <button class="chip chip--filter is-selected" type="button">Cars for Sale<img class="chip__caret" src="icons/navigation/chevron-down.svg" alt=""></button>
        <button class="chip chip--filter" type="button">Brand and Model<img class="chip__caret" src="icons/navigation/chevron-down.svg" alt=""></button>
        <button class="chip chip--filter" type="button">Price<img class="chip__caret" src="icons/navigation/chevron-down.svg" alt=""></button>
      </div>
      <h3>Segment — <code>.chip--segment</code>, <code>.is-selected</code> = blue</h3>
      <div class="demo" data-parity="segment">
        <button class="chip chip--segment is-selected" type="button">All</button>
        <button class="chip chip--segment" type="button">New</button>
        <button class="chip chip--segment" type="button">Used</button>
      </div>
      <h3>Status pills</h3>
      <div class="demo">
        <span class="pill pill--regular">Regular</span>
        <span class="pill pill--success">Live</span>
        <span class="pill pill--featured">Featured</span>
        <span class="pill pill--error">Expired</span>
        <span class="pill pill--boosted">Boosted</span>
      </div>
    </section>

    <section id="cards">
      <h2>Ad cards</h2>
      <p class="note">
        Two card types, each in desktop and mobile web sizes — measured on dubizzle.com.eg
        (docs/LIVE-MEASUREMENTS.md). <strong>Grid</strong> (<code>.ad-card</code> / React
        <code>AdCard</code>): home and landing-page rails and the similar-ads widget on ad pages —
        flat, red price. <strong>List</strong> (<code>.ad-list-card</code> / React
        <code>AdListCard</code>): search results — image beside the details on desktop, stacked on
        mobile, charcoal price, attribute chips and contact buttons.
      </p>
      <h3>Grid — desktop</h3>
      <div class="demo">
        <div style="width:32rem"><article class="ad-card" data-parity="grid-desktop">
            <div class="ad-card__media media-placeholder"></div>
            <div class="ad-card__body">
              <div class="ad-card__price-row"><span class="ad-card__price">EGP 22,130,000</span><span class="ad-card__dp">Down Payment <strong>EGP 1,106,500</strong></span></div>
              <p class="ad-card__title">Own Your Villa Sea View in Hacienda Heneish</p>
              <button class="ad-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
              <div class="ad-card__specs"><span class="ad-card__type">Stand Alone Villa</span><span>4 beds</span><span>5 baths</span><span>220 m²</span></div>
              <div class="ad-card__meta"><span class="ad-card__location">Hacienda Heneish, North Coast</span><span class="ad-card__time">1 minute ago</span></div>
            </div>
          </article></div>
        <div style="width:32rem"><article class="ad-card">
            <div class="ad-card__media media-placeholder"></div>
            <div class="ad-card__body">
              <div class="ad-card__price-row"><span class="ad-card__price">EGP 2,050,000</span><span class="ad-card__note">Negotiable</span></div>
              <p class="ad-card__title">Hyundai Tucson 2025</p>
              <button class="ad-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
              <div class="ad-card__specs"><span>4000 km</span><span>2025</span></div>
              <div class="ad-card__meta"><span class="ad-card__location">Nasr City, Cairo</span><span class="ad-card__time">3 minutes ago</span></div>
            </div>
          </article></div>
        <div style="width:32rem"><article class="ad-card" id="featured-grid-card">
            <div class="ad-card__media media-placeholder"><span class="ad-card__badge ad-card__badge--featured">Featured</span></div>
            <div class="ad-card__body">
              <div class="ad-card__price-row"><span class="ad-card__price">EGP 22,130,000</span><span class="ad-card__dp">Down Payment <strong>EGP 1,106,500</strong></span></div>
              <p class="ad-card__title">Own Your Villa Sea View in Hacienda Heneish</p>
              <button class="ad-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
              <div class="ad-card__specs"><span class="ad-card__type">Stand Alone Villa</span><span>4 beds</span><span>5 baths</span><span>220 m²</span></div>
              <div class="ad-card__meta"><span class="ad-card__location">Hacienda Heneish, North Coast</span><span class="ad-card__time">1 minute ago</span></div>
            </div>
          </article></div>
      </div>
      <h3>Grid — mobile <code>.ad-card--mobile</code></h3>
      <div class="demo">
        <div style="width:18.7rem"><article class="ad-card ad-card--mobile" data-parity="grid-mobile">
            <div class="ad-card__media media-placeholder"></div>
            <div class="ad-card__body">
              <div class="ad-card__price-row"><span class="ad-card__price">EGP 22,130,000</span></div>
              <p class="ad-card__title">Own Your Villa Sea View in Hacienda Heneish</p>
              <button class="ad-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
              <div class="ad-card__specs"><span class="ad-card__type">Stand Alone Villa</span><span>4 beds</span><span>5 baths</span><span>220 m²</span></div>
              <div class="ad-card__meta"><span class="ad-card__location">Hacienda Heneish, North Coast</span><span class="ad-card__time">1 minute ago</span></div>
            </div>
          </article></div>
        <div style="width:18.7rem"><article class="ad-card ad-card--mobile">
            <div class="ad-card__media media-placeholder"></div>
            <div class="ad-card__body">
              <div class="ad-card__price-row"><span class="ad-card__price">EGP 2,050,000</span><span class="ad-card__note">Negotiable</span></div>
              <p class="ad-card__title">Hyundai Tucson 2025</p>
              <button class="ad-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
              <div class="ad-card__specs"><span>4000 km</span><span>2025</span></div>
              <div class="ad-card__meta"><span class="ad-card__location">Nasr City, Cairo</span><span class="ad-card__time">3 minutes ago</span></div>
            </div>
          </article></div>
      </div>
      <h3>List — desktop (property, car, highlighted top slot)</h3>
      <div class="demo demo--stack" style="max-width:96rem">
        <article class="ad-list-card" data-parity="list-desktop">
          <div class="ad-list-card__media media-placeholder"><div class="ad-list-card__dots"><span class="is-active"></span><span></span><span></span><span></span><span></span><span></span></div><span class="ad-list-card__photos"><img src="icons/media/image-count.svg" alt="">10</span><span class="ad-card__badge ad-card__badge--featured">Featured</span></div>
          <div class="ad-list-card__body">
            <div class="ad-list-card__price-row"><span class="ad-list-card__price">EGP 8,400,000</span><span class="ad-list-card__dp">Down Payment <strong>EGP 4,280,000</strong></span><span class="ad-list-card__time-corner">2 weeks ago</span></div>
            <div class="ad-list-card__type-row"><span class="ad-list-card__type">Apartment</span><span class="ad-list-card__divider">|</span><span class="ad-list-card__specs"><span><img src="icons/property/beds.svg" alt="">3 beds</span><span><img src="icons/property/baths.svg" alt="">2 baths</span><span><img src="icons/property/area.svg" alt="">142 m²</span></span></div>
            <h2 class="ad-list-card__title">Apartment for sale with a cash discount in Taj City</h2>
            <button class="ad-list-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
            <div class="attr-chips"><span class="attr-chip">Completion Status <strong>Off-Plan</strong></span><span class="attr-chip">Ownership <strong>Primary</strong></span></div>
            <div class="ad-list-card__meta"><span class="ad-list-card__location"><img src="icons/location/location.svg" alt="">Taj City, New Cairo</span><span class="ad-list-card__time">2 weeks ago</span></div>
          </div>
          <div class="ad-list-card__actions">
            <button class="contact-btn contact-btn--call" type="button"><img src="icons/action/call.svg" alt=""> Call</button>
            <button class="contact-btn contact-btn--whatsapp" type="button"><img src="icons/social/whatsapp.svg" alt=""> WhatsApp</button>
          </div>
        </article>
        <article class="ad-list-card">
          <div class="ad-list-card__media media-placeholder"><div class="ad-list-card__dots"><span class="is-active"></span><span></span><span></span><span></span><span></span><span></span></div><span class="ad-list-card__photos"><img src="icons/media/image-count.svg" alt="">18</span><span class="ad-card__badge ad-card__badge--elite"><img src="icons/status/elite.svg" alt="">Elite</span></div>
          <div class="ad-list-card__body">
            <div class="ad-list-card__price-row"><span class="ad-list-card__price">EGP 3,750,000</span><span class="ad-list-card__dp">Down Payment <strong>EGP 1,125,000</strong></span><span class="ad-list-card__time-corner">17 hours ago</span></div>
            <div class="ad-list-card__brand"><span>Mercedes-Benz</span><span>CLA 200</span></div>
            <h2 class="ad-list-card__title">Mercedes CLA 200 2026</h2>
            <button class="ad-list-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
            <div class="attr-chips attr-chips--stacked"><span class="attr-chip">Year <strong>2026</strong></span><span class="attr-chip">Condition <strong>New</strong></span><span class="attr-chip">Transmission <strong>Automatic</strong></span><span class="attr-chip">Fuel Type <strong>Benzine</strong></span></div>
            <div class="ad-list-card__meta"><span class="ad-list-card__location"><img src="icons/location/location.svg" alt="">New Cairo, Cairo</span><span class="ad-list-card__time">17 hours ago</span></div>
          </div>
          <div class="ad-list-card__actions">
            <button class="contact-btn contact-btn--call" type="button"><img src="icons/action/call.svg" alt=""> Call</button>
            <button class="contact-btn contact-btn--whatsapp" type="button"><img src="icons/social/whatsapp.svg" alt=""> WhatsApp</button>
          </div>
        </article>
        <article class="ad-list-card ad-list-card--highlighted">
          <div class="ad-list-card__media media-placeholder"><div class="ad-list-card__dots"><span class="is-active"></span><span></span><span></span><span></span><span></span><span></span></div><span class="ad-list-card__photos"><img src="icons/media/image-count.svg" alt="">18</span></div>
          <div class="ad-list-card__body">
            <div class="ad-list-card__price-row"><span class="ad-list-card__price">EGP 3,750,000</span><span class="ad-list-card__dp">Down Payment <strong>EGP 1,125,000</strong></span><span class="ad-list-card__time-corner">17 hours ago</span></div>
            <div class="ad-list-card__brand"><span>Mercedes-Benz</span><span>CLA 200</span></div>
            <h2 class="ad-list-card__title">Mercedes CLA 200 2026</h2>
            <button class="ad-list-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button>
            <div class="attr-chips attr-chips--stacked"><span class="attr-chip">Year <strong>2026</strong></span><span class="attr-chip">Condition <strong>New</strong></span><span class="attr-chip">Transmission <strong>Automatic</strong></span><span class="attr-chip">Fuel Type <strong>Benzine</strong></span></div>
            <div class="ad-list-card__meta"><span class="ad-list-card__location"><img src="icons/location/location.svg" alt="">New Cairo, Cairo</span><span class="ad-list-card__time">17 hours ago</span></div>
          </div>
          <div class="ad-list-card__actions">
            <button class="contact-btn contact-btn--call" type="button"><img src="icons/action/call.svg" alt=""> Call</button>
            <button class="contact-btn contact-btn--whatsapp" type="button"><img src="icons/social/whatsapp.svg" alt=""> WhatsApp</button>
          </div>
        </article>
      </div>
      <h3>List — mobile <code>.ad-list-card--mobile</code></h3>
      <div class="demo">
        <div style="width:35.8rem"><article class="ad-list-card ad-list-card--mobile" data-parity="list-mobile">
          <div class="ad-list-card__media media-placeholder"><div class="ad-list-card__dots"><span class="is-active"></span><span></span><span></span><span></span><span></span><span></span></div><span class="ad-card__badge ad-card__badge--featured">Featured</span><button class="ad-list-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button></div>
          <div class="ad-list-card__body">
            <div class="ad-list-card__price-row"><span class="ad-list-card__price">EGP 8,400,000</span><span class="ad-list-card__dp">Down Payment <strong>EGP 4,280,000</strong></span><span class="ad-list-card__time-corner">2 weeks ago</span></div>
            <div class="ad-list-card__type-row"><span class="ad-list-card__type">Apartment</span><span class="ad-list-card__divider">|</span><span class="ad-list-card__specs"><span><img src="icons/property/beds.svg" alt="">3 beds</span><span><img src="icons/property/baths.svg" alt="">2 baths</span><span><img src="icons/property/area.svg" alt="">142 m²</span></span></div>
            
            
            <div class="attr-chips attr-chips--stacked"><span class="attr-chip">Completion Status <strong>Off-Plan</strong></span><span class="attr-chip">Ownership <strong>Primary</strong></span></div>
            <div class="ad-list-card__meta"><span class="ad-list-card__location"><img src="icons/location/location.svg" alt="">Taj City, New Cairo</span></div>
          </div>
          <div class="ad-list-card__actions">
            <button class="contact-btn contact-btn--call" type="button"><img src="icons/action/call.svg" alt=""> Call</button>
            <button class="contact-btn contact-btn--whatsapp" type="button"><img src="icons/social/whatsapp.svg" alt=""> WhatsApp</button>
          </div>
        </article></div>
        <div style="width:35.8rem"><article class="ad-list-card ad-list-card--mobile">
          <div class="ad-list-card__media media-placeholder"><div class="ad-list-card__dots"><span class="is-active"></span><span></span><span></span><span></span><span></span><span></span></div><span class="ad-card__badge ad-card__badge--elite"><img src="icons/status/elite.svg" alt="">Elite</span><button class="ad-list-card__fav" type="button" aria-label="Save"><img src="icons/action/heart.svg" alt=""></button></div>
          <div class="ad-list-card__body">
            <div class="ad-list-card__price-row"><span class="ad-list-card__price">EGP 3,750,000</span><span class="ad-list-card__dp">Down Payment <strong>EGP 1,125,000</strong></span><span class="ad-list-card__time-corner">17 hours ago</span></div>
            <div class="ad-list-card__brand"><span>Mercedes-Benz</span><span>CLA 200</span></div>
            <h2 class="ad-list-card__title">Mercedes CLA 200 2026</h2>
            
            <div class="attr-chips attr-chips--stacked"><span class="attr-chip">Year <strong>2026</strong></span><span class="attr-chip">Condition <strong>New</strong></span><span class="attr-chip">Transmission <strong>Automatic</strong></span><span class="attr-chip">Fuel Type <strong>Benzine</strong></span></div>
            <div class="ad-list-card__meta"><span class="ad-list-card__location"><img src="icons/location/location.svg" alt="">New Cairo, Cairo</span></div>
          </div>
          <div class="ad-list-card__actions">
            <button class="contact-btn contact-btn--call" type="button"><img src="icons/action/call.svg" alt=""> Call</button>
            <button class="contact-btn contact-btn--whatsapp" type="button"><img src="icons/social/whatsapp.svg" alt=""> WhatsApp</button>
          </div>
        </article></div>
      </div>
    </section>

    <section id="mobile">
      <h2>Mobile web</h2>
      <p class="note">Mobile components measured on dubizzle.com.eg at 390px. The landing header scrolls through three states — <strong>1 full</strong> (tiles with icons, search, location), <strong>2 minimized</strong> (labels only), <strong>3 search</strong> (search field only, deep scroll). Listing pages (Property, search results) use the back + search + filter-bar header. React: <code>MobileHeader</code>, <code>BottomNav</code>, <code>SortSaveBar</code> / <code>SellFab</code> / <code>ListingActions</code>, <code>QuickLinks</code>, <code>AppBanner</code>.</p>
      <h3>Header states — home and motors</h3>
      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem"><div><p class="note" style="margin:0 0 0.4rem">home — full</p><div style="width:39rem;background:var(--gray-00)"><div class="m-header m-header--home m-header--full" data-parity="m-home-full"><header class="m-header__bar"><nav class="m-header__tiles"><a class="m-header__tile m-header__tile--active" href="#"><span class="m-icon m-header__logo" style="--i:url(../icons/mobile/logo-dubizzle.svg)"></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-motors.svg" alt=""></span><span class="m-header__tile-label">Motors</span></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-property.svg" alt=""></span><span class="m-header__tile-label">Property</span></span></a></nav><div class="m-header__search-row"><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Search for great finds</span></button><button class="m-header__favourites" type="button" aria-label="Favourites"><img src="icons/action/heart.svg" alt=""></button></div></header><button class="m-header__location m-header__location--below" type="button"><span class="m-icon" style="--i:url(../icons/mobile/location-pin.svg);--s:1.7rem"></span><span>Egypt</span><span class="m-icon" style="--i:url(../icons/navigation/chevron-down.svg);--s:1.2rem"></span></button></div></div></div><div><p class="note" style="margin:0 0 0.4rem">home — minimized</p><div style="width:39rem;background:var(--gray-00)"><div class="m-header m-header--home m-header--minimized" data-parity="m-home-minimized"><header class="m-header__bar"><nav class="m-header__tiles"><a class="m-header__tile m-header__tile--active" href="#"><span class="m-icon m-header__logo" style="--i:url(../icons/mobile/logo-dubizzle.svg)"></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-motors.svg" alt=""></span><span class="m-header__tile-label">Motors</span></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-property.svg" alt=""></span><span class="m-header__tile-label">Property</span></span></a></nav><div class="m-header__search-row"><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Search for great finds</span></button><button class="m-header__favourites" type="button" aria-label="Favourites"><img src="icons/action/heart.svg" alt=""></button></div></header></div></div></div><div><p class="note" style="margin:0 0 0.4rem">home — search</p><div style="width:39rem;background:var(--gray-00)"><div class="m-header m-header--home m-header--search" data-parity="m-home-search"><header class="m-header__bar"><nav class="m-header__tiles"><a class="m-header__tile m-header__tile--active" href="#"><span class="m-icon m-header__logo" style="--i:url(../icons/mobile/logo-dubizzle.svg)"></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-motors.svg" alt=""></span><span class="m-header__tile-label">Motors</span></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-property.svg" alt=""></span><span class="m-header__tile-label">Property</span></span></a></nav><div class="m-header__search-row"><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Search for great finds</span></button><button class="m-header__favourites" type="button" aria-label="Favourites"><img src="icons/action/heart.svg" alt=""></button></div></header></div></div></div><div><p class="note" style="margin:0 0 0.4rem">motors — full</p><div style="width:39rem;background:var(--gray-00)"><div class="m-header m-header--motors m-header--full" data-parity="m-motors-full"><header class="m-header__bar"><nav class="m-header__tiles"><a class="m-header__tile" href="#"><span class="m-icon m-header__logo" style="--i:url(../icons/mobile/logo-dubizzle.svg)"></span></a><a class="m-header__tile m-header__tile--active" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><span class="m-icon" style="--i:url(../icons/mobile/vertical-motors.svg)"></span></span><span class="m-header__tile-label">Motors</span></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-property.svg" alt=""></span><span class="m-header__tile-label">Property</span></span></a></nav><div class="m-header__search-row"><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Search by Car Model</span></button></div><button class="m-header__location" type="button"><span class="m-icon" style="--i:url(../icons/mobile/location-pin.svg);--s:1.5rem"></span><span>Egypt</span><span class="m-icon" style="--i:url(../icons/navigation/chevron-down.svg);--s:1.6rem"></span></button></header></div></div></div><div><p class="note" style="margin:0 0 0.4rem">motors — minimized</p><div style="width:39rem;background:var(--gray-00)"><div class="m-header m-header--motors m-header--minimized" data-parity="m-motors-minimized"><header class="m-header__bar"><nav class="m-header__tiles"><a class="m-header__tile" href="#"><span class="m-icon m-header__logo" style="--i:url(../icons/mobile/logo-dubizzle.svg)"></span></a><a class="m-header__tile m-header__tile--active" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><span class="m-icon" style="--i:url(../icons/mobile/vertical-motors.svg)"></span></span><span class="m-header__tile-label">Motors</span></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-property.svg" alt=""></span><span class="m-header__tile-label">Property</span></span></a></nav><div class="m-header__search-row"><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Search by Car Model</span></button></div></header></div></div></div><div><p class="note" style="margin:0 0 0.4rem">motors — search</p><div style="width:39rem;background:var(--gray-00)"><div class="m-header m-header--motors m-header--search" data-parity="m-motors-search"><header class="m-header__bar"><nav class="m-header__tiles"><a class="m-header__tile" href="#"><span class="m-icon m-header__logo" style="--i:url(../icons/mobile/logo-dubizzle.svg)"></span></a><a class="m-header__tile m-header__tile--active" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><span class="m-icon" style="--i:url(../icons/mobile/vertical-motors.svg)"></span></span><span class="m-header__tile-label">Motors</span></span></a><a class="m-header__tile" href="#"><span class="m-header__tile-body"><span class="m-header__tile-icon"><img src="icons/mobile/vertical-property.svg" alt=""></span><span class="m-header__tile-label">Property</span></span></a></nav><div class="m-header__search-row"><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Search by Car Model</span></button></div></header></div></div></div></div>
      <h3>Listing header — property / search results</h3>
      <div class="demo"><div style="width:39rem;background:var(--gray-00)"><header class="m-listing-header" data-parity="m-listing"><div class="m-listing-header__row"><button class="m-listing-header__back" type="button" aria-label="Back"><span class="m-icon" style="--i:url(../icons/mobile/back.svg)"></span></button><button class="m-search" type="button"><span class="m-icon" style="--i:url(../icons/mobile/search.svg);--s:1.6rem"></span><span class="m-search__placeholder">Properties for Sale &amp; Rent in Egypt<span class="m-search__count">(200,000+ ads)</span></span></button></div><div class="m-listing-header__filters"><button class="chip chip--filter is-selected" type="button" aria-label="Filters"><img src="icons/action/filters.svg" alt="" width="16" height="16"><span class="chip__count">1</span></button><div class="m-listing-header__scroller"><button class="chip chip--filter" type="button">Properties<img class="chip__caret" src="icons/navigation/chevron-down.svg" alt=""></button><button class="chip chip--filter" type="button">Price<img class="chip__caret" src="icons/navigation/chevron-down.svg" alt=""></button><button class="chip chip--filter" type="button">Egypt<img class="chip__caret" src="icons/navigation/chevron-down.svg" alt=""></button></div></div></header></div></div>
      <h3>App banner · bottom navigation · Sort | Save + Sell</h3>
      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem"><div><div style="width:39rem;background:var(--white)"><div class="app-banner" data-parity="m-banner"><button class="app-banner__close" type="button" aria-label="Close"><span class="m-icon" style="--i:url(../icons/mobile/banner-close.svg);--s:1.5rem"></span></button><span class="app-banner__icon"><img src="icons/mobile/banner-app-icon.svg" alt=""></span><div class="app-banner__text"><span class="app-banner__title">Buy and sell faster in app</span><div class="app-banner__badges"><span class="app-banner__badge"><img src="icons/mobile/banner-star.svg" alt="">4.5</span><span class="app-banner__badge"><img src="icons/mobile/banner-download.svg" alt="">10M+</span></div></div><button class="app-banner__cta" type="button">Get App</button></div></div></div><div><div style="width:39rem;background:var(--gray-00)"><div style="padding-top:2.4rem"><nav class="bottom-nav" aria-label="Primary" data-parity="m-nav"><a class="bottom-nav__item bottom-nav__item--active" href="#"><span class="m-icon" style="--i:url(../icons/mobile/nav-home.svg)"></span>Home</a><a class="bottom-nav__item" href="#"><span class="m-icon" style="--i:url(../icons/mobile/nav-chat.svg)"></span>Chat</a><button class="bottom-nav__sell" type="button"><img src="icons/mobile/nav-sell.svg" alt="">Sell</button><a class="bottom-nav__item" href="#"><span class="m-icon" style="--i:url(../icons/mobile/nav-my-ads.svg)"></span>My Ads</a><a class="bottom-nav__item" href="#"><span class="m-icon" style="--i:url(../icons/mobile/nav-account.svg)"></span>Account</a></nav></div></div></div><div><div style="width:39rem;background:var(--gray-00)"><div style="height:20rem;display:flex;align-items:flex-end"><div class="listing-actions" data-parity="m-actions"><button class="sell-fab" type="button">Sell</button><div class="sort-save"><button class="sort-save__action" type="button"><span class="m-icon" style="--i:url(../icons/mobile/sort.svg);--s:2rem"></span>Sort</button><span class="sort-save__divider"></span><button class="sort-save__action" type="button"><span class="m-icon" style="--i:url(../icons/mobile/save-search.svg);--s:2rem"></span>Save</button></div></div></div></div></div></div>
      <h3>Discover tabs · app promo · app banner (scrolled)</h3>
      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem"><div><div style="width:39rem;background:var(--white)"><div class="discover-tabs" data-parity="m-discover"><button class="discover-tabs__tab discover-tabs__tab--active" type="button"><span class="discover-tabs__head"><span class="discover-tabs__label">For You</span><span class="discover-tabs__badge">New</span></span><span class="discover-tabs__subtitle">Curated just for you</span></button><button class="discover-tabs__tab" type="button"><span class="discover-tabs__head"><span class="discover-tabs__label">Recommended</span></span><span class="discover-tabs__subtitle">Handpicked categories</span></button></div></div></div><div><div style="width:39rem;background:var(--white)"><section class="app-promo" data-parity="m-promo"><div class="app-promo__row"><span class="app-promo__image media-placeholder"></span><div class="app-promo__text"><h3 class="app-promo__title">Get more in the app</h3><ul class="app-promo__points"><li class="app-promo__point"><span class="app-promo__tick"><span class="m-icon" style="--i:url(../icons/mobile/promo-check.svg);--s:0.8rem"></span></span>Everything in one place</li><li class="app-promo__point"><span class="app-promo__tick"><span class="m-icon" style="--i:url(../icons/mobile/promo-check.svg);--s:0.8rem"></span></span>Instant notifications</li><li class="app-promo__point"><span class="app-promo__tick"><span class="m-icon" style="--i:url(../icons/mobile/promo-check.svg);--s:0.8rem"></span></span>Quick &amp; Easy Chat</li></ul></div></div><button class="app-promo__cta" type="button">Get App</button></section></div></div><div><div style="width:39rem;background:var(--white)"><div class="app-banner app-banner--compact" data-parity="m-banner-compact"><button class="app-banner__close" type="button" aria-label="Close"><span class="m-icon" style="--i:url(../icons/mobile/banner-close.svg);--s:1.5rem"></span></button><span class="app-banner__icon"><img src="icons/mobile/banner-app-icon.svg" alt=""></span><div class="app-banner__text"><span class="app-banner__title">Buy and sell faster in app</span></div><button class="app-banner__cta" type="button">Get App</button></div></div></div></div>
      <h3>Featured businesses · Prime Dealers row · Explore tiles</h3>
      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem"><div><div style="width:39rem;background:var(--white)"><div style="padding-block:1.6rem"><section class="featured-businesses" data-parity="m-featured"><h2 class="featured-businesses__title">Featured Businesses</h2><div class="featured-businesses__scroller"><a class="featured-businesses__item" href="#"><span class="featured-businesses__logo"></span><span class="featured-businesses__name">Garage 90</span></a><a class="featured-businesses__item" href="#"><span class="featured-businesses__logo"></span><span class="featured-businesses__name">A Class</span></a><a class="featured-businesses__item" href="#"><span class="featured-businesses__logo"></span><span class="featured-businesses__name">New Star Automotive</span></a><a class="featured-businesses__item" href="#"><span class="featured-businesses__logo"></span><span class="featured-businesses__name">El Ola Cars</span></a><a class="featured-businesses__item" href="#"><span class="featured-businesses__logo"></span><span class="featured-businesses__name">Allam Automotive</span></a></div></section></div></div></div><div><div style="width:39rem;background:var(--white)"><label class="prime-dealers" data-parity="m-prime"><span class="prime-dealers__left"><img src="icons/mobile/prime-crown.svg" alt="" width="32" height="32"><span class="prime-dealers__label">Prime Dealers First</span></span><input type="checkbox" class="visually-hidden"><span class="prime-dealers__track"><span class="prime-dealers__knob"></span></span></label></div></div><div><div style="width:39rem;background:var(--white)"><div style="padding-block:1.6rem"><section class="explore-tiles" data-parity="m-explore"><h2 class="explore-tiles__title">Explore dubizzle Motors</h2><div class="explore-tiles__grid"><a class="explore-tiles__tile" href="#"><span class="explore-tiles__text"><span class="explore-tiles__label">New Cars</span></span></a><a class="explore-tiles__tile" href="#"><span class="explore-tiles__text"><span class="explore-tiles__label">Electric Cars</span><span class="explore-tiles__badge">New</span></span></a><a class="explore-tiles__tile" href="#"><span class="explore-tiles__text"><span class="explore-tiles__label">Car Comparison</span></span></a><a class="explore-tiles__tile" href="#"><span class="explore-tiles__text"><span class="explore-tiles__label">Car Finance</span></span></a></div></section></div></div></div></div>
      <h3>Popular searches · mobile footer</h3>
      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem"><div><div style="width:39rem;background:var(--white)"><section class="popular-searches" data-parity="m-popular"><h2 class="popular-searches__heading">Popular Searches</h2><div class="popular-searches__groups"><div class="popular-searches__group"><div class="popular-searches__clip" style="--visible-links:5"><span class="popular-searches__title">Cars for Sale in Egypt</span><ul class="popular-searches__links"><li><a class="popular-searches__link" href="#">Find Cars for Sale in Cairo</a></li><li><a class="popular-searches__link" href="#">Find Cars for Sale in Giza</a></li><li><a class="popular-searches__link" href="#">Find Cars for Sale in Alexandria</a></li><li><a class="popular-searches__link" href="#">Find Cars for Sale in Sharkia</a></li><li><a class="popular-searches__link" href="#">Find Cars for Sale in Dakahlia</a></li><li><a class="popular-searches__link" href="#">Find Cars for Sale in Port Said</a></li><li><a class="popular-searches__link" href="#">Find Cars for Sale in Ismailia</a></li></ul></div><button class="popular-searches__more" type="button">View more<span class="m-icon" style="--i:url(../icons/navigation/chevron-right.svg);--s:1rem"></span></button></div><div class="popular-searches__group"><div class="popular-searches__clip" style="--visible-links:5"><span class="popular-searches__title">Apartments for Sale in Egypt</span><ul class="popular-searches__links"><li><a class="popular-searches__link" href="#">Find Apartments for Sale in Maadi</a></li><li><a class="popular-searches__link" href="#">Find Apartments for Sale in Nasr City</a></li><li><a class="popular-searches__link" href="#">Find Apartments for Sale in New Cairo</a></li><li><a class="popular-searches__link" href="#">Find Apartments for Sale in Heliopolis</a></li><li><a class="popular-searches__link" href="#">Find Apartments for Sale in Agami</a></li><li><a class="popular-searches__link" href="#">Find Apartments for Sale in Mansura</a></li></ul></div><button class="popular-searches__more" type="button">View more<span class="m-icon" style="--i:url(../icons/navigation/chevron-right.svg);--s:1rem"></span></button></div></div></section></div></div><div><div style="width:39rem;background:var(--white)"><footer class="m-footer" data-parity="m-footer"><button class="m-footer__row" type="button"><span class="m-footer__label">Categories</span><span class="m-icon" style="--i:url(../icons/navigation/chevron-right.svg);--s:1.5rem"></span></button><button class="m-footer__row" type="button"><span class="m-footer__label">About Us</span><span class="m-icon" style="--i:url(../icons/navigation/chevron-right.svg);--s:1.5rem"></span></button><button class="m-footer__row" type="button"><span class="m-footer__label">Dubizzle</span><span class="m-icon" style="--i:url(../icons/navigation/chevron-right.svg);--s:1.5rem"></span></button><button class="m-footer__row" type="button"><span class="m-footer__label">Countries</span><span class="m-icon" style="--i:url(../icons/navigation/chevron-right.svg);--s:1.5rem"></span></button><div class="m-footer__follow"><span class="m-footer__label">Follow us</span><div class="m-footer__social"><a href="#"><img src="icons/social/landing-twitter.svg" alt=""></a><a href="#"><img src="icons/social/landing-linkedin.svg" alt=""></a><a href="#"><img src="icons/social/landing-facebook.svg" alt=""></a><a href="#"><img src="icons/social/landing-youtube.svg" alt=""></a><a href="#"><img src="icons/social/landing-instagram.svg" alt=""></a></div></div><div class="m-footer__badges"><a href="#"><img src="icons/brand/app-store-en.svg" alt=""></a><a href="#"><img src="icons/brand/google-play-en.svg" alt=""></a><a href="#"><img src="icons/brand/app-gallery.svg" alt=""></a></div><div class="m-footer__copyright"><span class="m-footer__tagline">Free Classifieds in Egypt.</span> &copy; 2026 Dubizzle</div></footer></div></div></div>
      <h3>Ad detail — gallery, ribbon, contact bar</h3>
      <div class="demo" style="align-items:flex-start;display:grid;grid-template-columns:repeat(auto-fill,39rem);gap:2.4rem"><div><div style="width:39rem;background:var(--white)"><div class="ad-gallery" data-parity="m-gallery"><div class="ad-gallery__placeholder"></div><button class="ad-gallery__back" type="button" aria-label="Back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"></path></svg></button><button class="ad-gallery__next" type="button" aria-label="Next photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--white)" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"></path></svg></button><span class="week-ribbon ad-gallery__ribbon"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95L12 2.5z"></path></svg>Car of the Week</span><div class="ad-gallery__dots" aria-hidden="true"><span class="ad-gallery__dot ad-gallery__dot--active"></span><span class="ad-gallery__dot ad-gallery__dot--near"></span><span class="ad-gallery__dot ad-gallery__dot--far"></span><span class="ad-gallery__dot ad-gallery__dot--far"></span></div><span class="ad-gallery__counter"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3l-1.5 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5L15 3H9zm3 5.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>1 / 15</span></div><div class="contact-bar" data-parity="m-contact-bar"><div class="contact-bar__row"><button class="contact-btn contact-btn--call" type="button"><svg width="20" height="20" viewBox="0 0 20 20" fill="var(--blue-05)" aria-hidden="true"><path d="M16.06 10.827c-.176 0-.362-.056-.539-.096a7.6 7.6 0 0 1-1.055-.314 1.61 1.61 0 0 0-1.997.805l-.178.362a9.812 9.812 0 0 1-2.142-1.61A9.81 9.81 0 0 1 8.54 7.83l.338-.225a1.61 1.61 0 0 0 .805-1.998 8.32 8.32 0 0 1-.314-1.055 5.978 5.978 0 0 1-.097-.547A2.416 2.416 0 0 0 6.855 2H4.439a2.416 2.416 0 0 0-2.416 2.747 15.303 15.303 0 0 0 13.305 13.256h.306a2.416 2.416 0 0 0 2.208-1.431c.139-.313.21-.651.208-.993v-2.416a2.416 2.416 0 0 0-1.99-2.336z"></path></svg>Call</button><button class="contact-btn contact-btn--whatsapp" type="button"><svg width="20" height="20" viewBox="0 0 20 20" fill="#43BB3F" aria-hidden="true"><path d="M10.038.95a9.05 9.05 0 0 1 7.115 3.467 8.929 8.929 0 0 1-.248 11.312 9.013 9.013 0 0 1-3.263 2.413 9.056 9.056 0 0 1-7.898-.331l-4.731 1.238 1.283-4.669a8.94 8.94 0 0 1 .021-8.946 9 9 0 0 1 3.3-3.28A9.057 9.057 0 0 1 10.037.95z"></path></svg>WhatsApp</button></div></div></div></div><div><div style="width:39rem;background:var(--white);padding:1.6rem"><span class="week-ribbon" data-parity="m-week"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95L12 2.5z"></path></svg>Property of the Week</span></div></div></div>
${mobilePagesDemo()}
      <h3>Category quick links</h3>
      <div class="demo"><div style="width:39rem;background:var(--white)"><section class="quick-links" data-parity="m-quick"><h2 class="quick-links__title">Explore Egypt&#39;s Largest Marketplace</h2><div class="quick-links__scroller"><ul class="quick-links__grid" style="--columns:6"><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/vehicles.svg" alt=""></span><span class="quick-links__label">Vehicles</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/navigation/vertical-properties-home.svg" alt=""></span><span class="quick-links__label">Properties</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/mobiles.svg" alt=""></span><span class="quick-links__label">Mobiles &amp; Tablets</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/jobs.svg" alt=""></span><span class="quick-links__label">Jobs</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/furniture.svg" alt=""></span><span class="quick-links__label">Home &amp; Office Furniture - Decor</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/electronics.svg" alt=""></span><span class="quick-links__label">Electronics &amp; Appliances</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/fashion.svg" alt=""></span><span class="quick-links__label">Fashion &amp; Beauty</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/animals.svg" alt=""></span><span class="quick-links__label">Pets - Birds - Ornamental fish</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/kids.svg" alt=""></span><span class="quick-links__label">Kids &amp; Babies</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/bikes.svg" alt=""></span><span class="quick-links__label">Hobbies</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/business.svg" alt=""></span><span class="quick-links__label">Businesses &amp; Industrial</span></a></li><li><a class="quick-links__link" href="#"><span class="quick-links__icon"><img src="icons/category/services.svg" alt=""></span><span class="quick-links__label">Services</span></a></li></ul></div></section></div></div>
    </section>

    <section id="nav-components">
      <h2>Tabs &amp; pagination</h2>
      <div class="demo demo--stack">
        <div class="tabs">
          <button class="tabs__tab tabs__tab--active">Active (6)</button>
          <button class="tabs__tab">Pending (1)</button>
          <button class="tabs__tab">Expired (3)</button>
          <button class="tabs__tab">Drafts (2)</button>
        </div>
      </div>
${megaMenuDemo()}
      <h3>Vertical sub-nav · location dropdown · search suggestions</h3>
      <p class="note">The Motors and Property landings replace the header's search row with the sub-nav. The dropdowns belong to the header's location field and search field.</p>
      <div class="demo" style="display:block"><nav class="vertical-nav" data-parity="vertical-nav"><ul class="vertical-nav__list"><li><a class="vertical-nav__link vertical-nav__link--active" href="#">Cars for Sale</a></li><li><a class="vertical-nav__link" href="#">New Cars</a></li><li><a class="vertical-nav__link" href="#">Electric Cars<span class="vertical-nav__badge">NEW</span></a></li><li><a class="vertical-nav__link" href="#">Car Comparison</a></li><li><a class="vertical-nav__link" href="#">Car Finance</a></li></ul></nav></div>
      <div class="demo" style="align-items:flex-start;gap:2.4rem;flex-wrap:wrap"><div><div class="location-dropdown" data-parity="location-dropdown"><div class="location-dropdown__search"><input class="location-dropdown__input" type="search" placeholder="Search for location"></div><button class="location-dropdown__current" type="button"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3.5"></circle><circle cx="12" cy="12" r="7.5"></circle><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" stroke-linecap="round"></path></svg>Use current location</button><span class="location-dropdown__section">Choose location</span><div class="location-dropdown__list"><button class="location-dropdown__row" type="button"><span class="location-dropdown__all">See ads in all Egypt</span></button>${fixtures.locations.governorates.map((c) => `<button class="location-dropdown__row" type="button"><span class="location-dropdown__label">${c}</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><path d=\"M9 5l7 7-7 7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></button>`).join('')}</div></div></div><div style="width:52rem"><div class="search-suggestions" data-parity="search-suggestions"><button class="search-suggestions__row" type="button"><span class="search-suggestions__text"><span class="search-suggestions__query">toyota</span><span class="search-suggestions__category">Cars for Sale</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button><button class="search-suggestions__row search-suggestions__row--active" type="button"><span class="search-suggestions__text"><span class="search-suggestions__query">toyota</span><span class="search-suggestions__category">Car Spare Parts</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button><button class="search-suggestions__row" type="button"><span class="search-suggestions__text"><span class="search-suggestions__query">toyota</span><span class="search-suggestions__category">Cars for Rent</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button><button class="search-suggestions__row" type="button"><span class="search-suggestions__text"><span class="search-suggestions__query">toyota auris</span><span class="search-suggestions__category">Cars for Sale</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></div></div>

      <h3>Pagination</h3>
      <div class="demo">
        <div class="pagination">
          <button class="pagination__btn" disabled>‹</button>
          <button class="pagination__btn pagination__btn--active">1</button>
          <button class="pagination__btn">2</button>
          <button class="pagination__btn">3</button>
          <button class="pagination__btn">4</button>
          <span class="pagination__btn">…</span>
          <button class="pagination__btn">12</button>
          <button class="pagination__btn">›</button>
        </div>
      </div>
    </section>

    <section id="chrome">
      <h2>Header &amp; footer</h2>
      <p class="note">
        Recreated from the live dubizzle.com.eg markup. Note the search submit is charcoal,
        not red — red is reserved for Post Your Ad.
      </p>
      <div class="frame-grid">
        <div>
          <p class="frame-label">Desktop header + footer</p>
          <iframe class="frame" src="templates/desktop/home.html" title="Desktop home" loading="lazy"></iframe>
        </div>
        <div>
          <p class="frame-label">Mobile header + bottom nav</p>
          <iframe class="frame" src="templates/mobile/home.html" title="Mobile home" loading="lazy"></iframe>
        </div>
      </div>
    </section>

    <section id="templates">
      <h2>Page templates</h2>
      <p class="note">
        Templates are frozen captures of real dubizzle.com.eg pages, desktop and mobile, so they render like production. Copy one and swap the content —
        never start from a blank page.
      </p>
      <div class="frame-grid">
        <div>
          <p class="frame-label">Search results — desktop</p>
          <iframe class="frame frame--tall" src="templates/desktop/search.html" title="Search results" loading="lazy"></iframe>
        </div>
        <div>
          <p class="frame-label">Ad detail — desktop</p>
          <iframe class="frame frame--tall" src="templates/desktop/ad-detail.html" title="Ad detail" loading="lazy"></iframe>
        </div>
      </div>
      <p class="note" style="margin-top:1.6rem"><a class="btn btn--primary" href="templates/index.html">Open the full template gallery</a></p>
    </section>

    <section id="rules">
      <h2>Rules</h2>
      <p class="note">
        The full set is in <code>RULES.md</code>, enforced by <code>npm run check:design</code>.
        These are the ones that most often get broken.
      </p>
      <div class="do-dont">
        <div class="demo demo--stack do">
          <h3 style="margin-top:0">Do</h3>
          <ul>
            <li>Use tokens for every colour, space, radius and shadow</li>
            <li>Use icons from this set — all ${icons.total} of them</li>
            <li>Write real EGP prices and real Egyptian place names</li>
            <li>Keep the ad-card hierarchy: price, title, specs, meta</li>
            <li>Choose the denser layout when torn</li>
            <li>Use logical properties so RTL flips correctly</li>
          </ul>
        </div>
        <div class="demo demo--stack dont">
          <h3 style="margin-top:0">Don't</h3>
          <ul>
            <li>Gradients — only the Featured, Elite and Pro badges</li>
            <li>Emoji as icons, or Lucide / Font Awesome / Google Fonts</li> <!-- ds-ignore -->
            <li>Glassmorphism, blur, or coloured glows</li>
            <li>Scale or bounce on hover — colour transitions only</li>
            <li>Purple, indigo, teal — they appear nowhere in the brand</li>
            <li>Centred marketing heroes or three evenly-weighted cards</li>
            <li>Radius above 1.2rem, or a hand-authored shadow</li>
          </ul>
        </div>
      </div>
    </section>

  </main>
</div>

</body>
</html>
`;

writeFileSync(join(ROOT, 'design-kit/index.html'), page);
console.log(`Built design-kit/index.html — ${tokens.tokenCount} tokens, ${icons.total} icons referenced`);
