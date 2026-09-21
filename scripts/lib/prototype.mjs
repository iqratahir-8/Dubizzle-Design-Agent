/**
 * Turns a set of frozen captures into a clickable prototype.
 *
 * A capture is a single frozen page: its links still point at live dubizzle, so
 * clicking the agency portal's sidebar in a template would leave the design system
 * for production. This rewrites those links to the sibling templates instead, so the
 * captured screens navigate to each other the way the product does — in the kit, and
 * inside Storybook's frame.
 *
 * Nothing about the pages themselves changes. Each capture already shows its own
 * sidebar item as active, because each was captured on its own route, so wiring the
 * links gives correct active states for free.
 *
 * Used by scripts/build-live-templates.mjs.
 */

const ORIGIN = 'https://www.dubizzle.com.eg';

/**
 * Agency portal route graph, most specific first. Built by walking every link in the
 * eight top-level captures (2026-09-21). Query strings are dropped before matching, so
 * pagination (?page=2) lands on the same screen rather than a dead end, and every
 * per-ad or per-job URL maps to the one representative capture of that screen.
 */
export const PORTAL_ROUTES = [
  [/^\/(en\/)?agencyPortal\/?$/, 'portal-dashboard'],
  [/^\/en\/agencyPortal\/ads\/extraDetails\/[^/]+\/overview\/?$/, 'portal-ad-overview'],
  [/^\/en\/agencyPortal\/ads\/?$/, 'portal-ads'],
  [/^\/en\/agencyPortal\/leads\/?$/, 'portal-leads'],
  [/^\/en\/agencyPortal\/vip\/?$/, 'portal-vip'],
  [/^\/en\/agencyPortal\/jobsApplications\/[^/]+\/?$/, 'portal-candidate-detail'],
  [/^\/en\/agencyPortal\/jobsApplications\/?$/, 'portal-candidates'],
  [/^\/en\/agencyPortal\/agents\/?$/, 'portal-agents'],
  [/^\/en\/agencyPortal\/insights(\/.*)?$/, 'portal-insights'],
  [/^\/en\/agencyPortal\/creditInfo\/self\/?$/, 'portal-credit-self'],
  [/^\/en\/agencyPortal\/creditInfo\/agents\/?$/, 'portal-credit-agents'],
  [/^\/en\/agencyPortal\/creditInfo(\/all)?\/?$/, 'portal-credit'],
];

export const PROTOTYPES = {
  'agency-portal': { member: (name) => name.startsWith('portal-'), routes: PORTAL_ROUTES },
};

export function prototypeFor(name) {
  for (const [id, p] of Object.entries(PROTOTYPES)) if (p.member(name)) return { id, ...p };
  return null;
}

function pathOf(href) {
  let h = href;
  if (h.startsWith(ORIGIN)) h = h.slice(ORIGIN.length);
  else if (/^https?:\/\//i.test(h)) return null; // another site entirely
  if (!h.startsWith('/')) return null; // fragment, mailto:, relative asset
  return h.split('#')[0].split('?')[0];
}

/**
 * Rewrites every <a href> in a prototype member.
 *   portal route with a built target → the sibling template (stays in the prototype)
 *   any other dubizzle link           → neutralised, so the prototype cannot escape to
 *                                        production; the original path is kept on the
 *                                        element so a click can say where it would go
 * Asset <link href>s are untouched — only anchors navigate.
 */
export function wirePrototype(html, proto, isAvailable) {
  let wired = 0;
  let neutralised = 0;
  const out = html.replace(/<a\b([^>]*?)\shref="([^"]*)"([^>]*)>/gi, (whole, pre, href, post) => {
    const path = pathOf(href);
    if (path === null) return whole;
    const hit = proto.routes.find(([re]) => re.test(path));
    const attrs = `${pre}${post}`.replace(/\s(target|rel)="[^"]*"/gi, '');
    if (hit && isAvailable(hit[1])) {
      wired++;
      return `<a${attrs} href="${hit[1]}.html" data-proto-link="${hit[1]}">`;
    }
    neutralised++;
    return `<a${attrs} href="#" data-proto-offsite="${path.replace(/"/g, '&quot;')}">`;
  });
  return { html: out, wired, neutralised };
}

/**
 * The prototype's only behaviour beyond links. Two jobs:
 *   - dismiss the portal's "Ok, I understand" notice, which a frozen page cannot do
 *   - say so when a link leads outside the prototype, instead of silently doing nothing
 * Kept tiny and dependency-free; the captures have their own scripts stripped.
 */
export const PROTOTYPE_RUNTIME = `<script>
(function () {
  function note(text) {
    var n = document.getElementById('proto-note');
    if (!n) {
      n = document.createElement('div');
      n.id = 'proto-note';
      n.setAttribute('role', 'status');
      n.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;' +
        'background:#23262a;color:#fff;font:14px/1.4 ProximaNova,system-ui,sans-serif;padding:10px 16px;' +
        'border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.22);opacity:0;transition:opacity .15s cubic-bezier(.4,0,.2,1);' +
        'max-width:90vw;pointer-events:none';
      document.body.appendChild(n);
    }
    n.textContent = text;
    n.style.opacity = '1';
    clearTimeout(n._t);
    n._t = setTimeout(function () { n.style.opacity = '0'; }, 2200);
  }
  document.addEventListener('click', function (e) {
    var off = e.target.closest && e.target.closest('[data-proto-offsite]');
    if (off) {
      e.preventDefault();
      note('Not part of this prototype: ' + off.getAttribute('data-proto-offsite'));
      return;
    }
    var t = e.target.closest && e.target.closest('button, [role="button"], a');
    if (t && /^\\s*ok, i understand\\s*$/i.test(t.textContent || '')) {
      e.preventDefault();
      var box = t;
      for (var i = 0; i < 12 && box.parentElement; i++) {
        box = box.parentElement;
        var cs = getComputedStyle(box);
        if (cs.position === 'fixed' || cs.position === 'absolute' || box.getAttribute('role') === 'dialog') break;
      }
      box.style.display = 'none';
    }
  }, true);
})();
</script>`;
