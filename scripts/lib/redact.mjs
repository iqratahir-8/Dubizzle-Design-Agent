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

const PHONE = /(?:\+?20[\s-]?)?\b0?1[0125][\s-]?\d{3,4}[\s-]?\d{4}\b/g;
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
  await page.goto(`${origin}/en/editProfile/info`, { waitUntil: 'networkidle2', timeout: 90_000 });
  await new Promise((r) => setTimeout(r, 2000));
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

      // Open chat thread: message bubbles live outside the row links.
      if (/\/chat\/.+/.test(location.pathname)) {
        const thread = [...document.querySelectorAll('[class*="essage"], [class*="ubble"]')].filter(
          (e) => !e.closest('a[href*="/chat/"]') && e.children.length === 0 && e.textContent.trim().length > 2 && !isTime(e.textContent.trim()),
        );
        thread.forEach((e, i) => {
          e.textContent = sample.messages[i % sample.messages.length];
          counts.bubbles++;
        });
      }

      // Every remaining visible text node.
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
