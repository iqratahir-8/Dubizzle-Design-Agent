/**
 * Working filters for the agency-portal prototype.
 *
 * A frozen capture keeps a filter's field but not its menu or its effect. This puts
 * both back, in the browser, over the captured page:
 *   - each dropdown opens dubizzle's own option list (read off live by
 *     scripts/extract-portal-filters.mjs into design-kit/content/portal-filters.json)
 *     in the menu style measured there: radius, shadow, width, row height, type
 *   - picking options filters the captured cards/rows, using what each card shows
 *   - segmented tabs move their selected state with the captured CSS classes
 *   - search fields filter as you type
 *
 * Honesty rule: a filter can only filter on what the card actually shows. Category
 * isn't printed on an Agency Ads card, so picking one can't know which cards match. In
 * that case nothing is hidden and the prototype says why, rather than inventing a result.
 *
 * Used by scripts/build-live-templates.mjs; verified by npm run check:prototype.
 */

const FIXTURE_NAMES = ['Ahmed H.', 'Mona S.', 'Karim M.', 'Yasmine A.', 'Omar F.', 'Sara K.', 'Hany T.', 'Nour A.'];

/* Per page: how to find the list items, and which controls are filters.
     items     text a leaf inside every item carries (the list is the set of siblings
               holding it), or a CSS selector for table rows
     search    placeholders of free-text fields
     people    dropdown labels whose options are people (filled from fixtures, never live)
     tabs      segmented control: label prefix → exact badge text an item must carry
               (null = show all; a label absent from the map only moves the selection)
     numbers   range dropdowns: how to read the value off an item */
export const PORTAL_FILTER_SPEC = {
  'portal-ads': {
    items: { text: /Impressions$/ },
    search: ['Search keyword'],
    people: ['Choose Agent'],
    tabs: { 'View all': null, 'Active Ads': 'Active', 'Inactive Ads': 'Inactive', 'Pending Ads': 'Pending',
      'Moderated Ads': 'Moderated', 'Expiring Soon Ads': 'Expiring Soon', 'Expired Ads': 'Expired' },
  },
  'portal-vip': {
    items: { text: /^Purchase$/ },
    tabs: { 'All Leads': null, 'Purchased': '__none__' },
    numbers: { Year: 'year', Price: 'price', 'KM Driven': 'km' },
  },
  'portal-candidates': {
    items: { text: /^Applied on/ },
    search: ['Search here...'],
    tabs: { 'Active': null, 'Rejected': '__none__' },
  },
  'portal-leads': { items: { selector: 'tbody tr' }, search: ['Search here...', 'Ad ID'], people: ['Agent'], exclude: { 'Exclude Anonymous leads': 'Anonymous' } },
  'portal-leads-phone': { items: { selector: 'tbody tr' }, search: ['Search here...', 'Ad ID'], people: ['Agent'], exclude: { 'Exclude Anonymous leads': 'Anonymous' } },
  'portal-leads-sms': { items: { selector: 'tbody tr' }, search: ['Search here...', 'Ad ID'], people: ['Agent'], exclude: { 'Exclude Anonymous leads': 'Anonymous' } },
  'portal-leads-whatsapp': { items: { selector: 'tbody tr' }, search: ['Search here...', 'Ad ID'], people: ['Agent'], exclude: { 'Exclude Anonymous leads': 'Anonymous' } },
  'portal-agents': { items: { selector: 'tbody tr' }, search: ['Search here...'], tabs: { 'Agents': null, 'Location': '__none__' } },
  'portal-insights': { tabs: { 'New Cars': null, 'Used Cars': null } },
};

// the harvest is keyed by the page it was read on; the Leads tab frames share its menus
const HARVEST_PAGE = { 'portal-leads-phone': 'portal-leads', 'portal-leads-sms': 'portal-leads', 'portal-leads-whatsapp': 'portal-leads' };

/** What kind of menu a harvested dropdown is, from what live rendered inside it. */
function kindOf(h) {
  const inputs = h.inputs || [];
  if (inputs.some((i) => /Search for location/.test(i))) return 'location';
  if (inputs.some((i) => i === 'checkbox')) return 'check';
  if ((h.options || []).includes('Minimum')) return 'range';
  if ((h.options || []).some((o) => /^Last (week|month)/.test(o))) return 'preset';
  return 'list';
}

