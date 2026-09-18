/**
 * The interaction states captured by scripts/capture-states.mjs — the header mega menus, the
 * location dropdown, the search suggestions, the mobile search/location overlays and the
 * signed-in user menu.
 *
 * They live here, apart from the capture script, so other tools can read the list without
 * running a capture: check-captures.mjs compares these at viewport size (an overlay in a
 * full-page screenshot is re-laid out of view) and build-live-templates.mjs labels them.
 */
/**
 * Steps run in order against a loaded page:
 *   hover  — real mouse move onto the element (the category menus open on onMouseEnter)
 *   click  — a real click at the element's centre
 *   type   — keyboard input into the focused field
 *   wait   — milliseconds
 * `text` matches the element's own text, `within` limits the search to a y range so that
 * "Properties" in the nav strip doesn't match "Properties" in the page body, and `at` picks
 * whatever sits at a viewport point (used where the text is the account holder's name).
 */
export const STATES = {
  'menu-vehicles': {
    label: 'Header mega menu — Vehicles',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'Vehicles', within: [120, 200] } }, { wait: 1200 }],
  },
  'menu-properties': {
    label: 'Header mega menu — Properties',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'Properties', within: [120, 200] } }, { wait: 1200 }],
  },
  'menu-more-categories': {
    label: 'Header mega menu — More Categories',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'More Categories', within: [120, 200] } }, { wait: 1200 }],
  },
  'menu-mobiles': {
    label: 'Header mega menu — Mobiles & Tablets',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'Mobiles & Tablets', within: [120, 200] } }, { wait: 1200 }],
  },
  'menu-jobs': {
    label: 'Header mega menu — Jobs',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'Jobs', within: [120, 200] } }, { wait: 1200 }],
  },
  'menu-furniture': {
    label: 'Header mega menu — Home & Office Furniture - Decor',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'Home & Office Furniture - Decor', within: [120, 200] } }, { wait: 1200 }],
  },
  'menu-electronics': {
    label: 'Header mega menu — Electronics & Appliances',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ hover: { text: 'Electronics & Appliances', within: [120, 200] } }, { wait: 1200 }],
  },
  /** Second level: the right panel follows the subcategory under the pointer. */
  'menu-vehicles-car-care': {
    label: 'Header mega menu — Vehicles, Car Care panel',
    url: '/en/',
    layouts: ['desktop'],
    steps: [
      { hover: { text: 'Vehicles', within: [120, 200] } },
      { wait: 1200 },
      { hover: { text: 'Car Care', within: [190, 620] } },
      { wait: 1200 },
    ],
  },
  'location-dropdown': {
    label: 'Header location dropdown',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ click: { text: 'Egypt', within: [60, 140] } }, { wait: 1500 }],
  },
  'search-suggestions': {
    label: 'Header search suggestions',
    url: '/en/',
    layouts: ['desktop'],
    steps: [{ click: { selector: 'input[type="search"]' } }, { type: { text: 'toyota' } }, { wait: 2500 }],
  },
  'm-search-overlay': {
    label: 'Mobile search page (empty)',
    url: '/en/',
    layouts: ['mobile'],
    steps: [{ click: { text: 'Search for great finds' } }, { wait: 2000 }],
  },
  'm-search-suggestions': {
    label: 'Mobile search page — suggestions',
    url: '/en/',
    layouts: ['mobile'],
    steps: [{ click: { text: 'Search for great finds' } }, { wait: 1500 }, { type: { text: 'toyota' } }, { wait: 2500 }],
  },
  'm-location-page': {
    label: 'Mobile location page',
    url: '/en/',
    layouts: ['mobile'],
    steps: [{ click: { text: 'Egypt', within: [120, 260] } }, { wait: 2000 }],
  },
  /** Signed-in: the header's account menu. Redacted and gated like every account capture. */
  'user-menu': {
    label: 'Header user menu (signed in)',
    url: '/en/',
    layouts: ['desktop'],
    account: true,
    // The trigger is the avatar + name chip in the top row. It is addressed by position
    // rather than by text, because its text is the account holder's name.
    steps: [{ click: { at: [1120, 34] } }, { wait: 1800 }],
  },
  'm-user-menu': {
    label: 'Mobile account menu (signed in)',
    url: '/en/',
    layouts: ['mobile'],
    account: true,
    steps: [{ click: { text: 'Account' } }, { wait: 2500 }],
  },

  /* ── Modals and sheets (consumer side) ──────────────────────────────────────
     Each opens with a real click and is then frozen like any other capture.
     `scrubContacts` replaces third-party phone numbers/emails with the sample
     before the screenshot and before the HTML is written — the phone-reveal
     modal shows a real seller's number, and a capture is a durable copy of it.
     NOTHING here submits: the report dialog is opened and frozen, never sent. */

  /* Signed out, "Show Phone Number" does NOT reveal a number — it opens the login
     dialog. So this state captures the *gate*, which is worth having: it is where
     the product asks for an account. The real reveal needs --account (dpv-phone-in). */
  'dpv-phone': {
    label: 'Ad detail — phone reveal is gated by login (signed out)',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop'],
    scrubContacts: true,
    layoutsNote: 'desktop only — mobile has no "Show phone number"; its Call button dials directly',
    expect: { text: 'Login into your Dubizzle account' },
    steps: [{ click: { text: 'Show phone number' } }, { wait: 2500 }],
  },
  'dpv-report': {
    label: 'Ad detail — report this ad modal (never submitted)',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop', 'mobile'],
    scrubContacts: true,
    expect: { text: 'Login into your Dubizzle account' },
    steps: [{ click: { text: 'Report this ad' } }, { wait: 2500 }],
  },
  /* "View +5 more" is the DETAILS expander, not a photo control — it reveals extra
     spec rows (Full Leather, …). Mobile web has no photo gallery at all: the page
     says "All 15 images are available in the app". So this state is the expanded
     details table, which is what the control actually does, on both layouts. */
  'dpv-details-expanded': {
    label: 'Ad detail — details table expanded',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop', 'mobile'],
    expect: { text: 'Full Leather' },
    steps: [{ click: { text: 'View +5 more' } }, { wait: 2000 }],
  },
  /* Desktop only: the mobile home page has no login button — mobile signs in from
     the bottom nav's Account tab, which is a different flow (see m-user-menu). */
  'login-dialog': {
    label: 'Login or Signup dialog',
    url: '/en/',
    layouts: ['desktop'],
    expect: { text: 'Login into your Dubizzle account' },
    steps: [{ click: { text: ['Login or Signup', 'Login or Sign up'] } }, { wait: 2500 }],
  },
  'sort-menu': {
    label: 'Listing — sort menu open (desktop)',
    url: '/en/vehicles/cars-for-sale/',
    layouts: ['desktop'],
    expect: { text: 'Most relevant' },
    steps: [{ click: { text: 'Sort by: Newly listed' } }, { wait: 1500 }],
  },
  'm-filters': {
    label: 'Listing — mobile filter sheet',
    url: '/en/vehicles/cars-for-sale/',
    layouts: ['mobile'],
    expect: { text: 'Searching For' },
    steps: [{ click: { selector: 'img[alt="Filters Icon"]' } }, { wait: 2500 }],
  },
  'save-search': {
    label: 'Listing — Save Search (signed out prompt)',
    url: '/en/vehicles/cars-for-sale/',
    layouts: ['desktop'],
    expect: { text: 'Login into your Dubizzle account' },
    steps: [{ click: { text: 'Save Search' } }, { wait: 2500 }],
  },

  /* ── Signed-in states (npm run capture:states -- --account) ─────────────────
     Signed out, these three only ever produced the login gate (D-009). With an
     account they open the real dialogs. Nothing here submits: the report dialog is
     opened and frozen, never sent. */

  'dpv-phone-in': {
    label: 'Ad detail — phone reveal (signed in)',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop'],
    account: true,
    scrubContacts: true,
    steps: [{ click: { text: 'Show phone number' } }, { wait: 3000 }],
  },
  'dpv-report-in': {
    label: 'Ad detail — report dialog (signed in, never submitted)',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop'],
    account: true,
    scrubContacts: true,
    steps: [{ click: { text: 'Report this ad' } }, { wait: 3000 }],
  },

  /* Favouriting WRITES to the account, so this state carries a cleanup that unsets
     it afterwards. The heart is a 24×24 svg on the card's right edge; its class is a
     build hash, so match the path instead — the hash changes on every deploy. */
  'toast-favourite': {
    label: 'Listing — favourite toast (undone after capture)',
    url: '/en/vehicles/cars-for-sale/',
    layouts: ['desktop'],
    account: true,
    steps: [{ click: { selector: 'svg:has(> path[d^="M15.71 5"])' } }, { wait: 2000 }],
    cleanup: [{ click: { selector: 'svg:has(> path[d^="M15.71 5"])' } }, { wait: 1500 }],
  },
};
