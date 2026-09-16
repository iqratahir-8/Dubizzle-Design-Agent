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
};
