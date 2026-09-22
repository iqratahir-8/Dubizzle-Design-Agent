# How to ask the design agent for these screens

This file is the user-facing guide to the design system in this repo. It lives here so it
travels with the project: any Claude account, any machine with this folder, same instructions.

There is no syntax to learn. Describe the design work in plain English — the skills in this
repo (`SKILL.md`, `.claude/skills/responsive-design`, `live-capture`, `token-check`) trigger on
their own. What changes the result is **naming the screen you want to start from**: name one and
the work starts from a pixel-perfect capture of the real page; name none and it starts from
scratch.

## Start the servers (optional, but useful)

```bash
npm run kit
```

http://localhost:4321 — the design kit: tokens, components, icons, and
http://localhost:4321/templates/index.html, every page template with its measured difference
from the live site.

```bash
npm run dev
```

http://localhost:6006 — Storybook: **Templates → Pages** frames those same template files with a
desktop/mobile toggle; every component sits under Components / Layout / Mobile.

Both also start from the app's preview launcher (`.claude/launch.json`).

## What to say

| Ask | What the agent does |
|---|---|
| "Design a saved-search banner on the **property landing**, mobile only" | Copies `design-kit/templates/mobile/property-landing.html` and builds on it, composing anything new from the component library |
| "Add a compare toggle to the **cars search** page, desktop and mobile" | Both templates, built side by side, checked against the live screenshots |
| "Open the **Vehicles mega menu** and try a promo panel in it" | Starts from the `menu-vehicles` template, or from `<MegaMenu items={MEGA_MENUS}>` when it needs to open on hover |
| "Use the **list card**, not the grid one" | `AdListCard` with the right device and type (list price is charcoal; grid price is red) |
| "The home page changed on live — **recapture** it" | The `live-capture` skill: re-snapshot, verify against a fresh screenshot, rebuild templates and stories |
| "What's missing from the Property vertical?" | Reads `docs/PAGE-COVERAGE.md`, the audit of live navigation against what we hold |
| "Does this CSS follow the rules?" | `token-check`: off-palette colours, invented radii, and the AI-slop patterns in `RULES.md` |
| "Store the components you find in this page" | Measures them on live, builds React + kit versions, adds stories and a parity pair |

Two things worth saying out loud when they matter:

- **"mobile only"** or **"mobile and desktop"** — the default is both, side by side.
- **"prototype"** or **"production React"** — a throwaway HTML screen and a library component are
  different deliverables.

## The screens you can name

47 public page templates, each in desktop and mobile. You don't have to use the exact name —
"the rent listing" or "the compound page" is enough.

- **Home & verticals:** `home`, `motors`, `property-landing` (`/en/realestate/`), `car-finance`
- **All-ads listings:** `vehicles-listing`, `properties`
- **Motors search:** `search` (cars), `search-cars-model`, `search-motorcycles`, `search-trucks`
- **Property search:** `search-property`, `search-property-rent`, `search-property-commercial`,
  `search-property-vacation`, `search-property-land`, `property-area`, `property-compound`
- **Goods:** `search-mobiles`
- **New Cars:** `new-cars`, `new-cars-brand`, `new-cars-model`, `car-comparison`,
  `car-comparison-result`, `electric-cars`, `car-finance-bank`
- **Ad detail:** `ad-detail` (car), `ad-detail-property`, `ad-detail-property-rent`,
  `ad-detail-mobile-phone`
- **Profiles & directories:** `seller-page` (dealer), `agency-page`, `property-agencies`
- **Chrome states:** `menu-vehicles`, `menu-properties`, `menu-mobiles`, `menu-jobs`,
  `menu-furniture`, `menu-electronics`, `menu-more-categories`, `menu-vehicles-car-care`,
  `location-dropdown`, `search-suggestions`
- **Mobile pages:** `m-search-overlay`, `m-search-suggestions`, `m-location-page`
- **Other:** `login` (dialog), `not-found`

