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

/* The portal's sidebar drawer. Clicking the burger on live swaps ONE class on the
   <nav>: collapsed (80px icon rail) ↔ expanded (a 25rem panel with each page title
   beside its icon). Both sets of rules are already in the captured stylesheet, so the
   prototype toggles dubizzle's real CSS rather than imitating it (measured 2026-09-21).
   The trigger is found by the product's own aria-label, which survives a redeploy;
   the two class names are build hashes and are re-checked on every build. */
export const PORTAL_DRAWER = {
  trigger: 'header[aria-label="Burger menu"]',
  collapsed: '_4a96f724',
  expanded: '_36772a2f',
  /* Swapping the nav class alone widens the drawer but leaves every page title
     invisible, which is the bug the user reported. Nothing in the CSS reverses the
     collapsed-only classes under the expanded class: on live, React strips them from
     each element when the drawer opens. A frozen capture has lost React, so the runtime
     does it. The captured rules fade the text in over 1s — live's own motion. */
  /* Classes that exist only in the collapsed state, measured from the captured CSS.
     Two hide text (opacity:0; position:absolute) and two centre an icon in the 80px
     rail. The runtime strips all four on open and restores them on close. */
  collapsedOnly: [
    '_09ded1f5', // each page title       — hidden
    'c14480cc', // "dubizzle Pro" wordmark — hidden
    '_647a463c', // each nav row           — icon centred
    '_63d57cdb', // the burger row         — icon centred
  ],
};

export const PROTOTYPES = {
  'agency-portal': { member: (name) => name.startsWith('portal-'), routes: PORTAL_ROUTES, drawer: PORTAL_DRAWER },
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
export function prototypeRuntime(proto) {
  const drawer = JSON.stringify(proto.drawer || null);
  return `<script>
(function () {
  var DRAWER = ${drawer};
  var KEY = 'proto-drawer:' + ${JSON.stringify(proto.id)};

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

  /* Drawer. The state is kept for the session so that opening the drawer and then
     picking a page does not snap it shut on arrival, which would read as a bug in a
     prototype. Storage can throw (private mode); the drawer still works without it. */
  var nav = null, owned = [], pinned = false;
  /* Reveal or hide. Each node is cached with the classes it carried at load: once a
     class is removed the node can no longer be found by it. */
  function reveal(on) {
    for (var i = 0; i < owned.length; i++) {
      for (var k = 0; k < owned[i].cls.length; k++) owned[i].el.classList.toggle(owned[i].cls[k], !on);
    }
  }
  function setDrawer(open) {
    if (!nav) return;
    pinned = open;
    // Closing while the pointer is still over the rail leaves it hover-expanded, so the
    // titles must stay visible until the pointer actually leaves.
    reveal(open || nav.matches(':hover'));
    nav.classList.toggle(DRAWER.expanded, open);
    nav.classList.toggle(DRAWER.collapsed, !open);
    var t = nav.querySelector(DRAWER.trigger);
    if (t) t.setAttribute('aria-expanded', String(open));
    try { sessionStorage.setItem(KEY, open ? '1' : '0'); } catch (e) {}
  }
  function isOpen() { return pinned; }
  if (DRAWER) {
    var trig = document.querySelector(DRAWER.trigger);
    nav = trig && trig.closest('nav');
    if (nav) {
      [].slice.call(nav.querySelectorAll('*')).forEach(function (el) {
        var cls = DRAWER.collapsedOnly.filter(function (c) { return el.classList.contains(c); });
        if (cls.length) owned.push({ el: el, cls: cls });
      });
      /* The collapsed rail also expands on hover in live CSS
         (.cd0bc53c:not(expanded):hover { width: 25rem }). Show the titles for the hover
         too, or the rail widens into an empty panel. */
      nav.addEventListener('mouseenter', function () { if (!pinned) reveal(true); });
      nav.addEventListener('mouseleave', function () { if (!pinned) reveal(false); });
      trig.setAttribute('role', 'button');
      trig.setAttribute('tabindex', '0');
      trig.style.cursor = 'pointer';
      var saved = null;
      try { saved = sessionStorage.getItem(KEY); } catch (e) {}
      setDrawer(saved === '1');
      trig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDrawer(!isOpen()); }
      });
    }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) setDrawer(false); });

  document.addEventListener('click', function (e) {
    var tgt = e.target;
    if (DRAWER && nav && tgt.closest && tgt.closest(DRAWER.trigger)) { e.preventDefault(); setDrawer(!isOpen()); return; }
    // Click outside an open drawer closes it, like any overlay panel.
    if (nav && isOpen() && tgt.closest && !tgt.closest('nav')) setDrawer(false);

    var off = tgt.closest && tgt.closest('[data-proto-offsite]');
    if (off) {
      e.preventDefault();
      note('Not part of this prototype: ' + off.getAttribute('data-proto-offsite'));
      return;
    }
    var b = tgt.closest && tgt.closest('button, [role="button"], a');
    if (b && /^\\s*ok, i understand\\s*$/i.test(b.textContent || '')) {
      e.preventDefault();
      var box = b;
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
}

/** Kept for any caller that wants the runtime without a drawer. */
export const PROTOTYPE_RUNTIME = prototypeRuntime({ id: 'default' });
