#!/usr/bin/env node
/**
 * Component vs LIVE. check:parity proves Storybook and the kit agree with each other;
 * this proves the component agrees with dubizzle. For each spec it finds the element in a
 * frozen live capture (by its own text, then N levels up to the component root) and the
 * same element in the Storybook story, then:
 *   1. compares computed box + type properties (the values that must match exactly), and
 *   2. screenshots both and pixel-diffs them (share of pixels off by >32 in any channel,
 *      after scaling the story shot onto the live one's size).
 *
 * Needs both servers: npm run dev (6006) and npm run kit (4321, which serves the captures
 * with their fonts). Account captures are local-only; a spec whose capture is missing is
 * reported as "--", not failed.
 *
 *   npm run check:live                # all
 *   npm run check:live -- Portal      # specs whose name contains "Portal"
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = join(ROOT, 'design-kit/reference/live');
const OUT = join(LIVE, 'screens/_live-check');
const SB = process.env.STORYBOOK_URL || 'http://localhost:6006';
const KIT = process.env.KIT_URL || 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
/** A component is "pixel-matched" at or under this share of differing pixels. */
const TOLERANCE = 0.03;
/** Size may differ by this many px (sub-pixel rounding, 1px borders) before it counts. */
const SIZE_SLACK = 2;

/* height is compared rounded, with SIZE_SLACK, below — the raw string differs on sub-pixels */
const BOX = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderTopColor', 'borderTopLeftRadius', 'backgroundColor', 'backgroundImage', 'boxShadow'];
const TYPE = ['color', 'fontSize', 'fontWeight', 'lineHeight'];

/* live: [capture, anchor text | {placeholder} | {selector}, levels up, nth visible match] · story: [id, selector, n]
   mask: [[x, y, w, h]] regions left out of the pixel diff — real content (a listing photo,
   an avatar) that the story can't and shouldn't copy.
   width: compare width too (off where the story's container sets it differently).
   noText / noIcon: skip the text or icon offset compare, only where the two elements hold
   different content (a different page number, a label centred inside a wider live box).
   noHeight: skip the height compare — only where the two are proven to line up by their text
   offsets and the box differs for a reason that isn't visible (see AdCard below). */
