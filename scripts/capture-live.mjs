#!/usr/bin/env node
/**
 * Captures live dubizzle.com.eg pages into design-kit/reference/live/ as the
 * ground truth for template work (see docs/CAPTURE-CHECKLIST.md).
 *
 * dubizzle chooses the desktop or mobile app server-side from the User-Agent, so
 * one request per UA returns each layout with its styles inlined — no browser or
 * SingleFile needed. Content that loads after first paint (e.g. "Discover
 * Listings") is not included; the same is true of browser saves.
 *
 *   npm run capture:live                    # capture anything missing
 *   npm run capture:live -- --force         # re-capture everything
 *   npm run capture:live -- car-dpv         # only named pages
 *   npm run capture:live -- --locale=ar     # the Arabic (RTL) side of the same pages,
 *                                           # saved as <name>.ar.<layout>.html
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolutize } from './lib/absolutize.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design-kit/reference/live');
const ORIGIN = 'https://www.dubizzle.com.eg';
const manifest = JSON.parse(readFileSync(join(ROOT, 'design-kit/reference/capture-manifest.json'), 'utf8'));

const USER_AGENTS = {
  desktop:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  mobile:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
};

// Spaced out so a full run is a trickle of page views, not a burst.
const DELAY_MS = 2000;

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((a) => !a.startsWith('--')));
/* dubizzle serves Arabic under /ar/ with dir="rtl" and GESS instead of Proxima Nova. Those
   captures sit beside the English ones as <name>.ar.<layout>.html so nothing overwrites. */
const locale = (args.find((a) => a.startsWith('--locale='))?.split('=')[1] ?? 'en').toLowerCase();
if (!['en', 'ar'].includes(locale)) {
  console.error(`--locale must be en or ar, not "${locale}"`);
  process.exit(2);
}
const suffix = locale === 'en' ? '' : `.${locale}`;
const localize = (path) => (locale === 'en' ? path : path.replace('/en/', '/ar/'));

const pages = Object.values(manifest.tiers).flatMap((tier) => Object.entries(tier));
const unknown = [...only].filter((name) => !pages.some(([n]) => n === name));
if (unknown.length) {
  console.error(`Not in capture-manifest.json: ${unknown.join(', ')}`);
  process.exit(2);
}

mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A 200 isn't proof of a real page — the site serves soft-404s and redirects to /notfound. */
function problemsWith(html, response) {
  const problems = [];
  if (response.status !== 200) problems.push(`HTTP ${response.status}`);
  if (/\/notfound\b/.test(response.url)) problems.push(`redirected to ${response.url}`);
  if (html.length < 200_000) problems.push(`only ${(html.length / 1e3).toFixed(0)}KB`);
  if (/<h1[^>]*>\s*Oops!/i.test(html)) problems.push('"Oops!" not-found page');
  // Only the <title> — every real page embeds STRAT_WITH_CAPTCHA / RECAPTCHA_KEY
  // in its app config, so a body-wide match flags healthy pages as challenges.
  const title = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1] ?? '';
  if (/captcha|access denied|attention required|just a moment|are you a robot/i.test(title)) {
    problems.push(`bot challenge ("${title.trim().slice(0, 40)}")`);
  }
  return problems;
}


/**
 * A browsable index of whatever is on disk. Mobile captures open in a 390px frame
 * beside the list — rendered in a full desktop window they'd stretch and mislead.
 */
