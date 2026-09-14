/**
 * Self-contained, script-free snapshot of a rendered page — the HTML renders like the live
 * page did, without the network or dubizzle's JavaScript.
 *
 * page.content() alone is not enough, and captures made that way re-rendered wrong:
 * - Styles injected at runtime (CSS-in-JS insertRule) live only in the CSSOM, not in the
 *   <style> tags' text, so they vanish from serialized HTML.
 * - dubizzle renders some text through an obfuscation font (the DOM says "AsB/I1", the
 *   font draws "4 minutes ago"). Web fonts don't load cross-origin from a local server,
 *   so the saved page showed the scrambled text.
 * - The site's scripts re-run on open, re-render with no data, and wreck the layout.
 * - Lazy images keep placeholder src / srcset and never load.
 * - Icons are <svg><use href="https://…/sprite.svg#id">; browsers refuse cross-origin <use>,
 *   so icons (location pin, language switch…) went blank. Sprites are inlined into the page.
 * - Carousels keep rotating between the HTML being taken and the screenshot. Timers are
 *   stopped first so both show the same slide.
 *
 * So: record every stylesheet, font and image response while the page loads, then freeze
 * the DOM (applied CSS rules, current image sources, form state, canvases), strip all
 * scripts, and inline fonts (always) and images (optional) as data: URIs.
 *
 * Usage:
 *   const recorder = recordResponses(page);   // before page.goto
 *   ...navigate, scroll...
 *   const html = await snapshotHtml(page, recorder, { inlineImages: true });
 */