export const SPECS = [
  { name: 'AgencyPageHeading / title', live: ['portal-agents.desktop', 'Agency Management', 0], story: ['agency-portal-agencypageheading--with-subtitle', 'h1'], props: TYPE, pixels: true },
  { name: 'PortalTabs sm / switcher', live: ['portal-leads.desktop', 'Phone', 2], story: ['agency-portal-agencyportaltabswitcher--leads', '[role="tablist"]'], props: BOX, width: true, pixels: true },
  { name: 'PortalTabs sm / active tab', live: ['portal-leads.desktop', 'All', 1], story: ['agency-portal-agencyportaltabswitcher--leads', '[role="tab"]'], props: [...BOX, ...TYPE], width: true },
  { name: 'PortalTabs md / switcher', live: ['portal-credit.desktop', 'Owner', 2], story: ['agency-portal-agencyportaltabswitcher--credit-info', '[role="tablist"]'], props: BOX, width: true, pixels: true },
  { name: 'AdState / active', live: ['portal-ads.desktop', 'Active', 0], story: ['agency-portal-adstate--active', '[class*="_state_"]'], props: [...BOX, ...TYPE], width: true, pixels: true },
  { name: 'AdStateFilter / selected', live: ['portal-ads.desktop', 'View all (162)', 1], story: ['agency-portal-adstatefilter--default', 'button'], props: [...BOX, ...TYPE], width: true, pixels: true },
  { name: 'AdStateFilter / resting', live: ['portal-ads.desktop', 'Active Ads (5)', 1], story: ['agency-portal-adstatefilter--default', 'button', 1], props: [...BOX, ...TYPE], width: true, pixels: true },
  { name: 'PortalSearchInput / box', live: ['portal-ads.desktop', { placeholder: 'Search keyword' }, 1], story: ['agency-portal-portalsearchinput--agency-ads', 'label'], props: BOX, width: true, pixels: true },
  { name: 'PortalSelect / field', live: ['portal-candidates.desktop', 'Experience Level', 2], story: ['agency-portal-multiplechoicedropdown--closed', 'button'], props: BOX, width: true, pixels: true },
  { name: 'SortMenu / menu', live: ['sort-menu.desktop', 'Most relevant', 3], story: ['components-sortmenu--default', '[role="listbox"]'], props: BOX, width: true, pixels: true },
  { name: 'LoginDialog / panel', live: ['login-dialog.desktop', 'Login into your Dubizzle account', 4], story: ['feedback-logindialog--default', '[role="dialog"]'], props: ['borderTopLeftRadius', 'backgroundColor'], width: true, pixels: true },
  { name: 'ReportAdDialog / panel', live: ['dpv-report-form.desktop', 'Item report', 3], story: ['feedback-reportaddialog--default', '[role="dialog"]'], props: ['borderTopLeftRadius', 'backgroundColor'], width: true, pixels: true },
  { name: 'ActionsMenu / ad ⋯', live: ['portal-ads-actions.desktop', 'Mark as sold', 2], story: ['agency-portal-actionsmenu--ad-card', '[role="menu"]'], props: BOX, width: true, pixels: true },
  { name: 'ActionsMenu / agent ⋮', live: ['portal-agents-actions.desktop', 'Update Credits', 3], story: ['agency-portal-actionsmenu--agent-row', '[role="menu"]'], props: BOX, width: true, pixels: true },
  { name: 'CreditsSummary / panel', live: ['portal-ads-credits.desktop', 'Available credits', 4, 1], story: ['agency-portal-creditssummary--default', '[class*="_panel_"]'], props: BOX, width: true, pixels: true },
  { name: 'MoreFiltersPanel / panel', live: ['portal-ads-more-filters.desktop', 'Agent Code', 1], story: ['agency-portal-morefilterspanel--default', '[class*="_panel_"]'], props: BOX, width: true, pixels: true },
  { name: 'PortalModal md / panel', live: ['portal-leads-export.desktop', 'Export Details', 3], story: ['agency-portal-portalmodal--export-leads', '[role="dialog"]'], props: BOX, width: true, pixels: true },
  // batch 4
  { name: 'CandidateCard', live: ['portal-candidates.desktop', 'Mona S.', 2], story: ['agency-portal-candidatecard--default', 'article'], props: BOX, width: true, pixels: true, mask: [[17, 17, 40, 40]] },
  { name: 'JobCard / selected', live: ['portal-candidates.desktop', 'Civil Engineer', 2], story: ['agency-portal-jobcard--selected', 'button'], props: BOX, width: true, pixels: true },
  { name: 'JobCard / resting', live: ['portal-candidates.desktop', 'Software Engineer', 2], story: ['agency-portal-jobcard--resting', 'button'], props: BOX, width: true, pixels: true },
  { name: 'VipLeadCard', live: ['portal-vip.desktop', 'Volkswagen ID4 2022', 3], story: ['agency-portal-vipleadcard--default', 'article'], props: BOX, width: true, pixels: true, mask: [[16, 16, 228, 166]], noIcon: true },
  { name: 'PortalSideMenu / rail', live: ['portal-ads.desktop', { selector: 'nav' }, 0], story: ['agency-portal-portalsidemenu--collapsed', 'nav'], props: ['paddingTop', 'paddingLeft', 'backgroundColor'], width: true, pixels: true },
  { name: 'PortalSideMenu / drawer', live: ['portal-ads.desktop', { selector: 'nav' }, 0], expandDrawer: true, story: ['agency-portal-portalsidemenu--expanded', 'nav'], props: ['paddingTop', 'paddingLeft', 'backgroundColor', 'boxShadow'], width: true, pixels: true },
  /* Core components, older than the portal batch — item 0 of "Next up": everything gets the
     same proof. The two ad cards compare computed values and size only: the stories carry
     their own listing (different title, price and photo from today's home page), so a pixel
     diff would measure the copy, not the component. */
  /* noHeight: every text row lands on the same pixel as live (price 185, title 215, specs 240,
     location 268, time 290 — measured), but live's last line sits in a 20px line box and ours
     in a 14px one, so the live <article> measures 3px taller with nothing visible in them. */
  { name: 'AdCard / property grid', live: ['home.desktop', 'Own Your Villa Sea View Fully Finished Over 10 Years', 4], story: ['components-adcard--property', 'article'], props: BOX, width: true, noIcon: true, noHeight: true },
  /* backgroundColor is left out: live paints the white on the media and body wrappers inside a
     transparent <article>, we paint it on the card root — same card, different place to hang it.
     noIcon: live's first image is the real listing photo, ours the placeholder. */
  { name: 'AdListCard / car', live: ['cars-list.desktop', 'Mercedes CLA 200 2026', 4], story: ['components-adlistcard--car', 'article'], props: BOX.filter((p) => p !== 'backgroundColor'), width: true, noIcon: true },
  { name: 'Breadcrumbs / crumb', live: ['cars-list.desktop', 'Cars for Sale', 0, 1], story: ['components-breadcrumbs--default', '[class*="_crumb_"]', 2], props: TYPE },
  { name: 'Footer / bar', live: ['home.desktop', { selector: 'footer' }, 0], story: ['layout-footer--default', 'footer'], props: ['paddingTop', 'backgroundColor', 'backgroundImage'] },
  /* WithoutCategoryStrip, not LoggedOut: live's category strip sits outside <header>, so the
     header element itself is the two rows (68 + 76 = 145, same on home, cars-list, property). */
  /* The icon is masked: same artwork, same two fills (#F6B3B3 / #E00000, both read off live)
     and the same 28×28 box at the same offset, but live draws it as inline <svg> and we ship it
     as an <img>, and the two rasterise a 28px glyph differently. The label and the tab itself
     are compared unmasked. */
  { name: 'Header / active tab', live: ['property.desktop', 'Property', 2], story: ['layout-header--active-vertical-property', '[class*="_navLink_"]', 1], props: ['backgroundColor'], pixels: true, mask: [[16, 6, 30, 30]] },
  { name: 'Header / bar', live: ['home.desktop', { selector: 'header' }, 0], story: ['layout-header--without-category-strip', 'header'], props: ['backgroundColor', 'boxShadow'], width: true },
  /* The only red button in any capture is the header's Post Your Ad, and it carries a 130px
     min-width that belongs to the header, not to Button — so height, padding, radius and colour
     are compared, width is not, and the label's type lives on a span inside live's button. */
  { name: 'Button / primary', live: ['home.desktop', 'Post Your Ad', 2], story: ['components-button--primary', 'button'], props: BOX, noText: true },
  { name: 'Chip / quick', live: ['cars-list.desktop', 'Mercedes-Benz', 0, 1], story: ['components-chip--quick', 'button'], props: [...BOX, ...TYPE], width: true, pixels: true },
  /* the row itself can't be pixel-compared — the story's flex row stretches to Storybook's
     width, while live's sits in a 260px block; its buttons are the part that must match */
  /* no pixel diff on these two: live's row starts at page 1 and the story's at page 5, so the
     crops hold different digits — the box, colours, radius and border are what must match */
  { name: 'Pagination / current page', live: ['cars-list.desktop', '1', 0], story: ['components-pagination--default', '[aria-current]'], props: [...BOX, ...TYPE], width: true, noText: true },
  { name: 'Pagination / page', live: ['cars-list.desktop', '2', 0, 1], story: ['components-pagination--default', 'button', 2], props: [...BOX, ...TYPE], width: true },
  { name: 'BottomNav / bar', live: ['home.mobile', 'Chat', 3], story: ['mobile-bottomnav--home', 'nav'], props: BOX, width: true, pixels: true, mobile: true },
  /* No pixel diff (the story's field stretches to Storybook's width) and no padding compare:
     live hangs the 12px text inset on the <input> inside the field, we hang it on the field so
     the design kit's single <input> can be the same element — the text lands in the same place. */
  { name: 'Input / field', live: ['edit-profile.desktop', { placeholder: 'Name' }, 1], story: ['components-input--default', '[class*="_field_"]'], props: BOX.filter((p) => !p.startsWith('padding')) },
  /* live's mobile home header is a plain grey div, the second block on the page — the first
     390×75 one above it is the app banner, not the header. Padding and backgroundImage are left
     out of the compare: live insets its children rather than the block, and paints the grey as a
     white→grey gradient over a noise PNG we don't ship. The pixel diff (0.3%) covers both. */
  { name: 'MobileHeader / bar', live: ['home.mobile', { selector: 'body > div:nth-child(2) > div:first-child > div:nth-child(2)' }, 0], story: ['mobile-mobileheader--home-full', 'header'], props: ['borderTopWidth', 'borderTopLeftRadius', 'backgroundColor'], width: true, pixels: true, mobile: true },
  /* The panel's own chrome and its rows are what UserMenu owns; its total height is content —
     live's account has a different set of entries from the story's, and live's promo card wraps
     its icon in a 45px block against our 40. Its rows are 57 in both. */
  { name: 'UserMenu / panel', live: ['user-menu.desktop', 'Edit Profile', 4], story: ['layout-usermenu--default', '[class*="_panel_"]'], props: BOX, width: true, noHeight: true, noText: true, noIcon: true },
  { name: 'UserMenu / row', live: ['user-menu.desktop', 'Edit Profile', 2], story: ['layout-usermenu--default', '[class*="_row_"]'], props: [...BOX.filter((p) => !p.startsWith('padding')), ...TYPE], width: true, pixels: true, noText: true },  /* live's inset sits on a div inside the row, which also puts its label's line box 1.5px higher */
  /* live's first row is the highlighted one, so compare its second against ours */
  { name: 'SearchSuggestions / row', live: ['search-suggestions.desktop', 'Car Spare Parts', 2], story: ['components-searchsuggestions--default', '[class*="_row_"]', 2], props: BOX.filter((p) => p !== 'borderTopColor'), noIcon: true, noText: true },  /* the arrow sits at the right edge of a panel as wide as its search field, and live's query is an <em> + <br> where ours is a flex column, so the glyphs sit 3px apart inside the same 45px block */
  { name: 'LocationDropdown / panel', live: ['location-dropdown.desktop', 'Alexandria', 2], story: ['components-locationdropdown--default', '[class*="_panel_"]'], props: BOX, width: true, pixels: true },
  /* no pixels: an <h1> is a block, so each one is as wide as its own container */
  { name: 'PageHead / title', live: ['cars-list.desktop', 'Cars for Sale in Egypt', 0], story: ['components-pagehead--default', 'h1'], props: TYPE },
  { name: 'MobileFilters / header', live: ['m-filters.mobile', 'Reset', 4], story: ['mobile-mobilefilters--page', 'header'], props: BOX, width: true, pixels: true, mobile: true },
];

