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
  /* The one state that shows someone's conversation. Two ways in, both deliberate:
       CHAT_THREAD_URL=/en/chat/user/<id>/<ad> npm run capture:states -- chat-thread
     opens exactly the thread the account holder named, or, with no URL, the runner opens a
     conversation that is ALREADY read (no read receipt reaches the other person) and refuses
     when every chat is unread. The thread's own id never enters this file — it identifies a
     real person. Message text, names and the ad line are replaced by redactPage, and the
     capture is refused outright if a name or phone survives. */
  'chat-thread': {
    label: 'Chat — an open conversation',
    url: process.env.CHAT_THREAD_URL || '/en/chat',
    layouts: ['desktop', 'mobile'],
    fixtures: true,
    /* people swap phone numbers inside chat messages — scrub them like any other
       third-party contact detail, in the page and again in the saved HTML */
    scrubContacts: true,
    /* the thread renders late — 9s, or the runner freezes an empty page */
    steps: process.env.CHAT_THREAD_URL ? [{ wait: 9000 }] : [{ wait: 9000 }, { openReadChat: true }],
  },

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

  /* No 'toast-favourite': re-probed 2026-09-22 on desktop and mobile web — favouriting on
     live raises NO toast (the heart just fills), so the old capture was a plain listing.
     Every toast in the repo follows a real action (export, invite, activate, purchase,
     password change). None can be captured read-only; see docs/COMPONENT-INVENTORY.md. */

  /* Agency portal interaction states. Each is a frame the prototype's hotspots jump to:
     click Date Range on Leads, land on this. They sit on a people page, so they run the
     full fixture passes (fixtures: true), not just contact scrubbing. */
  'portal-leads-daterange': {
    label: 'Agency portal — Leads, Date Range open',
    url: '/en/agencyPortal/leads',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Preset range' },
    steps: [{ wait: 1500 }, { click: { text: 'Date Range' } }, { wait: 1500 }],
  },

  /* Popups & modals, pass 2 (2026-09-22). Probed first: every trigger opened, its heading
     read, closed with Escape. Read-only: nothing is ever submitted, applied, purchased,
     sent or confirmed — the capture freezes the open state and leaves. */
  'dpv-gallery': {
    label: 'Ad detail — full-screen gallery',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop'],
    scrubContacts: true,
    expect: { text: 'Back to Ad Details' },
    steps: [{ click: { selector: '[aria-label="Gallery"]' } }, { wait: 2500 }],
  },
  /* The location dialog is a bare Google Maps iframe — nothing of dubizzle's to record. */
  'dpv-report-form': {
    label: 'Ad detail — report this ad (signed in, never submitted)',
    url: '/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',
    layouts: ['desktop'],
    account: true,
    scrubContacts: true,
    expect: { text: 'Item report' },
    steps: [{ click: { text: 'Report this ad' } }, { wait: 2500 }],
  },
  'portal-ads-credits': {
    label: 'Agency portal — Available credits dropdown',
    url: '/en/agencyPortal/ads',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Used by Owner' },
    steps: [{ wait: 1500 }, { click: { at: [1280, 114] } }, { wait: 1500 }],
  },
  'portal-ads-more-filters': {
    label: 'Agency portal — Agency Ads, More Filters',
    url: '/en/agencyPortal/ads',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Agent Code' },
    steps: [{ wait: 1500 }, { click: { text: 'More Filters' } }, { wait: 1500 }],
  },
  'portal-ads-request-brand': {
    label: 'Agency portal — Request to add Brand/Model dialog (never submitted)',
    url: '/en/agencyPortal/ads',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Add New Car Brand/Model' },
    steps: [{ wait: 1500 }, { click: { text: 'Request to add Brand/Model' } }, { wait: 1500 }],
  },
  'portal-ads-actions': {
    label: 'Agency portal — Agency Ads, ad actions menu (⋯)',
    url: '/en/agencyPortal/ads',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Mark as sold' },
    steps: [{ wait: 1500 }, { click: { at: [1371, 518] } }, { wait: 1200 }],
  },
  'portal-ad-assign-agent': {
    label: 'Agency portal — ad drawer, Change Agent dialog (never saved)',
    url: '/en/agencyPortal/ads/extraDetails/207466446/agent?tabChange=true',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'New Responsible Agent' },
    steps: [{ wait: 2000 }, { click: { text: 'Assign Agent' } }, { wait: 1500 }],
  },
  'portal-agents-invite': {
    label: 'Agency portal — Invite agent dialog (never sent)',
    url: '/en/agencyPortal/agents',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Send invitation to an agent to join you.' },
    steps: [{ wait: 1500 }, { click: { text: 'Invite agent' } }, { wait: 1500 }],
  },
  'portal-agents-sort': {
    label: 'Agency portal — Agency Management, Sort by menu',
    url: '/en/agencyPortal/agents',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Sort By Total Ads' },
    steps: [{ wait: 1500 }, { click: { text: 'Sort by' } }, { wait: 1200 }],
  },
  'portal-agents-actions': {
    label: 'Agency portal — agent row actions menu (⋮)',
    url: '/en/agencyPortal/agents',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Update Credits' },
    steps: [{ wait: 1500 }, { click: { at: [1378, 450] } }, { wait: 1200 }],
  },
  'portal-leads-export': {
    label: 'Agency portal — Export Leads confirmation (never confirmed)',
    url: '/en/agencyPortal/leads',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Export Details' },
    steps: [{ wait: 1500 }, { click: { text: 'Export Leads' } }, { wait: 1500 }],
  },
  'portal-vip-purchase': {
    label: 'Agency portal — VIP Leads, Purchase Lead confirmation (never confirmed: spends credits)',
    url: '/en/agencyPortal/vip',
    layouts: ['desktop'],
    account: true,
    fixtures: true,
    expect: { text: 'Purchase Lead' },
    steps: [{ wait: 2000 }, { click: { text: 'Purchase' } }, { wait: 1500 }],
  },
};