function cleanOptions(kind, options) {
  const drop = new Set(['Use current location', 'Choose location', 'Preset range', 'Custom range', 'Reset', 'Apply', 'Minimum', 'Maximum']);
  return options.filter((o) => !drop.has(o)).map((o) => o.replace(/\s+/g, ' ').trim());
}

/** The filter config one page needs, or null when it has none. */
export function filtersFor(page, harvest) {
  const spec = PORTAL_FILTER_SPEC[page];
  if (!spec) return null;
  const read = (harvest && harvest.pages && harvest.pages[HARVEST_PAGE[page] || page]) || {};
  const dropdowns = {};
  for (const [label, h] of Object.entries(read)) {
    if (h.people || (spec.people || []).includes(label)) {
      // same menu shape as the other checklists on the portal; names are fixtures
      const style = Object.values(read).find((x) => x.style && kindOf(x) === 'check');
      dropdowns[label] = { kind: 'check', options: FIXTURE_NAMES, style: style ? style.style : null, people: true };
      continue;
    }
    if (!h.options) continue;
    const kind = kindOf(h);
    dropdowns[label] = { kind, options: cleanOptions(kind, h.options), style: h.style, number: (spec.numbers || {})[label] || null };
  }
  for (const label of spec.people || []) if (!dropdowns[label]) {
    const style = Object.values(read).find((x) => x.style && kindOf(x) === 'check');
    dropdowns[label] = { kind: 'check', options: FIXTURE_NAMES, style: style ? style.style : null, people: true };
  }
  return { items: spec.items ? { text: spec.items.text ? spec.items.text.source : null, selector: spec.items.selector || null } : null,
    search: spec.search || [], tabs: spec.tabs || null, exclude: spec.exclude || null, dropdowns };
}