const PIXEL_PAGE = `<canvas id=a></canvas><canvas id=b></canvas><script>
window.diff = async (A, B, holes) => {
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const [ia, ib] = await Promise.all([load(A), load(B)]);
  const W = ia.width, H = ia.height;
  const ca = document.getElementById('a'), cb = document.getElementById('b');
  ca.width = cb.width = W; ca.height = cb.height = H;
  const xa = ca.getContext('2d'), xb = cb.getContext('2d');
  xa.drawImage(ia, 0, 0); xb.fillStyle = '#fff'; xb.fillRect(0, 0, W, H); xb.drawImage(ib, 0, 0, W, H);
  for (const [x, y, w, h] of holes || []) { xa.fillStyle = xb.fillStyle = '#fff'; xa.fillRect(x, y, w, h); xb.fillRect(x, y, w, h); }
  const da = xa.getImageData(0, 0, W, H).data, db = xb.getImageData(0, 0, W, H).data;
  let off = 0;
  const mask = xa.createImageData(W, H);
  for (let i = 0; i < da.length; i += 4) {
    const bad = Math.abs(da[i] - db[i]) > 32 || Math.abs(da[i + 1] - db[i + 1]) > 32 || Math.abs(da[i + 2] - db[i + 2]) > 32;
    if (bad) off++;
    mask.data[i] = bad ? 224 : 255; mask.data[i + 1] = bad ? 0 : 255; mask.data[i + 2] = bad ? 0 : 255; mask.data[i + 3] = 255;
  }
  // composite for a human: live / ours / diff, 3x
  const S = 3, gap = 6, c = document.createElement('canvas');
  c.width = W * S; c.height = (H * 3 + 2 * gap / S) * S;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#9aa'; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(ca, 0, 0, W * S, H * S); x.drawImage(cb, 0, H * S + gap, W * S, H * S);
  const m = document.createElement('canvas'); m.width = W; m.height = H; m.getContext('2d').putImageData(mask, 0, 0);
  x.drawImage(m, 0, 2 * (H * S + gap), W * S, H * S);
  return { diff: off / (W * H), composite: c.toDataURL('image/png') };
};
</script>`;