const FONT = /\.(woff2?|ttf|otf|eot)(\?|#|$)/i;
const MAX_IMAGE_BYTES = 1_500_000;

export function recordResponses(page) {
  const store = new Map(); // url -> { type, body: Buffer }
  const pending = new Set();
  page.on('response', (response) => {
    const type = response.request().resourceType();
    if (!['stylesheet', 'font', 'image'].includes(type) && !/\.svg(\?|#|$)/i.test(response.url())) return;
    if (response.status() >= 300) return;
    const task = response
      .buffer()
      .then((body) => store.set(response.url(), { type, mime: response.headers()['content-type'] || '', body }))
      .catch(() => {})
      .finally(() => pending.delete(task));
    pending.add(task);
  });
  return { store, settle: () => Promise.all([...pending]) };
}

function mimeFor(url, fallback) {
  if (fallback && !/octet-stream/.test(fallback)) return fallback.split(';')[0];
  const ext = url.split(/[?#]/)[0].split('.').pop().toLowerCase();
  return (
    { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf', eot: 'application/vnd.ms-fontobject', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' }[ext] ||
    'application/octet-stream'
  );
}

async function bodyOf(url, recorder) {
  const hit = recorder.store.get(url);
  if (hit) return hit;
  try {
    const res = await fetch(url, { headers: { Referer: 'https://www.dubizzle.com.eg/' } });
    if (!res.ok) return null;
    return { mime: res.headers.get('content-type') || '', body: Buffer.from(await res.arrayBuffer()) };
  } catch {
    return null;
  }
}

async function toDataUri(url, recorder, limit = Infinity) {
  const hit = await bodyOf(url, recorder);
  if (!hit || hit.body.length > limit) return null;
  return `data:${mimeFor(url, hit.mime)};base64,${hit.body.toString('base64')}`;
}

/** Runs in the page: stop every pending timer so carousels and tickers hold still. */
function stopTimers() {
  const top = setTimeout(() => {}, 0);
  for (let id = 0; id <= top; id++) {
    clearTimeout(id);
    clearInterval(id);
  }
  window.requestAnimationFrame = () => 0;
}

/** Runs in the page. Mutates the live DOM into its frozen form; returns hrefs of sheets it couldn't read. */
function freezeDom() {
  const abs = (css, base) =>
    css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
      if (/^(data:|#)/.test(u)) return m;
      try {
        return `url("${new URL(u, base).href}")`;
      } catch {
        return m;
      }
    });
  const cssOf = (sheet) =>
    [...sheet.cssRules]
      .map((rule) => (rule instanceof CSSImportRule ? (rule.styleSheet ? cssOf(rule.styleSheet) : '') : abs(rule.cssText, sheet.href || location.href)))
      .join('\n');

  const unreadable = [];
  for (const sheet of [...document.styleSheets]) {
    const owner = sheet.ownerNode;
    if (!owner || !owner.parentNode) continue;
    const style = document.createElement('style');
    if (sheet.media?.mediaText) style.setAttribute('media', sheet.media.mediaText);
    if (sheet.disabled) {
      owner.remove();
      continue;
    }
    try {
      style.textContent = cssOf(sheet);
    } catch {
      // cross-origin sheet without CORS: filled in from the recorded response
      style.textContent = `/*SNAPSHOT-SHEET:${sheet.href}*/`;
      unreadable.push(sheet.href);
    }
    owner.replaceWith(style);
  }

  for (const el of document.querySelectorAll('input, textarea, select')) {
    if (el.type === 'checkbox' || el.type === 'radio') el.toggleAttribute('checked', el.checked);
    else if (el.tagName === 'SELECT') for (const o of el.options) o.toggleAttribute('selected', o.selected);
    else if (el.tagName === 'TEXTAREA') el.textContent = el.value;
    else if (el.type !== 'file' && el.type !== 'password') el.setAttribute('value', el.value);
  }

  for (const img of document.images) {
    if (img.currentSrc) img.setAttribute('src', img.currentSrc);
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.removeAttribute('loading');
  }
  for (const source of document.querySelectorAll('picture > source')) source.remove();

  for (const canvas of document.querySelectorAll('canvas')) {
    try {
      const img = document.createElement('img');
      const r = canvas.getBoundingClientRect();
      img.src = canvas.toDataURL();
      img.className = canvas.className;
      img.setAttribute('style', `${canvas.getAttribute('style') || ''};width:${r.width}px;height:${r.height}px`);
      canvas.replaceWith(img);
    } catch {
      /* tainted canvas (cross-origin map tiles) — leave it */
    }
  }

  // Carousels and scroll panes: keep where they were scrolled to.
  for (const el of document.querySelectorAll('body *')) {
    if (el.scrollLeft > 0) el.setAttribute('data-snapshot-scroll-left', String(el.scrollLeft));
  }

  for (const el of document.querySelectorAll('script, noscript, link[rel="preload"], link[rel="modulepreload"], link[rel="prefetch"], link[rel="stylesheet"]')) el.remove();
  for (const el of document.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
  }
  return unreadable;
}

/** Restores carousel scroll offsets when the snapshot opens — the only script a snapshot carries. */
const RESTORE_SCROLL = `<script data-snapshot>document.querySelectorAll('[data-snapshot-scroll-left]').forEach(function(e){e.scrollLeft=+e.getAttribute('data-snapshot-scroll-left')})</script>`;

/**
 * External SVG sprites → one hidden in-page sprite. Each file's ids get a unique prefix
 * (sprites reuse ids like "regular" and gradient ids), and <use> refs point at the copies.
 */
async function inlineSvgSprites(html, recorder, pageUrl) {
  const SPRITE_REF = /(xlink:href|href)="([^"#\s]+\.svg)#([^"]+)"/g;
  const resolve = (u) => new URL(u.replace(/&amp;/g, '&'), pageUrl).href;
  const refs = [...html.matchAll(SPRITE_REF)];
  const files = [...new Set(refs.map((m) => resolve(m[2])))];
  if (!files.length) return html;
  let sprite = '';
  const prefixes = new Map();
  for (const [n, file] of files.entries()) {
    const hit = await bodyOf(file, recorder);
    if (!hit) continue;
    const p = `snap${n}-`;
    prefixes.set(file, p);
    sprite += hit.body
      .toString('utf8')
      .replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/gi, '')
      .replace(/\sid="([^"]+)"/g, ` id="${p}$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
      .replace(/((?:xlink:)?href)="#([^"]+)"/g, `$1="#${p}$2"`);
  }
  html = html.replace(SPRITE_REF, (m, attr, file, id) => {
    const p = prefixes.get(resolve(file));
    return p ? `${attr}="#${p}${id}"` : m;
  });
  const holder = `<svg aria-hidden="true" data-snapshot-sprites style="position:absolute;width:0;height:0;overflow:hidden">${sprite}</svg>`;
  return html.replace(/<body([^>]*)>/i, (m) => `${m}${holder}`);
}

/**
 * Ad slots and embeds are cross-origin iframes whose content can't be serialized — each
 * visible one is replaced by a picture of itself, at the same size.
 */
async function freezeIframes(page) {
  const frames = await page.$$('iframe');
  let n = 0;
  for (const frame of frames) {
    const box = await frame.boundingBox().catch(() => null);
    if (!box || box.width < 20 || box.height < 20) continue;
    const shot = await frame.screenshot({ encoding: 'base64' }).catch(() => null);
    if (!shot) continue;
    await frame.evaluate((el, src) => {
      const r = el.getBoundingClientRect();
      const img = document.createElement('img');
      img.src = src;
      img.className = el.className;
      img.setAttribute('style', `${el.getAttribute('style') || ''};display:block;width:${r.width}px;height:${r.height}px`);
      el.replaceWith(img);
    }, `data:image/png;base64,${shot}`);
    n++;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return n;
}

export async function snapshotHtml(page, recorder, { inlineImages = true, restoreScroll = true } = {}) {
  await page.evaluate(stopTimers);
  await recorder.settle();
  if (inlineImages) await freezeIframes(page);
  const unreadable = await page.evaluate(freezeDom);
  let html = await page.content();
  html = await inlineSvgSprites(html, recorder, page.url());

  for (const href of unreadable) {
    const hit = await bodyOf(href, recorder);
    const css = hit ? hit.body.toString('utf8').replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => (/^data:/.test(u) ? m : `url("${new URL(u, href).href}")`)) : '';
    html = html.split(`/*SNAPSHOT-SHEET:${href}*/`).join(css);
  }

  // Fonts: always inline — they don't load cross-origin, and one of them decodes visible text.
  const urls = new Set([...html.matchAll(/url\("?(https?:[^")]+)"?\)/g)].map((m) => m[1]));
  for (const url of urls) {
    const isFont = FONT.test(url) || recorder.store.get(url)?.type === 'font';
    const isImage = !isFont && (recorder.store.get(url)?.type === 'image' || /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(url));
    if (!isFont && !(inlineImages && isImage)) continue;
    const data = await toDataUri(url, recorder, isFont ? Infinity : MAX_IMAGE_BYTES);
    if (data) html = html.split(url).join(data);
  }

  if (inlineImages) {
    const srcs = new Set([...html.matchAll(/<img\b[^>]*?\ssrc="(https?:[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')));
    for (const src of srcs) {
      const data = await toDataUri(src, recorder, MAX_IMAGE_BYTES);
      if (data) html = html.split(`src="${src.replace(/&/g, '&amp;')}"`).join(`src="${data}"`).split(`src="${src}"`).join(`src="${data}"`);
    }
  }

  if (restoreScroll) html = html.replace(/<\/body>/i, `${RESTORE_SCROLL}</body>`);
  return html;
}
