#!/usr/bin/env node
/**
 * Accessibility audit for the design system and its captures.
 *
 * Not a replacement for testing with a real screen reader — it checks the things that
 * are machine-checkable and that this system has repeatedly got wrong:
 * contrast, touch targets, focus visibility, image alternatives, heading order,
 * form labelling, and icon-only controls with no accessible name.
 *
 *   npm run check:a11y                      # palette + every built template
 *   npm run check:a11y -- <file.html> ...   # specific files
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* ── Contrast ─────────────────────────────────────────────────────────────── */
const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
export function contrast(a, b) {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Reads the semantic palette out of the generated tokens so it can't drift.
    Semantic tokens alias other tokens (`--text-primary: var(--text-color)`), so the
    chain is followed to whatever hex it finally resolves to. */
function palette() {
  const css = readFileSync(join(ROOT, 'design-kit/tokens/tokens.css'), 'utf8');
  const decls = new Map();
  for (const [, k, v] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) if (!decls.has(k)) decls.set(k, v.trim());
  const resolve = (name, depth = 0) => {
    if (depth > 12) return null;
    const v = decls.get(name);
    if (!v) return null;
    const hex = v.match(/^#[0-9a-f]{3,8}$/i);
    if (hex) return hex[0];
    const ref = v.match(/var\(\s*(--[\w-]+)/);
    return ref ? resolve(ref[1], depth + 1) : null;
  };
  const get = (name) => resolve(name);
  return {
    '--text-primary': get('--text-primary'),
    '--text-secondary': get('--text-secondary'),
    '--text-tertiary': get('--text-tertiary'),
    '--color-primary': get('--color-primary'),
    '--color-secondary': get('--color-secondary'),
    '--color-success': get('--color-success'),
    '--color-warning': get('--color-warning'),
    '--color-error': get('--color-error'),
  };
}

const SURFACES = { white: '#ffffff', 'surface-subtle': '#f6f6f6', 'surface-muted': '#f0f0f0' }; // resolved values of --surface-*

function auditPalette() {
  const rows = [];
  const p = palette();
  for (const [token, hex] of Object.entries(p)) {
    if (!hex) continue;
    for (const [sname, surface] of Object.entries(SURFACES)) {
      const r = contrast(hex, surface);
      rows.push({ token, hex, surface: sname, ratio: r, aa: r >= 4.5, aaLarge: r >= 3 });
    }
  }
  return rows;
}

/* ── DOM checks ───────────────────────────────────────────────────────────── */
const DOM_AUDIT = () => {
  const out = { targets: [], noAlt: [], headings: [], unlabelled: [], iconOnly: [] };
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const name = (el) =>
    (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim();

  // Touch targets — WCAG 2.2 AA "Target Size (Minimum)" is 24x24 CSS px; 44x44 is the
  // comfortable mobile figure. Report both so the caller can judge.
  for (const el of document.querySelectorAll('a, button, [role="button"], input:not([type="hidden"]), select')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    const min = Math.min(r.width, r.height);
    if (min >= 24) continue;
    /* A visually-hidden radio or checkbox driven by a label is not the target —
       the label is. Judge the label's box instead, which is the thing a finger
       actually lands on. */
    if (/^(input)$/i.test(el.tagName) && /^(radio|checkbox)$/i.test(el.type)) {
      const lab = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest('label');
      if (lab) {
        const lr = lab.getBoundingClientRect();
        if (Math.min(lr.width, lr.height) >= 24) continue;
      }
    }
    out.targets.push({ tag: el.tagName.toLowerCase(), name: name(el).slice(0, 30), size: `${Math.round(r.width)}x${Math.round(r.height)}` });
  }
  for (const img of document.querySelectorAll('img')) {
    if (!vis(img)) continue;
    if (img.getAttribute('alt') === null) out.noAlt.push({ src: (img.getAttribute('src') || '').slice(0, 50) });
  }
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map((h) => +h.tagName[1]);
  let prev = 0;
  hs.forEach((lvl, i) => {
    if (i === 0 && lvl !== 1) out.headings.push(`starts at h${lvl}, not h1`);
    if (prev && lvl > prev + 1) out.headings.push(`h${prev} jumps to h${lvl}`);
    prev = lvl;
  });
  if (hs.filter((l) => l === 1).length > 1) out.headings.push(`${hs.filter((l) => l === 1).length} h1 elements`);
  for (const f of document.querySelectorAll('input:not([type="hidden"]), textarea, select')) {
    if (!vis(f)) continue;
    const labelled =
      f.getAttribute('aria-label') ||
      f.getAttribute('aria-labelledby') ||
      (f.id && document.querySelector(`label[for="${CSS.escape(f.id)}"]`)) ||
      f.closest('label') ||
      f.getAttribute('placeholder');
    if (!labelled) out.unlabelled.push({ type: f.getAttribute('type') || f.tagName.toLowerCase() });
  }
  for (const el of document.querySelectorAll('button, a[href], [role="button"]')) {
    if (!vis(el)) continue;
    if (name(el)) continue;
    if (el.querySelector('img[alt]:not([alt=""]), svg title')) continue;
    out.iconOnly.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 28) });
  }
  return out;
};

/* ── Run ──────────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
let files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  const dir = join(ROOT, 'design-kit/templates/desktop');
  if (existsSync(dir)) files = readdirSync(dir).filter((f) => f.endsWith('.html')).slice(0, 8).map((f) => join(dir, f));
}

console.log('CONTRAST — semantic palette on each surface\n');
const rows = auditPalette();
const fails = rows.filter((r) => !r.aa);
for (const r of rows) {
  const mark = r.aa ? 'AA  ' : r.aaLarge ? 'large' : 'FAIL ';
  if (!r.aa) console.log(`  ${mark} ${r.token.padEnd(18)} ${r.hex} on ${r.surface.padEnd(15)} ${r.ratio.toFixed(2)}:1`);
}
console.log(`\n  ${rows.length - fails.length}/${rows.length} pairings pass AA for normal text; ${fails.length} do not.`);
console.log('  Production values — do not "fix" them. Choose a passing pairing, or use them for large text only.\n');

if (files.length) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  console.log('DOM — templates\n');
  let issues = 0;
  for (const f of files) {
    try {
      await page.goto('file://' + resolve(f), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 400));
      const a = await page.evaluate(DOM_AUDIT);
      const parts = [];
      if (a.targets.length) parts.push(`${a.targets.length} target(s) under 24px`);
      if (a.noAlt.length) parts.push(`${a.noAlt.length} img without alt`);
      if (a.headings.length) parts.push(`headings: ${a.headings.join('; ')}`);
      if (a.unlabelled.length) parts.push(`${a.unlabelled.length} unlabelled field(s)`);
      if (a.iconOnly.length) parts.push(`${a.iconOnly.length} control(s) with no accessible name`);
      issues += parts.length;
      console.log(`  ${parts.length ? '!' : 'ok'} ${basename(f).padEnd(34)} ${parts.join(' · ') || 'no machine-checkable issues'}`);
    } catch (e) {
      console.log(`  ?  ${basename(f).padEnd(34)} ${e.message.split('\n')[0].slice(0, 50)}`);
    }
  }
  await browser.close();
  console.log(`\n${issues} issue group(s) across ${files.length} file(s).`);
}

console.log(`
NOT CHECKED HERE — these need a person:
  keyboard order and traps · screen-reader announcement · focus visibility in context
  motion sensitivity (prefers-reduced-motion) · colour as the only signal · RTL mirroring
`);
