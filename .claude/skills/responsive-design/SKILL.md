---
name: responsive-design
description: >-
  Build mobile-first dubizzle Egypt screens, flows and prototypes — and, when asked, the
  desktop companion side by side. Starts from the live-capture page templates (they
  render like production on desktop and mobile), composes new UI from the React library
  (AdCard / AdListCard with device="mobile", Chip quick/filter/segment…), sources any
  genuinely missing mobile piece from the product monorepo, and verifies against the
  live site with the capture tooling. Use this WHENEVER the task involves a mobile /
  responsive design, a mobile version of a page, a mobile user flow or prototype,
  "mobile-first", "make it responsive", "mobile only", bottom sheet, bottom nav, filter
  bar or quick filters — for one screen or a whole flow. Handles both "mobile + desktop
  together" and "mobile only".
---

# Responsive (mobile-first) design

## Why this works the way it does

dubizzle is mobile-majority, and the mobile layout makes the hard decisions (what
collapses into a sheet, what the bottom nav carries, tap targets). Desktop widens from a
correct mobile base.

Hand-built pages only ever approximated the live site, so designs used to start with
fixing the template. That's solved: **templates are now frozen captures of the real
pages** and render within ~0–3% of the live screenshots. Build on them; don't rebuild
chrome that already exists.

## Modes — read the request

| Ask | Mode | Output |
|---|---|---|
| "mobile responsive", "mobile version", "responsive", "mobile + desktop", "side by side" | **companion** (default) | mobile-first, then the desktop counterpart; both verified side by side |
| "mobile only", "just mobile", "only the mobile design" | **mobile-only** | mobile screens/flow only — no desktop artifact |

If unsure, ask one question: "mobile only, or mobile + desktop?" Never build a desktop
artifact in mobile-only mode.

## Step 1 — Start from the live template (never a blank page)

`design-kit/templates/index.html` lists every template with its pixel difference from live.
Each exists as `templates/mobile/<name>.html` and `templates/desktop/<name>.html`:

| Surface | Template |
|---|---|
| Home | `home` |
| Landing pages | `motors`, `properties`, `car-finance` |
| Search results | `search` (cars), `search-property`, `search-mobiles` |
| Ad detail | `ad-detail` (car), `ad-detail-property`, `ad-detail-mobile-phone` |
| Seller / business profile | `seller-page` |
| Login (dialog), 404 | `login`, `not-found` |
| Account (local only, gitignored) | `my-ads`, `chat`, `edit-profile`, `settings-privacy`, `settings-notifications`, `packages` |
| Post an ad (local only) | `post-ad-category`, `post-ad-subcategory`, `post-ad`, `post-ad-filled` |
| Upselling (local only) | `upsell-select`, `upsell` |
| Hand-built (no capture yet) | `favourites`, `payment`, `agency-portal` |

Copy the closest template to a new file and edit it. Live templates are production HTML
(hashed class names, shared CSS in `_live-css/`, images in `_live/assets/`) — keep the
`<link>`s, change content and structure where the feature needs it. Account-only
templates exist only on the machine that ran the logged-in captures.

If a template doesn't exist for your surface but the page is public, capture it first
(`live-capture` skill) — ten minutes of capture beats a day of approximation.

## Step 2 — Compose new UI from the component library

For anything the feature adds, use the design system — it matches live
(`docs/LIVE-MEASUREMENTS.md`, `npm run check:parity` keeps React and the kit identical):

| Need | React (`src/components`) | HTML kit (`patterns.css`) |
|---|---|---|
| Grid ad card — home/landing rails, "similar ads" under an ad | `<AdCard device="mobile" …>` | `.ad-card.ad-card--mobile` |
| List ad card — search results | `<AdListCard device="mobile" …>` (property: `type`, `beds/baths/area`; cars: `brand`, `model`, `attributes`) | `.ad-list-card.ad-list-card--mobile` |
| Filter bar chips ("Cars for Sale ▾"), filters button with count | `<Chip variant="filter" caret selected count={2}>` | `.chip.chip--filter.is-selected`, `.chip__count` |
| Quick filters (brand shortcuts) | `<Chip variant="quick" device="mobile">` | `.chip.chip--mobile` |
| All / New / Used switch | `<Chip variant="segment" selected>` | `.chip.chip--segment.is-selected` |
| Attribute chips (Year 2026…) | `AdListCard attributes` | `.attr-chips.attr-chips--stacked` |
| Call / WhatsApp / Chat | `<ContactButton variant="call">` | `.contact-btn--call` |
| Icons | `src/components/icons` (generated from `design-kit/icons`) | `design-kit/icons/**` |

