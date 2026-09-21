#!/usr/bin/env node
/**
 * Reads every agency-portal filter dropdown off live: the options it offers, and the
 * computed style of the open menu. The output drives the prototype's working filters
 * (scripts/lib/prototype.mjs), so a filter in a template opens dubizzle's own option
 * list drawn in dubizzle's own menu style, not an invented one.
 *
 * Read-only: it opens a dropdown, reads it, presses Escape. It never picks an option
 * on live (a pick would re-query, and on VIP Leads could sit next to Purchase).
 *
 * People-valued dropdowns (agents) are never harvested: their options are real names.
 * The prototype fills those from the fixture names instead.
 *
 *   npm run capture:login   (sign in yourself in that window)
 *   npm run extract:portal-filters
 */
import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectToSession, isSignedIn, ORIGIN } from './capture-session.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/content/portal-filters.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// page → the dropdown labels on it (their resting text on live)
const PAGES = {
  'portal-ads': { url: '/en/agencyPortal/ads', dropdowns: ['Egypt', 'Category', 'Product', 'Published date', 'Choose Agent', 'Dealership Location'] },
  'portal-leads': { url: '/en/agencyPortal/leads', dropdowns: ['Agent'] },
  'portal-vip': { url: '/en/agencyPortal/vip', dropdowns: ['Make & Model', 'Year', 'Price', 'KM Driven', 'Fuel Type', 'Egypt'] },
  'portal-candidates': { url: '/en/agencyPortal/jobsApplications', dropdowns: ['Egypt', 'Experience Level', 'Education Level', 'Application Status'] },
  'portal-agents': { url: '/en/agencyPortal/agents', dropdowns: ['Sort by'] },
  'portal-insights': { url: '/en/agencyPortal/insights/cars-market', dropdowns: ['All dubizzle Cars', 'Last month'] },
};
const PEOPLE = /agent/i;
const PHONE = /(?<!\d)(?:(?:\+|00)?20[ \t-]?)?0?1[0125](?:[ \t-]?\d){8}(?!\d)/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;

const browser = await connectToSession();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const out = { source: ORIGIN, extracted: new Date().toISOString().slice(0, 10), pages: {} };

try {
  await page.goto(ORIGIN + '/en/agencyPortal', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);
  if (!(await isSignedIn(page))) throw new Error('Not signed in — sign in yourself in the capture window (npm run capture:login).');

  for (const [name, { url, dropdowns }] of Object.entries(PAGES)) {
    await page.goto(ORIGIN + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    out.pages[name] = {};
    for (const label of dropdowns) {
      if (PEOPLE.test(label)) { out.pages[name][label] = { people: true }; console.log(`  ${name} · ${label}: people — fixtures`); continue; }
      /* Real pointer input: these dropdowns open on mousedown, so element.click() from
         script does nothing (first run: "nothing opened" on every one). */
      const target = await page.evaluate((label) => {
        const leaf = [...document.querySelectorAll('body *')].filter((e) => !e.closest('nav') && e.children.length <= 1 && (e.textContent || '').trim() === label && e.getBoundingClientRect().width > 8)[0];
        if (!leaf) return null;
        /* The field is the outermost close ancestor sized like a field. A border test
           climbed to the whole page on Agency Ads (the border is not on these boxes) and
           the click opened an ad's details drawer instead of the menu. */
        let box = leaf;
        for (let n = leaf, i = 0; n && i < 4; n = n.parentElement, i++) {
          const r = n.getBoundingClientRect();
          if (r.height >= 36 && r.height <= 58 && r.width >= 90 && r.width <= 700) box = n;
        }
        box.scrollIntoView({ block: 'center' });
        box.setAttribute('data-harvest-box', '1');
        window.__before = new Set(document.querySelectorAll('body *'));
        const b = box.getBoundingClientRect();
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }, label);
      let res;
      if (!target) res = { error: 'not found' };
      else {
        await page.mouse.click(target.x, target.y);
        await sleep(1500);
        res = await page.evaluate(() => {
          const box = document.querySelector('[data-harvest-box]');
          box.removeAttribute('data-harvest-box');
          const fresh = [...document.querySelectorAll('body *')].filter((e) => !window.__before.has(e) && e.getBoundingClientRect().height > 0);
          /* The menu is the new element hanging off the field: its top edge at the
             field's bottom, overlapping it horizontally. "Biggest new element" was wrong —
             lazy-loaded list rows appeared during the wait and were read as options
             (first run, discarded: it held ad titles and an agent name). */
          const fb = box.getBoundingClientRect();
          const near = (e) => { const r = e.getBoundingClientRect(); return r.height > 30 && r.top >= fb.bottom - 12 && r.top <= fb.bottom + 40 && r.left < fb.right && r.right > fb.left && r.width < 900; };
          const top = fresh.filter((e) => !fresh.includes(e.parentElement) && near(e));
          const panel = top.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
          if (!panel) return { error: 'nothing opened' };
          const leaves = [...panel.querySelectorAll('*')].filter((e) => e.children.length === 0 && (e.textContent || '').trim());
          const options = [...new Set(leaves.map((e) => e.textContent.trim()))].slice(0, 80);
          const row = leaves.find((e) => e.textContent.trim() === options[options.length > 1 ? 1 : 0]);
          let rowBox = row;
          for (let i = 0; i < 4 && rowBox && rowBox.getBoundingClientRect().height < 32; i++) rowBox = rowBox.parentElement;
          const pick = (el, keys) => { const cs = getComputedStyle(el); return Object.fromEntries(keys.map((k) => [k, cs[k]])); };
          const pb = panel.getBoundingClientRect(), bb = box.getBoundingClientRect();
          const inputs = [...panel.querySelectorAll('input')].map((i) => i.type + (i.placeholder ? ':' + i.placeholder : ''));
          return {
            options, inputs,
            style: {
              panel: { ...pick(panel, ['backgroundColor', 'borderTopWidth', 'borderTopColor', 'borderRadius', 'boxShadow', 'paddingTop', 'paddingLeft', 'maxHeight']), width: Math.round(pb.width), height: Math.round(pb.height), offsetY: Math.round(pb.top - bb.bottom), fieldWidth: Math.round(bb.width) },
              row: row ? { ...pick(rowBox, ['paddingTop', 'paddingLeft', 'backgroundColor']), height: Math.round(rowBox.getBoundingClientRect().height), ...pick(row, ['fontSize', 'fontWeight', 'color', 'lineHeight']) } : null,
              field: pick(box, ['borderTopColor', 'borderTopWidth', 'borderRadius']),
            },
          };
        }).catch((e) => ({ error: e.message }));
        // close: the field toggles its own menu; Escape as a fallback
        await page.mouse.click(target.x, target.y);
        await sleep(600);
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(400);
      }
      if (res.options) {
        // defence in depth: an option list must never carry a contact detail
        const bad = res.options.filter((o) => PHONE.test(o) || EMAIL.test(o));
        if (bad.length) { res.options = res.options.filter((o) => !bad.includes(o)); res.dropped = bad.length; }
      }
      out.pages[name][label] = res;
      console.log(`  ${name} · ${label}: ${res.error || `${res.options.length} options — ${res.options.slice(0, 6).join(' | ')}`}`);
    }
  }
} finally {
  await page.close();
  await browser.disconnect();
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`\nwrote ${OUT.replace(ROOT + '/', '')}`);