/** The browser half. Self-contained; the captures have their own scripts stripped. */
export function filtersRuntime(cfg) {
  if (!cfg) return '';
  return `<script>
(function () {
  var CFG = ${JSON.stringify(cfg)};
  var state = { drop: {}, tab: null, text: {}, exclude: {} };

  function norm(s) { return (s || '').replace(/\\s+/g, ' ').trim(); }
  function leafWithText(t) {
    return [].slice.call(document.querySelectorAll('body *')).filter(function (e) {
      return !e.closest('nav') && !e.closest('#proto-menu') && e.children.length <= 1 && norm(e.textContent) === t && e.getBoundingClientRect().width > 8;
    })[0] || null;
  }
  /* The field: the outermost close ancestor sized like one (as in the harvester). */
  function fieldOf(leaf) {
    var box = leaf;
    for (var n = leaf, i = 0; n && i < 4; n = n.parentElement, i++) {
      var r = n.getBoundingClientRect();
      if (r.height >= 36 && r.height <= 58 && r.width >= 90 && r.width <= 700) box = n;
    }
    return box;
  }

  /* ---------- items ---------- */
  var items = [];
  if (CFG.items && CFG.items.selector) items = [].slice.call(document.querySelectorAll(CFG.items.selector));
  else if (CFG.items && CFG.items.text) {
    var re = new RegExp(CFG.items.text);
    var anchors = [].slice.call(document.querySelectorAll('body *')).filter(function (e) {
      return !e.closest('nav') && e.children.length <= 1 && re.test(norm(e.textContent)); // "387 Impressions" nests the number
    });
    if (anchors.length >= 2) {
      // the list is the lowest common ancestor of the first two anchors; items are its children
      var a = anchors[0], list = null;
      for (var n = a.parentElement; n; n = n.parentElement) if (n.contains(anchors[1])) { list = n; break; }
      if (list) items = [].slice.call(list.children).filter(function (c) { return anchors.some(function (x) { return c.contains(x); }); });
    } else if (anchors.length === 1) {
      var one = anchors[0];
      for (var m = one; m.parentElement && m.parentElement.children.length < 2; m = m.parentElement) {}
      items = [m];
    }
  }
  var itemText = items.map(function (it) { return norm(it.textContent).toLowerCase(); });
  var itemLeaves = items.map(function (it) {
    return [].slice.call(it.querySelectorAll('*')).filter(function (e) { return e.children.length === 0; }).map(function (e) { return norm(e.textContent); });
  });

  function numberOf(i, kind) {
    var t = itemText[i];
    if (kind === 'price') { var p = t.match(/egp\\s*([\\d,]+)/); return p ? +p[1].replace(/,/g, '') : null; }
    if (kind === 'year') { var y = t.match(/\\b(19[5-9]\\d|20[0-4]\\d)\\b/); return y ? +y[1] : null; }
    if (kind === 'km') { var k = t.match(/\\bused\\s+(\\d{2,7})\\b/) || t.match(/\\bnew\\s+(\\d{1,7})\\b/); return k ? +k[1] : null; }
    return null;
  }
  function optMatch(i, o) { return itemText[i].indexOf(o.replace(/\\s*\\(\\d+\\)$/, '').toLowerCase()) !== -1; }
  /* Does this list show the field a dropdown filters on? If no item carries any of its
     options, it doesn't, and the dropdown must not pretend to filter. */
  function visibleField(label) {
    var d = CFG.dropdowns[label];
    if (d.kind === 'range') return items.some(function (_, i) { return numberOf(i, d.number) !== null; });
    if (d.kind === 'preset') return false;
    return items.some(function (_, i) { return d.options.some(function (o) { return optMatch(i, o); }); });
  }

  var empty = null;
  function apply() {
    if (!items.length) return;
    var shown = 0;
    items.forEach(function (it, i) {
      var ok = true;
      Object.keys(state.drop).forEach(function (label) {
        var v = state.drop[label], d = CFG.dropdowns[label];
        if (!v || !visibleField(label)) return;
        if (d.kind === 'range') {
          var x = numberOf(i, d.number);
          if (x === null) return;
          if (v.min !== '' && x < +v.min) ok = false;
          if (v.max !== '' && x > +v.max) ok = false;
        } else if (v.length && !v.some(function (o) { return optMatch(i, o); })) ok = false;
      });
      if (state.tab) {
        if (state.tab === '__none__') ok = false;
        else if (itemLeaves[i].indexOf(state.tab) === -1) ok = false;
      }
      Object.keys(state.text).forEach(function (k) {
        var q = state.text[k].toLowerCase();
        if (q && itemText[i].indexOf(q) === -1) ok = false;
      });
      Object.keys(state.exclude).forEach(function (k) {
        if (state.exclude[k] && itemText[i].indexOf(CFG.exclude[k].toLowerCase()) !== -1) ok = false;
      });
      it.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    /* No match: live's empty state for a filter was never captured, so this is a plain,
       clearly-prototype message in the page's own type, not a guess at the real design. */
    if (!empty) {
      empty = document.createElement('div');
      empty.id = 'proto-empty';
      empty.setAttribute('role', 'status');
      empty.style.cssText = 'padding:48px 16px;text-align:center;font:400 16px/24px ProximaNova,system-ui,sans-serif;color:#464c55';
      var host = items[0].parentElement;
      host.insertBefore(empty, items[items.length - 1].nextSibling);
    }
    empty.style.display = shown ? 'none' : '';
    empty.textContent = 'No results match these filters.';
  }

  /* ---------- note ---------- */
  function note(text) {
    var n = document.getElementById('proto-note');
    if (!n) {
      n = document.createElement('div');
      n.id = 'proto-note';
      n.setAttribute('role', 'status');
      n.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#23262a;color:#fff;font:14px/1.4 ProximaNova,system-ui,sans-serif;padding:10px 16px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.22);opacity:0;transition:opacity .15s cubic-bezier(.4,0,.2,1);max-width:90vw;pointer-events:none';
      document.body.appendChild(n);
    }
    n.textContent = text; n.style.opacity = '1';
    clearTimeout(n._t); n._t = setTimeout(function () { n.style.opacity = '0'; }, 2600);
  }

  /* ---------- dropdown menus ---------- */
  var menu = null, menuFor = null;
  function closeMenu() { if (menu) { menu.remove(); menu = null; menuFor = null; } }
  /* Only the label's own text node changes: the field's element also holds the chevron
     (and the pin on location fields), and replacing its textContent deleted them. */
  function setLabel(f, text, active) {
    if (!f.text) return;
    f.text.nodeValue = text;
    var el = f.text.parentElement;
    el.style.color = active ? '#23262a' : '';
    el.style.fontWeight = active ? '600' : '';
  }
  function summary(label, v) {
    var d = CFG.dropdowns[label];
    if (d.kind === 'range') {
      if (v.min === '' && v.max === '') return null;
      return label + ': ' + (v.min || 'Any') + ' – ' + (v.max || 'Any');
    }
    if (!v || !v.length) return null;
    return v.length === 1 ? v[0].replace(/\\s*\\(\\d+\\)$/, '') : v[0].replace(/\\s*\\(\\d+\\)$/, '') + ' +' + (v.length - 1);
  }
  function commit(f, v) {
    state.drop[f.label] = v;
    var s = summary(f.label, v);
    setLabel(f, s || f.label, !!s);
    apply();
    if (s && !visibleField(f.label) && items.length) note('Prototype: "' + f.label + '" isn\\'t shown on these ' + (items.length > 1 ? 'items' : 'item') + ', so the list can\\'t be re-filtered by it.');
  }
  function btn(text, primary) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = text;
    b.style.cssText = 'flex:1;height:40px;border-radius:4px;font:700 14px/1 ProximaNova,system-ui,sans-serif;cursor:pointer;' +
      (primary ? 'background:#e00000;color:#fff;border:1px solid #e00000' : 'background:#fff;color:#23262a;border:1px solid #23262a');
    return b;
  }
  function openMenu(f) {
    closeMenu();
    var d = CFG.dropdowns[f.label], st = d.style || {}, P = st.panel || {}, R = st.row || {};
    var r = f.box.getBoundingClientRect();
    menu = document.createElement('div');
    menu.id = 'proto-menu';
    menu.setAttribute('role', 'listbox');
    menuFor = f;
    var w = P.width || Math.max(240, r.width);
    var left = Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - w - 16);
    menu.style.cssText = 'position:absolute;z-index:2147483600;box-sizing:border-box;overflow:auto;' +
      'top:' + (r.bottom + window.scrollY + (P.offsetY || 8)) + 'px;left:' + left + 'px;width:' + w + 'px;' +
      'background:' + (P.backgroundColor || '#fff') + ';border-radius:' + (P.borderRadius || '6px') + ';' +
      'box-shadow:' + (P.boxShadow || '0 4px 10px rgba(0,0,0,.16)') + ';' +
      'padding:' + (P.paddingTop || '16px') + ' ' + (P.paddingLeft || '0px') + ';' +
      'max-height:' + (P.maxHeight && P.maxHeight !== 'none' ? P.maxHeight : '400px') + ';' +
      'font-family:ProximaNova,system-ui,sans-serif;color:#23262a';
    var rowCss = 'display:flex;align-items:center;gap:12px;box-sizing:border-box;cursor:pointer;min-height:' + (R.height || 44) + 'px;' +
      'padding:' + (R.paddingTop || '10px') + ' ' + (R.paddingLeft && R.paddingLeft !== '0px' ? R.paddingLeft : '16px') + ';' +
      'font-size:' + (R.fontSize || '14px') + ';line-height:' + (R.lineHeight || '24px') + ';font-weight:' + (d.kind === 'list' && R.fontWeight ? 400 : (R.fontWeight || 400)) + ';color:' + (R.color || '#23262a');
    var cur = state.drop[f.label];

    if (d.kind === 'range') {
      var v = cur || { min: '', max: '' };
      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:8px;margin-bottom:16px';
      function field(ph, val) {
        var box = document.createElement('label');
        box.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:4px;font-size:14px;color:#464c55';
        box.textContent = ph;
        var i = document.createElement('input');
        i.type = 'number'; i.placeholder = 'Any'; i.value = val;
        i.style.cssText = 'height:40px;box-sizing:border-box;border:1px solid #d8d8d8;border-radius:4px;padding:0 10px;font:400 14px ProximaNova,system-ui,sans-serif;width:100%';
        box.appendChild(i); wrap.appendChild(box); return i;
      }
      var mn = field('Minimum', v.min), mx = field('Maximum', v.max);
      var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px';
      var reset = btn('Reset'), ok = btn('Apply', true);
      reset.onclick = function () { commit(f, { min: '', max: '' }); closeMenu(); };
      ok.onclick = function () { commit(f, { min: mn.value, max: mx.value }); closeMenu(); };
      row.appendChild(reset); row.appendChild(ok);
      menu.appendChild(wrap); menu.appendChild(row);
      document.body.appendChild(menu); mn.focus();
      return;
    }

    var picked = (cur || []).slice();
    var listEl = document.createElement('div');
    if (d.kind === 'location') {
      var s = document.createElement('input');
      s.type = 'search'; s.placeholder = 'Search for location';
      s.style.cssText = 'display:block;box-sizing:border-box;width:calc(100% - 32px);margin:0 16px 8px;height:40px;border:1px solid #d8d8d8;border-radius:4px;padding:0 12px;font:400 14px ProximaNova,system-ui,sans-serif';
      s.oninput = function () {
        var q = s.value.toLowerCase();
        [].forEach.call(listEl.children, function (c) { c.style.display = c.textContent.toLowerCase().indexOf(q) === -1 ? 'none' : ''; });
      };
      menu.appendChild(s);
    }
    d.options.forEach(function (o) {
      var row = document.createElement('div');
      row.setAttribute('role', 'option');
      row.style.cssText = rowCss;
      var on = picked.indexOf(o) !== -1;
      row.setAttribute('aria-selected', String(on));
      if (d.kind === 'check') {
        var c = document.createElement('input');
        c.type = 'checkbox'; c.checked = on; c.tabIndex = -1;
        c.style.cssText = 'width:18px;height:18px;margin:0;accent-color:#23262a;flex:none;pointer-events:none';
        row.appendChild(c);
      }
      var t = document.createElement('span'); t.textContent = o;
      if (on && d.kind !== 'check') t.style.fontWeight = '700';
      row.appendChild(t);
      row.onmouseenter = function () { row.style.background = '#f2f4f5'; };
      row.onmouseleave = function () { row.style.background = ''; };
      row.onclick = function (e) {
        e.stopPropagation();
        var reset = /^See ads in/.test(o) || o === 'All';
        if (d.kind === 'check') {
          var k = picked.indexOf(o);
          if (k === -1) picked.push(o); else picked.splice(k, 1);
          row.firstChild.checked = k === -1;
          commit(f, picked.slice());
          return; // checklists stay open for more picks, like live
        }
        commit(f, reset ? [] : [o]);
        closeMenu();
      };
      listEl.appendChild(row);
    });
    menu.appendChild(listEl);
    document.body.appendChild(menu);
  }

  var fields = [];
  Object.keys(CFG.dropdowns).forEach(function (label) {
    var leaf = leafWithText(label);
    if (!leaf) return;
    var w = document.createTreeWalker(leaf, NodeFilter.SHOW_TEXT), tn, text = null;
    while ((tn = w.nextNode())) if (norm(tn.nodeValue) === label) { text = tn; break; }
    var f = { label: label, leaf: leaf, text: text, box: fieldOf(leaf) };
    f.box.style.cursor = 'pointer';
    f.box.setAttribute('data-proto-filter', label);
    f.box.setAttribute('role', 'button');
    f.box.setAttribute('aria-haspopup', 'listbox');
    fields.push(f);
  });

  /* ---------- segmented tabs ---------- */
  var tabs = [];
  if (CFG.tabs) {
    Object.keys(CFG.tabs).forEach(function (prefix) {
      var el = [].slice.call(document.querySelectorAll('body *')).filter(function (e) {
        var t = norm(e.textContent);
        // exact: "View all (162)" — a prefix test matched the whole tab row, whose text starts the same way
        return !e.closest('nav') && e.children.length <= 1 && (t === prefix || /^ \\(\\d+\\)$/.test(t.slice(prefix.length)) && t.indexOf(prefix) === 0);
      })[0];
      if (!el) return;
      // the tab is the leaf's ancestor that is one of several same-sized siblings
      var tab = el;
      for (var n = el; n.parentElement; n = n.parentElement) {
        var sib = [].slice.call(n.parentElement.children);
        if (sib.length >= 2 && sib.filter(function (s) { return Math.abs(s.getBoundingClientRect().height - n.getBoundingClientRect().height) < 3; }).length >= 2) { tab = n; break; }
      }
      tabs.push({ prefix: prefix, el: tab, cls: tab.className });
    });
    /* Selected vs resting look: the one tab whose classes differ from its siblings'
       carries live's selected class(es). Swap those, and the captured CSS does the rest. */
    if (tabs.length >= 2) {
      var counts = {};
      tabs.forEach(function (t) { t.el.classList.forEach(function (c) { counts[c] = (counts[c] || 0) + 1; }); });
      var sel = tabs.filter(function (t) { return [].some.call(t.el.classList, function (c) { return counts[c] === 1; }); })[0];
      var extra = sel ? [].filter.call(sel.el.classList, function (c) { return counts[c] === 1; }) : [];
      /* the label inside can carry its own selected class too (Candidates, VIP) */
      var innerSel = sel && sel.el.querySelector('span');
      var innerExtra = [];
      if (innerSel) {
        var other = tabs.filter(function (t) { return t !== sel; })[0].el.querySelector('span');
        if (other) innerExtra = [].filter.call(innerSel.classList, function (c) { return !other.classList.contains(c); });
      }
      tabs.forEach(function (t) {
        t.el.style.cursor = 'pointer';
        t.el.setAttribute('role', 'tab');
        t.el.setAttribute('aria-selected', String(t === sel));
        t.el.setAttribute('data-proto-tab', t.prefix);
        t.el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          tabs.forEach(function (u) {
            var on = u === t;
            extra.forEach(function (c) { u.el.classList.toggle(c, on); });
            var sp = u.el.querySelector('span');
            if (sp) innerExtra.forEach(function (c) { sp.classList.toggle(c, on); });
            u.el.setAttribute('aria-selected', String(on));
          });
          state.tab = CFG.tabs[t.prefix];
          apply();
          if (state.tab === '__none__' && items.length === 0) note('Prototype: the "' + t.prefix + '" view was not captured.');
        }, true);
      });
    }
  }

  /* ---------- search + exclude ---------- */
  (CFG.search || []).forEach(function (ph) {
    var i = document.querySelector('input[placeholder="' + ph.replace(/"/g, '\\\\"') + '"]');
    if (!i) return;
    i.removeAttribute('readonly'); i.removeAttribute('disabled');
    i.addEventListener('input', function () { state.text[ph] = i.value.trim(); apply(); });
  });
  Object.keys(CFG.exclude || {}).forEach(function (label) {
    var l = leafWithText(label);
    var box = l && l.closest('label, div');
    var cb = box && (box.querySelector('input[type=checkbox]') || (box.parentElement && box.parentElement.querySelector('input[type=checkbox]')));
    if (!box) return;
    box.style.cursor = 'pointer';
    box.addEventListener('click', function (e) {
      e.preventDefault();
      state.exclude[label] = !state.exclude[label];
      if (cb) cb.checked = state.exclude[label];
      apply();
    }, true);
  });

  /* ---------- wiring ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (menu && menu.contains(t)) return;
    var f = null;
    for (var i = 0; i < fields.length; i++) if (fields[i].box.contains(t)) { f = fields[i]; break; }
    if (f) {
      e.preventDefault(); e.stopPropagation();
      if (menuFor === f) closeMenu(); else openMenu(f);
      return;
    }
    if (menu) closeMenu();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', closeMenu);
  window.__protoFilters = { shown: function () { return items.filter(function (it) { return it.style.display !== 'none'; }).length; }, items: items.length, fields: fields.map(function (f) { return f.label; }), tabs: tabs.map(function (t) { return t.prefix; }) };
})();
</script>`;
}
