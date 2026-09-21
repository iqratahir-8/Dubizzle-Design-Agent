#!/usr/bin/env node
/**
 * Verifies a template prototype actually works as a prototype:
 *   - every wired link resolves to a template that exists (no dead ends)
 *   - clicking each sidebar route in a real browser lands on the page it names
 *   - no generated file carries a phone, an email, or a name known to have leaked
 *
 * The link rewrite in scripts/lib/prototype.mjs is easy to get subtly wrong — a route
 * that matches nothing, a target that was never built — and the result still renders
 * perfectly, it just goes nowhere. So this clicks, rather than trusting the rewrite.
 *
 *   npm run check:prototype
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'design-kit/templates/desktop');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Strings that reached disk in real incidents (D-011, D-017). A regression here is the
// most likely failure, so check for these literally, not just by pattern.
const KNOWN_LEAKS = ['Elboredy', 'Ahmed Agent 1', 'التوريدات', 'جامعة القاهرة'];
const PHONE = /(?<!\d)(?:(?:\+|00)?20[ \t-]?)?0?1[0125](?:[ \t-]?\d){8}(?!\d)/g;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const textOnly = (h) =>
  h
    .replace(/data:[a-z0-9.+/-]+;base64,[A-Za-z0-9+/=]+/gi, '')
    .replace(/<(svg|script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');

const pages = readdirSync(DIR).filter((f) => f.startsWith('portal-') && f.endsWith('.html'));
let problems = 0;

console.log(`PRIVACY — ${pages.length} generated portal pages\n`);
for (const f of pages) {
  const t = textOnly(readFileSync(join(DIR, f), 'utf8'));
  const ph = (t.match(PHONE) || []).filter((p) => p.replace(/\D/g, '') !== '01012345678');
  const em = (t.match(EMAIL) || []).filter((e) => !e.endsWith('example.com'));
  const known = KNOWN_LEAKS.filter((k) => t.includes(k));
  const bad = ph.length || em.length || known.length;
  if (bad) problems++;
  console.log(`  ${bad ? 'LEAK' : 'ok  '} ${f.padEnd(34)}${bad ? ` phones=${ph.length} emails=${em.length} known=[${known.join(', ')}]` : ''}`);
}

console.log(`\nLINKS — every wired target exists\n`);
for (const f of pages) {
  const html = readFileSync(join(DIR, f), 'utf8');
  const targets = [...new Set([...html.matchAll(/data-proto-link="([\w-]+)"/g)].map((m) => m[1]))];
  const dead = targets.filter((t) => !existsSync(join(DIR, `${t}.html`)));
  if (dead.length) problems++;
  console.log(`  ${dead.length ? 'DEAD' : 'ok  '} ${f.padEnd(34)} ${targets.length} target(s)${dead.length ? ` · missing: ${dead.join(', ')}` : ''}`);
}

console.log(`\nCLICK-THROUGH — start at the dashboard, follow every wired route\n`);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const start = 'file://' + join(DIR, 'portal-dashboard.html');
await page.goto(start, { waitUntil: 'domcontentloaded' });
const routes = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-proto-link]')].map((a) => a.getAttribute('data-proto-link')))]);
for (const target of routes) {
  await page.goto(start, { waitUntil: 'domcontentloaded' });
  const clicked = await page.evaluate((t) => {
    const a = document.querySelector(`[data-proto-link="${t}"]`);
    if (!a) return false;
    a.click();
    return true;
  }, target);
  if (!clicked) {
    console.log(`  MISS ${target}`);
    problems++;
    continue;
  }
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
  const landed = page.url().split('/').pop();
  const ok = landed === `${target}.html`;
  if (!ok) problems++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} dashboard → ${target.padEnd(24)} landed on ${landed}`);
}

// The drawer. The reported bug was a drawer that widened with every page title still
// invisible, so assert on the titles themselves, on every page, not on the width.
console.log(`\nDRAWER — open it on every page; every title and the wordmark must show\n`);
for (const f of pages) {
  await page.goto('file://' + join(DIR, f), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
  await page.goto('file://' + join(DIR, f), { waitUntil: 'domcontentloaded' });
  const has = await page.$('header[aria-label="Burger menu"]');
  if (!has) { console.log(`  --   ${f.padEnd(34)} no drawer`); continue; }
  await page.click('header[aria-label="Burger menu"]');
  await page.mouse.move(900, 500);
  await new Promise((r) => setTimeout(r, 1300));
  const r = await page.evaluate(() => {
    const nav = document.querySelector('header[aria-label="Burger menu"]').closest('nav');
    const shown = (el) => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return b.width > 4 && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5; };
    const titles = [...nav.querySelectorAll('a[data-proto-link] span')].filter((s) => s.textContent.trim());
    const brand = [...nav.querySelectorAll('header span')].find((s) => /dubizzle Pro/.test(s.textContent));
    return { total: titles.length, shown: titles.filter(shown).length, brand: !!brand && shown(brand), width: Math.round(nav.getBoundingClientRect().width) };
  });
  const ok = r.total > 0 && r.shown === r.total && r.brand && r.width > 200;
  if (!ok) problems++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${f.padEnd(34)} ${r.shown}/${r.total} titles · wordmark ${r.brand ? 'yes' : 'NO'} · ${r.width}px`);
}

// An offsite link must say so, not silently navigate to production.
await page.goto(start, { waitUntil: 'domcontentloaded' });
const offsite = await page.evaluate(async () => {
  const a = document.querySelector('[data-proto-offsite]');
  if (!a) return 'none on page';
  const before = location.href;
  a.click();
  await new Promise((r) => setTimeout(r, 300));
  const note = document.getElementById('proto-note');
  return before === location.href && note && /not part of this prototype/i.test(note.textContent) ? 'ok' : 'FAIL';
});
if (offsite === 'FAIL') problems++;
console.log(`\n  ${offsite === 'ok' ? 'ok  ' : offsite === 'none on page' ? '--  ' : 'FAIL'} offsite link stays in the prototype and explains why`);

await browser.close();
console.log(`\n${problems ? `${problems} problem(s)` : 'Prototype OK'}`);
process.exit(problems ? 1 : 0);