function writeIndex() {
  const rows = Object.entries(manifest.tiers)
    .map(([tier, entries]) => {
      const body = Object.entries(entries)
        .map(([name, path]) => {
          const cell = (layout) => {
            const file = `${name}.${layout}.html`;
            if (!existsSync(join(OUT, file))) return '<span class="pill pill--regular">missing</span>';
            const mb = (statSync(join(OUT, file)).size / 1e6).toFixed(1);
            const target = layout === 'mobile' ? ' target="phone"' : ' target="_blank"';
            return `<a class="btn btn--secondary btn--sm" href="${file}"${target}>${layout}</a> <span class="meta">${mb}MB</span>`;
          };
          return `<tr><td><strong>${name}</strong><div class="meta"><a href="${ORIGIN}${path}" target="_blank">${path}</a></div></td><td>${cell('desktop')}</td><td>${cell('mobile')}</td></tr>`;
        })
        .join('\n');
      return `<tr class="tier"><td colspan="3">Tier ${tier}</td></tr>\n${body}`;
    })
    .join('\n');

  writeFileSync(
    join(OUT, 'index.html'),
    `<!doctype html>
<!-- GENERATED by scripts/capture-live.mjs -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Live captures — dubizzle Egypt</title>
<link rel="stylesheet" href="../../tokens/tokens.css"><link rel="stylesheet" href="../../patterns/patterns.css">
<style>
  .wrap { display: grid; grid-template-columns: minmax(0, 1fr) 41rem; gap: var(--space-6); padding: var(--space-6); align-items: start; }
  .meta { font-size: var(--text-xs); color: var(--text-tertiary); word-break: break-all; }
  .tier td { background: var(--surface-subtle); font-weight: var(--weight-bold); }
  .phone { position: sticky; top: var(--space-6); }
  .phone iframe { width: 39rem; height: 84.4rem; border: 0.1rem solid var(--border-default); border-radius: var(--radius-xl); background: var(--surface-page); }
  @media (max-width: 950px) { .wrap { grid-template-columns: minmax(0, 1fr); } }
</style></head>
<body><div class="wrap">
  <main>
    <h1 class="page-head__title">Live captures</h1>
    <p class="meta" style="margin:0.8rem 0 1.6rem">Ground truth for template work, captured from dubizzle.com.eg. Desktop opens in a new tab; mobile renders in the 390px frame. Re-capture with <code>npm run capture:live -- --force</code>.</p>
    <div class="pane"><table class="table"><thead><tr><th>Page</th><th>Desktop</th><th>Mobile</th></tr></thead><tbody>
${rows}
    </tbody></table></div>
  </main>
  <aside class="phone"><p class="meta">Mobile preview (390px)</p><iframe name="phone" title="Mobile preview"></iframe></aside>
</div></body></html>
`,
  );
}

// `--relink` repairs captures already on disk without touching the network.
if (args.includes('--relink')) {
  let count = 0;
  for (const [name] of pages) {
    for (const layout of Object.keys(USER_AGENTS)) {
      const file = join(OUT, `${name}.${layout}.html`);
      if (!existsSync(file)) continue;
      const before = readFileSync(file, 'utf8');
      const after = absolutize(before, ORIGIN);
      if (after !== before) {
        writeFileSync(file, after);
        count++;
      }
    }
  }
  writeIndex();
  console.log(`Relinked ${count} capture(s) to ${ORIGIN}; wrote index.html`);
  process.exit(0);
}

const results = [];
let fetched = 0;

for (const [name, path] of pages) {
  if (only.size && !only.has(name)) continue;
  const label = `${name}${suffix}`;

  for (const [layout, ua] of Object.entries(USER_AGENTS)) {
    const file = join(OUT, `${name}${suffix}.${layout}.html`);
    if (existsSync(file) && !force) {
      results.push({ name: label, layout, status: 'kept', detail: `${(statSync(file).size / 1e6).toFixed(1)}MB existing` });
      continue;
    }

    if (fetched++) await sleep(DELAY_MS);
    try {
      const response = await fetch(ORIGIN + localize(path), {
        headers: { 'User-Agent': ua, 'Accept-Language': locale },
        redirect: 'follow',
      });
      const html = await response.text();
      const problems = problemsWith(html, response);
      if (problems.length) {
        results.push({ name: label, layout, status: 'FAILED', detail: problems.join('; ') });
        continue;
      }
      writeFileSync(file, absolutize(html, ORIGIN));
      const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1].replace(/<[^>]+>/g, '').trim();
      results.push({ name: label, layout, status: 'saved', detail: `${(html.length / 1e6).toFixed(1)}MB · ${h1 ?? '(no h1)'}` });
    } catch (error) {
      results.push({ name: label, layout, status: 'FAILED', detail: error.message });
    }
  }
}

for (const r of results) {
  console.log(`${r.status.padEnd(6)}  ${`${r.name}.${r.layout}`.padEnd(28)} ${r.detail}`);
}
writeIndex();
const failed = results.filter((r) => r.status === 'FAILED');
console.log(
  `\n${results.filter((r) => r.status === 'saved').length} saved, ` +
    `${results.filter((r) => r.status === 'kept').length} kept, ${failed.length} failed`,
);
process.exit(failed.length ? 1 : 0);
