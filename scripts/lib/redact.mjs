/**
 * Personal-data redaction for logged-in captures. Two layers, because each alone leaks:
 *
 * 1. In the live page, before the screenshot: visible names, phones, emails, message
 *    text and form values are swapped for sample content, so the PNG shows none of it.
 * 2. On the serialized HTML, before it touches disk: every <script> is removed. Logged-in
 *    pages embed the full user object (name, phone, email, IDs, session state) as inline
 *    JSON that never renders, so layer 1 can't see it. Then the same patterns are swept
 *    across the remaining markup (attributes, alt text, hrefs with user IDs).
 *
 * The account holder's real name is read from the page at runtime and only ever held in
 * memory — it must never be written into this file, a log line, or a capture.
 */

export const SAMPLE = {
  fullName: 'Ahmed Hassan',
  shortName: 'Ahmed H.',
  firstName: 'Ahmed',
  lastName: 'Hassan',
  initial: 'A',
  phone: '010 1234 5678',
  email: 'ahmed.hassan@example.com',
  chatNames: ['Mona S.', 'Karim M.', 'Nile Realty', 'Yasmine A.', 'Omar F.', 'محمود ع.', 'Sara K.', 'Hany T.'],
  chatTitles: [
    'Mercedes-Benz E200 2021',
    'Apartment for sale in Zamalek 200m',
    'iPhone 15 Pro Max 256GB',
    'Hyundai Elantra 2019',
    'Villa for sale Mivida compound',
  ],
  chatPreviews: [
    'Is the price negotiable?',
    'I can come see it tomorrow morning',
    'Is it still available?',
    'التمن قابل للتفاوض؟',
    'Can you send more photos?',
    'What is the lowest price?',
  ],
  messages: ['Hi, is this still available?', 'Yes, still available.', 'Is the price negotiable?', 'Slightly, for a serious buyer.'],
};

/* Egyptian mobile in every form the site renders it. The previous pattern used \b
   after the country code, which never matches in "+201154785698" — the 0 and the 1
   are both word characters, so there is no boundary between them. That hole let a
   real agent's number through into a saved capture and past contactLeaks(). Digit
   lookarounds instead of \b, and the separators are optional between every digit. */
const PHONE = /(?<!\d)(?:(?:\+|00)?20[ \t-]?)?0?1[0125](?:[ \t-]?\d){8}(?!\d)/g;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

/**
 * Reads the signed-in user's name. Never logged.
 *
 * The full name comes from the Edit Profile "Name" field: it's the authoritative value,
 * needs no clicking, and — unlike the header's "First L." — always contains the surname.
 * Missing the surname isn't cosmetic: mobile pages carry the full name in a hidden account
 * drawer, so a redactor that only knows "First L." lets the surname through.
 */