async function locate(page, target) {
  return page.evaluate((t) => {
    const [anchor, up, nth] = [t[1], t[2] || 0, t[3] || 0];
    let el = null;
    if (typeof anchor === 'object') el = anchor.selector ? document.querySelector(anchor.selector) : document.querySelector(`input[placeholder="${anchor.placeholder}"]`);
    else {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n, k = 0;
      while ((n = w.nextNode())) {
        if (n.nodeValue.trim() !== anchor || n.parentElement.closest('script,style,nav')) continue;
        const e = n.parentElement;
        let r = e.getBoundingClientRect();
        if (r.width === 0) continue;
        /* below the fold (an ad card down the page) — bring it into view, since the hit test
           and the screenshot clip both work in viewport coordinates */
        if (r.bottom < 0 || r.top > innerHeight) { e.scrollIntoView({ block: 'center' }); r = e.getBoundingClientRect(); }
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        /* an ad card covers its own text with a full-card <a> — that overlay is the card,
           not something hiding it, so accept a hit inside the same card root */
        const card = e.closest('article, li');
        if (!h || !(e.contains(h) || h.contains(e) || (card && card.contains(h)))) continue;
        if (k++ === nth) { el = e; break; }
      }
    }
    if (!el) return null;
    for (let i = 0; i < up; i++) el = el.parentElement;
    el.setAttribute('data-live-check', '1');
    return true;
  }, target);
}