Card price colour differs by type and must stay that way: **grid = red, list = charcoal**.

## Step 3 — Genuinely missing pieces: source from the monorepo

Only when neither a live template nor a component covers it (e.g. filters page, sort
bottom sheet, location sheet, category switcher dialog, bottom-nav states on a new page):

- Product monorepo: path in `design-sync.config.json` → `monorepoPath`. Newest mobile
  components: `frontend/dubizzle-facelift/dubizzle-facelift/**/compact/`.

  | Mobile piece | Real component |
  |---|---|
  | Bottom navigation | `navigation/compact/bottomBar.tsx`, `bottomBarLink.tsx`, `sellSaveButton.tsx` |
  | Bottom sheet | `modal/compact/bottomSheet/responsiveBottomSheet.tsx` |
  | Quick filters | `search/compact/quickFilters/*` |
  | Filters page/dialog | `search/compact/filtersDialog.tsx`, `search/filters/compact/*` |
  | Category switcher | `categorySwitcher/compact/*` |
  | Location picker | `search/location/compact/*` |
  | Header states | `header/compact/header.tsx`, `headerWithVerticals.tsx` |

- Read the JSX + `.cssm` for anatomy and states, then **check the live site** — the
  monorepo lags production and **live wins** (open the live page, or capture it, and
  measure with `getComputedStyle` on the snapshot).
- Materialize it so the system gains it: React in `src/components/<Name>/` (+ story) and
  the matching class in `patterns.css`; add a pair to `scripts/check-parity.mjs`; record
  measured values in `docs/LIVE-MEASUREMENTS.md`.

## Desktop ↔ mobile rules (measured, not guessed)

Build at **390px** (test 360–414); desktop at **1440px**. Mobile ≤ 768px.

- **Cards change type, not just size.** Mobile list card stacks a 240px image on top,
  18px charcoal price, time in the price row's corner, stacked attribute chips, full-width
  contact buttons. Mobile grid card: 8px padding, 160px image, 12px spec lines.
- **Filter rail → filter bar.** Desktop's left rail becomes the mobile filter-bar chips
  (32px, applied = charcoal outline) plus a filters page / bottom sheets.
- **Quick filters** are grey 42px on desktop, white 37px on mobile.
- **Overlays not inline** on mobile: location, sort, make/model, category → bottom sheets.
- **Touch:** tap targets ≥ 44px; horizontal scroll only for chip rows and carousels.
- **RTL always** (`-inline-start/-end`). Same tokens; mobile is layout, not a re-skin.

## Flows and prototypes

A flow is every screen the user passes through. List the screens first (e.g. Motors:
landing → search results → filters → ad detail → contact; Post an ad: category →
subcategory → details → upsell), start each from its template, and present the mobile
screens side by side in 390px frames (headless Chrome screenshots).

## Quality gates (before calling it done)

1. `token-check` skill on every CSS you authored — 0 errors (live-template HTML is
   production code and is skipped by the linter; your additions are not).
2. If you touched a component: `npm run check:parity` → 0 differ (needs `npm run dev` + `npm run kit`).
3. If you rebuilt templates: `npm run check:templates` → all ok.
4. `accessibility` + `web-design-guidelines` skills on new UI — tap targets, labels, focus.
5. Screenshot at 390px (and 1440px in companion mode) next to the live screenshot in
   `design-kit/reference/live/screens/` and compare.
6. Update `PROGRESS.md` and commit (see `CLAUDE.md`).