export async function readAccountIdentity(page, origin) {
  /* domcontentloaded, not networkidle2: a signed-in session holds long-poll
     connections open, so the network never goes idle and this probe times out at 90s
     — taking the whole capture run with it, because every screen depends on knowing
     the name to redact. Settle on DOM, then wait for quiet only as far as it comes. */
  await page.goto(`${origin}/en/editProfile/info`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForNetworkIdle({ idleTime: 900, timeout: 20_000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  const { fullName, shortName } = await page.evaluate(() => {
    const leaves = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0);
    const short = leaves.map((e) => e.textContent.trim()).find((t) => /^[\p{L}][\p{L}'-]+ [\p{L}]\.$/u.test(t)) ?? null;
    const label = leaves.find((e) => /^name$/i.test(e.textContent.trim()));
    let input = null;
    for (let el = label; el && !input; el = el.parentElement) input = el.querySelector('input[type="text"], input:not([type])');
    return { fullName: input?.value.trim() || null, shortName: short };
  });
  if (!fullName || !/\s[\p{L}'-]{3,}/u.test(fullName)) return null;
  const firstName = fullName.split(/\s+/)[0];
  return {
    fullName,
    shortName: shortName ?? `${firstName} ${fullName.split(/\s+/).pop()[0]}.`,
    firstName,
    lastName: fullName.slice(firstName.length).trim(),
  };
}

/** Ordered most-specific first so a full name is replaced whole, never left as "Ahmed <real surname>". */
function namePairs(identity) {
  if (!identity) return [];
  const pairs = [
    [identity.fullName, SAMPLE.fullName],
    [identity.shortName, SAMPLE.shortName],
    [identity.lastName, SAMPLE.lastName],
    [identity.firstName, SAMPLE.firstName],
  ];
  // A surname of "S." (or any fragment under 3 letters) would rewrite every "S." on the
  // page — that's how a chat contact became "Mona Hassan".
  return pairs.filter(([real], i) => real && real.replace(/\W/g, '').length >= 3 && !(i === 0 && real === identity.shortName));
}

/** Layer 1 — runs inside the page. */
export async function redactPage(page, identity) {
  return page.evaluate(
    ({ pairs, sample, initial, phoneSrc, emailSrc, uuidSrc }) => {
      const phone = new RegExp(phoneSrc, 'g');
      const email = new RegExp(emailSrc, 'g');
      const uuid = new RegExp(uuidSrc, 'gi');
      const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRes = pairs.map(([real, fake]) => [new RegExp(escape(real), 'g'), fake]);
      const counts = { text: 0, inputs: 0, chatRows: 0, bubbles: 0, avatars: 0 };

      const scrub = (s) => {
        let out = s;
        for (const [re, fake] of nameRes) out = out.replace(re, fake);
        return out.replace(phone, sample.phone).replace(email, sample.email).replace(uuid, '00000000-0000-0000-0000-000000000000');
      };

      // Chat inbox rows: everything but the timestamp is someone's name, an ad, or a message.
      const isTime = (t) => /^\d{1,2}[:/.]\d{1,2}|^\d{1,2}\s?(am|pm)$|ago$|^(yesterday|today|now)$|^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/i.test(t);
      document.querySelectorAll('a[href*="/chat/"]').forEach((row, i) => {
        const leaves = [...row.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
        let k = 0;
        for (const leaf of leaves) {
          const t = leaf.textContent.trim();
          if (isTime(t)) continue;
          if (t.length <= 2) {
            leaf.textContent = /^\d+$/.test(t) ? t : sample.chatNames[i % sample.chatNames.length][0];
            continue;
          }
          const pool = [sample.chatNames, sample.chatTitles, sample.chatPreviews][Math.min(k, 2)];
          leaf.textContent = pool[(i + k) % pool.length];
          k++;
        }
        counts.chatRows++;
      });

      /* Open chat thread. Bubbles carry hashed class names, and a bubble is usually text PLUS
         a timestamp — so neither a class match nor a leaf-element match finds them. Walk TEXT
         NODES inside the thread column instead: on desktop that is everything right of the
         inbox and below the panel's top edge, on mobile the whole page. Chrome words and
         timestamps are kept, so the capture still measures the product's own copy. */
      if (/\/chat\/.+/.test(location.pathname)) {
        const CHROME = /^(type a message|view ad|today|yesterday|questions|next steps|send|call|chat|block|report|delete|inbox|all|unread chats|important|quick filters|location|number viewed|seen|delivered|sent|online|offline|egp [\d,. ]+)$/i;
        /* Three or more of these is an inbox LIST beside the thread; one is the ad header on a
           phone, which is also a chat link — treating that as the list hid the whole screen
           from redaction and a real conversation was written to disk. */
        const rowLike = [...document.querySelectorAll('a[href*="chat"]')].filter((e) => {
          const b = e.getBoundingClientRect();
          return b.height > 60 && b.height < 140 && b.width > 250;
        });
        const rows = rowLike.length >= 3 ? rowLike : [];
        const threadStart = rows.length ? Math.max(...rows.map((r) => r.getBoundingClientRect().right)) : 0;
        /* The chat panel itself, so the site header and category strip keep their own words. A
           phone has no inbox beside the thread, so there the panel is the page. */
        let panel = document.body;
        if (rows.length) {
          panel = rows[0];
          while (panel.parentElement && panel.getBoundingClientRect().width < 1000) panel = panel.parentElement;
        }
        /* No vertical test: a thread is scrolled to its newest message, so everything said
           earlier sits above the viewport with a negative top and would be skipped. */
        const inThread = (node) => {
          const el = node.parentElement;
          if (!el || el.closest('a[href*="chat"]') || el.closest('script, style') || !panel.contains(el)) return false;
          const r = el.getBoundingClientRect();
          return threadStart === 0 || r.width === 0 || r.left >= threadStart - 1;
        };
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const nodes = [];
        for (let n = walk.nextNode(); n; n = walk.nextNode()) {
          const t = n.nodeValue.trim();
          if (t.length < 2 || isTime(t) || CHROME.test(t)) continue;
          if (inThread(n)) nodes.push(n);
        }
        nodes.forEach((n, i) => {
          n.nodeValue = sample.messages[i % sample.messages.length];
          counts.bubbles++;
        });
        /* The first line of the thread column names the other person — a name, not a message. */
        if (nodes[0]) nodes[0].nodeValue = sample.chatNames[0];
      }

      // Every remaining visible text node.
      if (!document.body) return 0;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const next = scrub(node.nodeValue);
        if (next !== node.nodeValue) {
          node.nodeValue = next;
          counts.text++;
        }
      }

      // Single-letter avatar initials of the account holder.
      if (initial) {
        document.querySelectorAll('body *').forEach((e) => {
          // Chat rows already carry sample contacts' initials; don't overwrite those.
          if (e.children.length || e.textContent.trim() !== initial || e.closest('a[href*="/chat/"]')) return;
          const r = e.getBoundingClientRect();
          const box = e.parentElement?.getBoundingClientRect();
          if (r.width < 60 && box && Math.abs(box.width - box.height) < 4) {
            e.textContent = sample.initial;
            counts.avatars++;
          }
        });
      }

      // Date of birth: the profile form renders day/month/year as custom dropdowns, so the
      // values are text, not <input>s. Swap the whole date on the edit-profile page.
      if (/editProfile/i.test(location.pathname)) {
        const label = [...document.querySelectorAll('body *')].find((e) => e.children.length === 0 && /^date of birth$/i.test(e.textContent.trim()));
        const row = label?.parentElement?.parentElement;
        if (row) {
          const parts = [...row.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^\d{1,4}$/.test(e.textContent.trim()));
          const fake = ['15', '6', '1990'];
          parts.slice(0, 3).forEach((e, i) => {
            e.textContent = fake[i];
            counts.inputs++;
          });
        }
      }

      // Uploaded profile photos.
      const blank =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#fbe0e0"/><text x="20" y="26" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="#e00000">A</text></svg>');
      document.querySelectorAll('img').forEach((img) => {
        const hint = `${img.src} ${img.alt} ${img.className}`;
        if (/profile|avatar|user[-_]?(photo|image|pic)/i.test(hint) && !/icon/i.test(img.src)) {
          img.src = blank;
          img.srcset = '';
          counts.avatars++;
        }
        img.alt = scrub(img.alt);
      });

      // Form values (edit profile, settings).
      document.querySelectorAll('input, textarea').forEach((el) => {
        if (['checkbox', 'radio', 'hidden', 'submit', 'button', 'search', 'file'].includes(el.type)) return;
        const hint = `${el.name} ${el.id} ${el.type} ${el.placeholder} ${el.getAttribute('aria-label') ?? ''}`.toLowerCase();
        let value = scrub(el.value);
        if (el.value) {
          if (/password/.test(hint)) value = '';
          else if (/mail/.test(hint)) value = sample.email;
          else if (/phone|mobile|tel/.test(hint)) value = sample.phone;
          else if (/name/.test(hint)) value = sample.fullName;
          else if (el.tagName === 'TEXTAREA' || /about|bio|desc/.test(hint)) value = 'Selling cars and electronics in Cairo.';
        }
        if (value !== el.value) {
          // React-controlled fields: assigning .value is undone on the next render (a real phone
          // number reappeared in a screenshot that way). Use the native setter + input event,
          // like typing, so the app's own state holds the sample value. Nothing is saved.
          const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set;
          setter.call(el, value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.setAttribute('value', value);
          counts.inputs++;
        }
      });

      return counts;
    },
    {
      pairs: namePairs(identity),
      sample: SAMPLE,
      initial: identity?.firstName?.[0] ?? null,
      phoneSrc: PHONE.source,
      emailSrc: EMAIL.source,
      uuidSrc: UUID.source,
    },
  );
}

/** Layer 2 — runs on the serialized HTML before it is written. */
/** Apply a text transform everywhere except inside data: URIs (inlined fonts), which it would corrupt. */
const outsideDataUris = (html, fn) => html.split(/(data:[a-z0-9.+/-]+;base64,[A-Za-z0-9+/=]+)/i).map((part, i) => (i % 2 ? part : fn(part))).join('');

/* Apply a transform to rendered TEXT only — the bits between tags — skipping every
   attribute value and the whole of any <svg>. Two reasons, both found the hard way:
   an SVG path ("M12 2a10 10 0 1 0 10 10A…") and an App Store id in a URL both match a
   phone pattern, so scanning raw HTML reported a leak on all 139 captures including
   404 and the mega menus; and rewriting those digits would have quietly corrupted
   every icon it touched. */
const textOnly = (html, fn) =>
  html
    .split(/(<svg[\s\S]*?<\/svg>)/gi)
    .map((chunk, ci) => {
      if (ci % 2) return chunk; // an <svg> block — leave entirely alone
      return chunk
        .split(/(<[^>]*>)/g)
        .map((part, i) => (i % 2 ? part : fn(part)))
        .join('');
    })
    .join('');

export function sanitizeHtml(html, identity) {
  return outsideDataUris(html, (chunk) => sanitizeChunk(chunk, identity));
}

function sanitizeChunk(html, identity) {
  let out = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '');
  for (const [real, fake] of namePairs(identity)) out = out.split(real).join(fake);
  return out.replace(PHONE, SAMPLE.phone).replace(EMAIL, SAMPLE.email).replace(UUID, '00000000-0000-0000-0000-000000000000');
}

/** Final gate: refuse to write a capture if any identifier survived both layers. */
export function leaks(html, identity) {
  html = html.replace(/data:[a-z0-9.+/-]+;base64,[A-Za-z0-9+/=]+/gi, '');
  const found = [];
  for (const [real] of namePairs(identity)) {
    if (real.length >= 3 && html.includes(real)) found.push('account name');
  }
  if (/<script\b/i.test(html)) found.push('script tag');
  return [...new Set(found)];
}

/**
 * Final gate for SCREENSHOTS — the rendered page, not the HTML. Checks visible text and every
 * field value for the account name or a phone number other than the sample. Call right before
 * page.screenshot(); refuse the capture if it returns anything.
 */
export async function visibleLeaks(page, identity) {
  return page.evaluate(
    ({ names, phoneSrc, samplePhone }) => {
      const found = new Set();
      const values = [...document.querySelectorAll('input, textarea')].map((e) => e.value);
      const text = `${document.body.innerText}\n${values.join('\n')}`;
      for (const name of names) if (text.includes(name)) found.add('account name');
      const digits = (s) => s.replace(/\D/g, '').replace(/^20/, '').replace(/^0/, '');
      for (const m of text.match(new RegExp(phoneSrc, 'g')) ?? []) if (digits(m) !== digits(samplePhone)) found.add('phone number');
      return [...found];
    },
    { names: namePairs(identity).map(([real]) => real).filter((n) => n.length >= 3), phoneSrc: PHONE.source, samplePhone: SAMPLE.phone },
  );
}

/* ── Third-party contact details ──────────────────────────────────────────────
   The account-holder redaction above protects the person running the capture.
   These two protect *other* people: a seller's phone number revealed by the
   DPV's "Show phone number" modal, or an email shown in a contact form. Those
   pages are public, but a saved capture is a durable copy of someone's personal
   contact details sitting in a repo, so it gets replaced with the sample before
   anything is written or screenshotted. Used by scripts/capture-states.mjs for
   any state marked `scrubContacts`. */

/** Layer 1 — in the live page, before the screenshot. */
export async function scrubContactsPage(page) {
  return page.evaluate(
    ({ phoneSrc, emailSrc, sample }) => {
      const phone = new RegExp(phoneSrc, 'g');
      const email = new RegExp(emailSrc, 'g');
      const swap = (s) => s.replace(phone, sample.phone).replace(email, sample.email);
      let n = 0;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const hits = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeValue && (phone.test(node.nodeValue) || email.test(node.nodeValue))) hits.push(node);
        phone.lastIndex = 0;
        email.lastIndex = 0;
      }
      for (const node of hits) {
        node.nodeValue = swap(node.nodeValue);
        n++;
      }
      // tel:/mailto: links and any field holding one
      for (const a of document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]')) {
        a.setAttribute('href', a.getAttribute('href').startsWith('tel:') ? `tel:${sample.phone.replace(/\s/g, '')}` : `mailto:${sample.email}`);
        n++;
      }
      for (const f of document.querySelectorAll('input, textarea')) {
        if (f.value && (phone.test(f.value) || email.test(f.value))) {
          f.value = swap(f.value);
          n++;
        }
        phone.lastIndex = 0;
        email.lastIndex = 0;
      }
      return n;
    },
    { phoneSrc: PHONE.source, emailSrc: EMAIL.source, sample: SAMPLE },
  );
}

/** Layer 2 — on the serialized HTML, before it is written. */
export function scrubContactsHtml(html) {
  return outsideDataUris(html, (chunk) => textOnly(chunk, (t) => t.replace(PHONE, SAMPLE.phone).replace(EMAIL, SAMPLE.email)));
}

/** Gate — refuse to save if a non-sample phone or any email survived both layers. */
export function contactLeaks(html) {
  // Same restriction as scrubContactsHtml: judge rendered text, not markup.
  let stripped = html.replace(/data:[a-z0-9.+/-]+;base64,[A-Za-z0-9+/=]+/gi, '');
  stripped = textOnly(stripped, (t) => t)
    .split(/(<svg[\s\S]*?<\/svg>)/gi)
    .filter((_, i) => i % 2 === 0)
    .join('')
    .replace(/<[^>]*>/g, ' ');
  const digits = (s) => s.replace(/\D/g, '');
  const found = new Set();
  for (const m of stripped.match(PHONE) ?? []) if (digits(m) !== digits(SAMPLE.phone)) found.add('phone number');
  for (const m of stripped.match(EMAIL) ?? []) if (m !== SAMPLE.email) found.add(`email (${m.slice(0, 24)})`);
  return [...found];
}

/* ── Fixture replacement for third-party data tables ──────────────────────────
   The agency portal's Leads, VIP Leads, Candidates and Agency Management screens
   list *other people* — buyers who contacted the agency, job applicants, staff.
   Phone and email are patterns and can be scrubbed; a person's NAME is not, so
   detect-and-replace is the wrong shape here: whatever the detector misses gets
   written to disk.

   So this overwrites every data cell wholesale rather than trying to spot the
   sensitive ones. The design system needs the table's structure — columns, row
   rhythm, status pills, typography — not real buyers. Headers are preserved
   because they are UI copy, not data. */

const FIXTURE_NAMES = ['Ahmed H.', 'Mona S.', 'Karim M.', 'Yasmine A.', 'Omar F.', 'Sara K.', 'Hany T.', 'Nour A.'];
const FIXTURE_ADS = SAMPLE.chatTitles;

/**
 * Replaces the content of every data row in the page's tables/row-lists with
 * fixtures, choosing a value per column from that column's header text.
 * Returns {tables, rows, cells} so a capture can log what it rewrote.
 */
export async function fixturizeTables(page) {
  return page.evaluate(
    ({ names, ads, sample, phoneSrc, emailSrc }) => {
      const PHONE_RE = new RegExp(phoneSrc);
      const EMAIL_RE = new RegExp(emailSrc);
      const pick = (arr, i) => arr[i % arr.length];
      let tables = 0;
      let rows = 0;
      let cells = 0;

      const valueFor = (header, rowIndex, cellIndex, original) => {
        const h = (header || '').toLowerCase();
        // Keep structural / non-personal columns recognisable but synthetic.
        if (/phone|mobile|tel|whats/.test(h)) return sample.phone;
        if (/e-?mail/.test(h)) return sample.email;
        if (/name|customer|lead|applicant|candidate|agent|client|user|buyer|seller|contact/.test(h)) {
          return pick(names, rowIndex + cellIndex);
        }
        if (/ad|listing|title|property|vehicle|car/.test(h)) return pick(ads, rowIndex);
        // Numbers, dates, prices and statuses are not personal — keep the original
        // so the column keeps its real shape and width.
        if (/^[\s\d.,:/%-]*$/.test(original) || /^(EGP|جنيه)/i.test(original)) return original;
        if (original.length <= 24) return original;
        return pick(ads, rowIndex + cellIndex);
      };

      for (const table of document.querySelectorAll('table')) {
        const headers = [...table.querySelectorAll('th')].map((h) => h.textContent.trim());
        const bodyRows = [...table.querySelectorAll('tbody tr')];
        if (!bodyRows.length) continue;
        tables++;
        bodyRows.forEach((tr, ri) => {
          /* An empty state lives in the tbody too: one cell spanning every column,
             holding an illustration and a message. Rewriting it replaced "Showing 0
             Leads" artwork copy with a fixture name. A real data row has roughly as
             many cells as the table has headers — anything narrower is layout. */
          const cellCount = tr.children.length;
          if (headers.length > 1 && cellCount < headers.length) return;
          if (tr.querySelector('svg, img') && cellCount <= 1) return;
          rows++;
          [...tr.children].forEach((td, ci) => {
            const original = td.textContent.trim();
            if (!original) return;
            /* A cell is not one value. The Agents table stacks name + phone + WhatsApp
               handle in a single Name cell, and replacing only the deepest node left the
               real name and a real phone number untouched. Rewrite EVERY leaf in the
               cell, choosing per leaf by what that leaf actually contains. */
            const leaves = [...td.querySelectorAll('*')].filter((n) => n.children.length === 0 && n.textContent.trim());
            const targets = leaves.length ? leaves : [td];
            targets.forEach((leaf, li) => {
              const own = leaf.textContent.trim();
              if (!own) return;
              let next;
              if (PHONE_RE.test(own)) next = sample.phone;
              else if (EMAIL_RE.test(own)) next = sample.email;
              else next = valueFor(headers[ci], ri, ci + li, own);
              PHONE_RE.lastIndex = 0;
              EMAIL_RE.lastIndex = 0;
              if (next === own) return;
              leaf.textContent = next;
              cells++;
            });
          });
        });
      }
      return { tables, rows, cells };
    },
    { names: FIXTURE_NAMES, ads: FIXTURE_ADS, sample: SAMPLE, phoneSrc: PHONE.source, emailSrc: EMAIL.source },
  );
}


/* ── People in CARD layouts ───────────────────────────────────────────────────
   fixturizeTables only walks <table>. The portal's Candidates screen lists
   applicants as cards — avatar, name, city, current employer — with no table at
   all, so a real applicant's full name passed every gate: the table pass found
   nothing, and no phone/email pattern matches a name. It was built into a template
   and shown in Storybook before being caught by eye (D-017).

   Two rules, both wholesale rather than detective, per D-011:
     1. A PERSON CARD is a repeated list item containing an avatar-like image. Every
        text leaf in it is overwritten except UI labels, status words, dates, numbers
        and generic enums. Over-replacing is safe; under-replacing leaks.
     2. A LABELLED PERSON FIELD ("Assigned to:", "Posted by:", "Agent:") has its
        value replaced wherever it appears, avatar or not. */
const FIXTURE_JOBS = ['Site engineer, 6 years', 'Accountant at a trading company', 'Sales coordinator', 'Graphic designer', 'Project engineer'];
const FIXTURE_PLACES = ['Nasr City, Cairo', 'Maadi, Cairo', 'Sheikh Zayed, Giza', 'Smouha, Alexandria', 'Mansoura, Dakahlia'];

export async function fixturizeCards(page) {
  return page.evaluate(
    ({ names, ads, jobs, places }) => {
      const pick = (arr, i) => arr[i % arr.length];
      const leavesOf = (root) =>
        [...root.querySelectorAll('*')].filter((n) => n.children.length === 0 && n.textContent.trim());
      /* KEEP only what is generic on its own. "Current Job:" is NOT here: a label
         at the front of a leaf used to protect the whole leaf, and the value after it
         was an applicant's real employer and university. Labelled values are split
         and judged by the label below. */
      const KEEP = (t) =>
        /:\s*$/.test(t) ||
        /^(new|active|rejected|disabled|hybrid|on site|remote|pending|accepted|shortlisted|view|more|less)$/i.test(t) ||
        /^\d[\d\s,./:-]*$/.test(t) ||
        /^applied on\b/i.test(t) ||
        /^experience\s*:?\s*\d/i.test(t) ||
        /^\s*(\d+\s*-\s*\d+|\d+\+?)\s*years?\s*$/i.test(t) ||
        /^(bachelor|master|phd|diploma|high school)('s)?(\s+degree)?$/i.test(t);
      // Labelled values whose value identifies a person: replace the value, keep the label.
      const IDENT_LABEL = /^(current job|current position|company|employer|works at|university|school|college)\s*:\s*/i;

      const avatarLike = (img) => {
        const r = img.getBoundingClientRect();
        if (r.width < 16 || r.width > 96 || Math.abs(r.width - r.height) > 6) return false;
        const cue = `${img.alt || ''} ${img.getAttribute('src') || ''} ${img.className || ''}`;
        const round = parseFloat(getComputedStyle(img).borderRadius) >= r.width * 0.3;
        return round || /avatar|user|profile|person|candidate|photo/i.test(cue);
      };
      const cardOf = (el) => {
        for (let n = el, d = 0; n && n.parentElement && d < 9; n = n.parentElement, d++) {
          const p = n.parentElement;
          const twins = [...p.children].filter((c) => c.tagName === n.tagName && c.className === n.className);
          if (twins.length >= 2 && n.getBoundingClientRect().height > 40) return n;
        }
        return null;
      };

      let cards = 0;
      let leaves = 0;
      const done = new Set();
      [...document.querySelectorAll('img')].filter(avatarLike).forEach((img) => {
        const card = cardOf(img);
        if (!card || done.has(card)) return;
        done.add(card);
        cards++;
        let named = false;
        leavesOf(card).forEach((leaf, i) => {
          const t = leaf.textContent.trim();
          const lab = t.match(IDENT_LABEL);
          if (lab) {
            leaf.textContent = `${lab[0].trim()} ${pick(jobs, cards + i)}`;
            leaves++;
            return;
          }
          if (KEEP(t)) return;
          if (!named) {
            leaf.textContent = pick(names, cards);
            named = true;
          } else {
            // After the name, a short line with no digits is almost always the city.
            // Give it a real Egyptian place rather than an ad title, so the prototype
            // reads correctly; anything else still gets overwritten.
            const short = t.split(/\s+/).length <= 4 && !/\d/.test(t);
            leaf.textContent = short ? pick(places, cards + i) : pick(jobs, cards + i);
          }
          leaves++;
        });
      });

      // Labelled person fields, anywhere on the page.
      let fields = 0;
      /* The product often labels these itself: Agency Ads renders
         <div aria-label="Agent name">Assigned to: <b>Ahmed Agent 1</b></div>. The label
         is a text node beside the <b>, not a leaf of its own, so a leaf-based rule never
         sees it. The aria-label is the reliable hook. */
      document.querySelectorAll('[aria-label]').forEach((el, i) => {
        if (!/\b(agent|user|customer|candidate|seller|owner|contact|buyer)\s*name\b|^name$/i.test(el.getAttribute('aria-label'))) return;
        const inner = [...el.querySelectorAll('*')].filter((n) => n.children.length === 0 && n.textContent.trim());
        if (inner.length) inner.forEach((n) => { n.textContent = pick(names, i); fields++; });
        else if (el.textContent.trim()) {
          el.textContent = el.textContent.replace(/(:\s*)?[^:]+$/, (m, colon) => `${colon || ''}${pick(names, i)}`);
          fields++;
        }
      });
      const LABEL = /^(assigned to|posted by|agent|agent name|contact person|owner)\s*:?\s*$/i;
      leavesOf(document.body).forEach((leaf, i) => {
        const t = leaf.textContent.trim();
        const inline = t.match(/^(assigned to|posted by|agent)\s*:\s*(.+)$/i);
        if (inline) {
          leaf.textContent = `${inline[1]}: ${pick(names, i)}`;
          fields++;
          return;
        }
        if (!LABEL.test(t)) return;
        const next =
          leaf.nextElementSibling ||
          [...(leaf.parentElement?.parentElement?.querySelectorAll('*') ?? [])].find(
            (n) => n.children.length === 0 && n.compareDocumentPosition(leaf) & Node.DOCUMENT_POSITION_PRECEDING && n.textContent.trim(),
          );
        if (next && next.textContent.trim() && !KEEP(next.textContent.trim())) {
          next.textContent = pick(names, i);
          fields++;
        }
      });
      return { cards, leaves, fields };
    },
    { names: FIXTURE_NAMES, ads: FIXTURE_ADS, jobs: FIXTURE_JOBS, places: FIXTURE_PLACES },
  );
}