async function read(page, sel, props) {
  return page.evaluate((sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    // where the first line of text and the first icon actually sit inside the component
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t, text = null;
    while ((t = w.nextNode())) if (t.nodeValue.trim()) { const rg = document.createRange(); rg.selectNodeContents(t); const b = rg.getBoundingClientRect(); text = { x: +(b.x - r.x).toFixed(1), y: +(b.y - r.y).toFixed(1), w: +b.width.toFixed(1), s: t.nodeValue.trim().slice(0, 24) }; break; }
    const ic = el.querySelector('svg, img'); let icon = null;
    if (ic) { const b = ic.getBoundingClientRect(); icon = { x: +(b.x - r.x).toFixed(1), y: +(b.y - r.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; }
    /* x/y are PAGE coordinates (rect + scroll): screenshot clips are measured from the document
       origin, and locate() scrolls a below-the-fold anchor into view before we get here. */
    return { w: Math.round(r.width), h: Math.round(r.height), x: r.x + scrollX, y: r.y + scrollY, text, icon, props: Object.fromEntries(props.map((p) => [p, cs[p]])) };
  }, sel, props);
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const specs = SPECS.filter((s) => !only.length || only.some((o) => s.name.includes(o)));
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const live = await browser.newPage();
const story = await browser.newPage();
const pix = await browser.newPage();
await pix.setContent(PIXEL_PAGE);
let problems = 0, checked = 0;
const report = [];

for (const s of specs) {
  const vp = s.mobile ? { width: 390, height: 844, deviceScaleFactor: 1 } : { width: 1440, height: 900, deviceScaleFactor: 1 };
  if (!existsSync(join(LIVE, `${s.live[0]}.html`))) { console.log(`  --   ${s.name.padEnd(30)} capture ${s.live[0]} not on this machine`); continue; }
  await live.setViewport(vp);
  await story.setViewport(vp);
  await live.goto(`${KIT}/reference/live/${s.live[0]}.html`, { waitUntil: 'load' });
  await live.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 300));
  if (s.expandDrawer) {
    /* the drawer isn't captured open; the prototype template toggles live's own classes,
       so open it there (same page, same CSS) */
    await live.goto(`${KIT}/templates/desktop/${s.live[0].replace('.desktop', '')}.html`, { waitUntil: 'load' });
    await live.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
    await live.goto(`${KIT}/templates/desktop/${s.live[0].replace('.desktop', '')}.html`, { waitUntil: 'load' });
    await live.evaluate(() => document.fonts.ready);
    await live.mouse.click(40, 44); // the burger, top-left of the rail
    await live.mouse.move(900, 500);
    await new Promise((r) => setTimeout(r, 1500));
  }
  if (!(await locate(live, s.live))) { console.log(`  MISS ${s.name.padEnd(30)} live anchor not found`); problems++; continue; }
  await story.goto(`${SB}/iframe.html?id=${s.story[0]}&viewMode=story`, { waitUntil: 'load', timeout: 60000 });
  await story.waitForSelector('#storybook-root > *', { timeout: 30000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 400));
  await story.evaluate(() => document.fonts.ready);
  await story.evaluate((sel, n) => { const e = document.querySelectorAll(`#storybook-root ${sel}`)[n || 0]; if (e) e.setAttribute('data-live-check', '1'); }, s.story[1], s.story[2]);
  const props = s.props || [];
  const a = await read(live, '[data-live-check]', props);
  const b = await read(story, '[data-live-check]', props);
  if (!b) { console.log(`  MISS ${s.name.padEnd(30)} story element not found`); problems++; continue; }
  checked++;
  const diffs = props.filter((p) => a.props[p] !== b.props[p]).map((p) => `${p}: live ${a.props[p]} · ours ${b.props[p]}`);
  if (!s.noHeight && Math.abs(a.h - b.h) > SIZE_SLACK) diffs.push(`height: live ${a.h} · ours ${b.h}`);
  if (s.width && Math.abs(a.w - b.w) > SIZE_SLACK) diffs.push(`width: live ${a.w} · ours ${b.w}`);
  if (!s.noText && a.text && b.text && (Math.abs(a.text.x - b.text.x) > 0.6 || Math.abs(a.text.y - b.text.y) > 0.6 || Math.abs(a.text.w - b.text.w) > 1.5))
    diffs.push(`text "${a.text.s}": live @${a.text.x},${a.text.y} w${a.text.w} · ours "${b.text.s}" @${b.text.x},${b.text.y} w${b.text.w}`);
  if (!s.noIcon && a.icon && b.icon && (Math.abs(a.icon.x - b.icon.x) > 0.6 || Math.abs(a.icon.y - b.icon.y) > 0.6 || Math.abs(a.icon.w - b.icon.w) > 0.6 || Math.abs(a.icon.h - b.icon.h) > 0.6))
    diffs.push(`icon: live @${a.icon.x},${a.icon.y} ${a.icon.w}×${a.icon.h} · ours @${b.icon.x},${b.icon.y} ${b.icon.w}×${b.icon.h}`);
  let pct = null;
  if (s.pixels) {
    /* Put ours on the same sub-pixel phase as live before shooting. A live element at
       y = 182.5 (a centred dialog) has soft edges in the capture itself; comparing that with
       a crisp whole-pixel render measures the capture, not us. Two ways to shift — layout
       offset (keeps the text raster path) and transform (survives centred overlays that
       re-snap layout) — render the same component, so both are tried and the closer wins. */
    const frac = (v) => v - Math.floor(v);
    const slug = s.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const fa = join(OUT, `${slug}.live.png`), fb = join(OUT, `${slug}.ours.png`);
    const shot = async (page, r, file) => page.screenshot({ path: file, clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.max(1, r.w), height: Math.max(1, r.h) } });
    const toData = (f) => 'data:image/png;base64,' + readFileSync(f).toString('base64');
    await shot(live, a, fa);
    const base = { x: b.x, y: b.y };
    let best = null;
    for (const mode of ['none', 'layout', 'transform']) {
      await story.evaluate(() => { const e = document.querySelector('#storybook-root'); e.style.position = ''; e.style.left = ''; e.style.top = ''; e.style.transform = ''; });
      const dx = frac(a.x) - frac(base.x), dy = frac(a.y) - frac(base.y);
      if (mode !== 'none') {
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) continue;
        await story.evaluate((m, dx, dy) => {
          const e = document.querySelector('#storybook-root');
          if (m === 'layout') { e.style.position = 'relative'; e.style.left = `${dx}px`; e.style.top = `${dy}px`; }
          else e.style.transform = `translate(${dx}px, ${dy}px)`;
        }, mode, dx, dy);
      }
      const rb = await read(story, '[data-live-check]', []);
      await shot(story, rb, fb);
      const r = await pix.evaluate((A, B, M) => window.diff(A, B, M), toData(fa), toData(fb), s.mask || []);
      if (!best || r.diff < best.diff) best = r;
    }
    pct = best.diff;
    writeFileSync(join(OUT, `${slug}.compare.png`), Buffer.from(best.composite.split(',')[1], 'base64'));
  }
  const pixelOk = pct === null || pct <= TOLERANCE;
  const ok = diffs.length === 0 && pixelOk;
  if (!ok) problems++;
  report.push({ name: s.name, ok, pixels: pct === null ? null : +(pct * 100).toFixed(1), diffs });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${s.name.padEnd(30)} ${pct === null ? '' : `${(pct * 100).toFixed(1).padStart(5)}% px`}  ${a.w}×${a.h} live · ${b.w}×${b.h} ours`);
  for (const d of diffs) console.log(`         ${d}`);
}

await browser.close();
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n${checked} checked · ${problems ? `${problems} off live` : 'all match live'} (pixel tolerance ${TOLERANCE * 100}%) · shots in design-kit/reference/live/screens/_live-check/`);
process.exit(problems ? 1 : 0);