The authoritative list is `design-kit/templates/live-templates.json`, rendered at
http://localhost:4321/templates/index.html.

### Local-only screens

The signed-in screens — My Ads, chats, Edit profile, settings, business packages, the whole Post
an Ad flow, upselling, the user menu and the mobile account page — are built from **redacted**
logged-in captures. Those stay on the machine that made them and are never committed, so on a
fresh clone they have to be recaptured:

```bash
npm run capture:login
```

Sign in yourself in the window that opens (the agent never types credentials), confirm with
`npm run capture:login -- --check`, then ask for the account captures.

## Using the components in code

```bash
npm install && npm run build
```

```tsx
import { Header, MegaMenu, MEGA_MENUS, AdCard, AdListCard, Chip, ContactBar } from 'dubizzle-design-system';
```

`Header` carries the category strip and its mega menus; `MEGA_MENUS` is the live menu content.
Every component is measured against the live site — see `docs/LIVE-MEASUREMENTS.md` — and the
React and HTML versions are kept identical by `npm run check:parity`.

## Asking for a re-capture after a dubizzle release

| Task | Command (or just ask) |
|---|---|
| Public pages | `npm run capture:rendered -- home motors …` |
| Dropdowns and overlays | `npm run capture:states` |
| The whole mega menu content | `node scripts/extract-mega-menus.mjs` |
| Signed-in screens | `npm run capture:login`, then `npm run capture:account` |
| Rebuild templates + stories | `npm run build:templates` |
| Verify | `npm run check:captures`, `npm run check:templates`, `npm run check:parity` |

## If the agent seems not to know any of this

Say "read PROGRESS.md" — it is the handoff file, kept current, and it points at everything else:
`RULES.md` (the binding constraints), `docs/COMPONENT-INVENTORY.md` (what exists and what's next),
`docs/LIVE-MEASUREMENTS.md` (every measured value), `docs/PAGE-COVERAGE.md` (what's captured),
`docs/DECISIONS.md` (why things are the way they are).


## The agency portal prototype

The eight portal sections plus three sub-screens are a clickable prototype built from real
captures. Start at **Dashboard** and use the sidebar.

- Kit: `npm run kit`, then open `http://localhost:4321/templates/desktop/portal-dashboard.html`
- Storybook: `npm run dev` → Templates → Pages → Agency portal — …

Say **"rebuild the portal prototype"** after a re-capture, and **"check the prototype"** to
run `npm run check:prototype` (privacy, dead links, and a real click-through of every route).
Desktop only: dubizzle Pro has no mobile layout.

**What works in it (2026-09-22):** sidebar drawer; Leads tabs and Date Range; working
filters on every page (dubizzle's real option lists); the **ad details drawer** (click any
Agency Ads card; five tabs); and **every popup** — More Filters, Request Brand/Model, the
credits dropdown, the ⋯ and ⋮ action menus, Change Agent, Invite agent, Sort by, Export
Leads, Purchase Lead. Cancel, a click outside, or Escape closes them. Confirm buttons do
nothing on purpose: those actions were never performed, so there is no screen after them.

## Popups and modals you can name

Consumer: `login-dialog`, `dpv-phone` (login gate), `dpv-report` / `dpv-report-form`,
`dpv-gallery`, `sort-menu`, `m-filters` (mobile), `save-search`, `dpv-details-expanded`.
Portal: `portal-ads-credits`, `portal-ads-more-filters`, `portal-ads-request-brand`,
`portal-ads-actions`, `portal-ad-assign-agent`, `portal-agents-invite`,
`portal-agents-sort`, `portal-agents-actions`, `portal-leads-export`,
`portal-vip-purchase`, `portal-leads-daterange`. All in Storybook → Templates → Pages and
in the kit's templates index. There is no live toast to capture: every dubizzle toast
follows a real action (see PROGRESS item 35).
