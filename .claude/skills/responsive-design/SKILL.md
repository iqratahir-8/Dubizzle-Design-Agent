---
name: responsive-design
description: >-
  Build mobile-first dubizzle Egypt screens, flows and prototypes from the design
  system — and, when asked, the desktop companion side by side. Sources each mobile
  piece from the real product code first, materializes anything missing into the
  design system (mobile ad card, landing-page header states, footer, bottom
  navigation, quick filters, filters page, bottom sheets…), and verifies against the
  live site. Use this WHENEVER the task involves a mobile / responsive design, a
  mobile version of a page, a mobile user flow or prototype, "mobile-first",
  "make it responsive", "mobile only", bottom sheet, bottom nav, or quick filters —
  for one screen or a whole flow. Handles both "mobile + desktop together" and
  "mobile only".
---

# Responsive (mobile-first) design

## What this does and why

The design system's desktop side is well covered; its **mobile side has gaps**
(no mobile ad card variant, landing-page header states, mobile footer, richer bottom
nav, quick filters, a filters page, bottom sheets). This skill builds mobile screens
and whole flows **mobile-first**, filling those gaps by pulling the *real* mobile
components from the product code rather than inventing them — so the work is fast and
faithful. It speeds up your process: one command turns a surface into a mobile design
(or a mobile+desktop pair) plus a browsable prototype.

Mobile-first because the product is mobile-majority and the mobile layout makes the
hard decisions (what collapses into a sheet, what the bottom nav carries, tap
targets). Desktop then widens from a correct mobile base.

## Modes — read the request

| Ask | Mode | Output |
|---|---|---|
| "mobile responsive", "mobile version", "responsive", "mobile + desktop", "side by side" | **companion** (default) | mobile-first, then the desktop counterpart; both verified side by side |
| "mobile only", "just mobile", "only the mobile design" | **mobile-only** | mobile screens/flow only — no desktop artifact |
| an existing desktop `_pages/<name>.desktop.html` exists and they want its mobile | **companion** | build `<name>.mobile.html` to mirror the flow, adapted to mobile |

If unsure which, ask one question: "mobile only, or mobile + desktop?" Don't build a
desktop artifact in mobile-only mode — that's the whole point of the catch.

## The sourcing pipeline (per surface AND per missing component)

Apply this in order. It is the heart of the skill.

### 1. Repo-first — pull the real mobile component
Attach and read the product monorepo before authoring anything:
- If `dubizzle-maple-master-copy` isn't attached, `add_repo` it (owner `chaudhary-umair-ahmad`), clone shallow, `register_repo_root`.
- The newest mobile components live under `frontend/dubizzle-facelift/dubizzle-facelift/`, in `compact/` folders. Map of the pieces you'll most often need:

  | Mobile piece | Real component |
  |---|---|
  | Mobile ad card | `adCard/compact/adCardForHeroCategory.tsx`, `adOfTheDayCard.tsx`, `carOfTheDayStrip.tsx` (+ the category split, see DECISIONS.md D-002) |
  | Landing header states | `header/compact/header.tsx`, `headerWithVerticals.tsx`, `headerLinks.tsx` |
  | Bottom navigation | `navigation/compact/bottomBar.tsx`, `bottomBarLink.tsx`, `sellSaveButton.tsx` |
  | Bottom sheet | `modal/compact/bottomSheet/responsiveBottomSheet.tsx` |
  | Quick filters | `search/compact/quickFilters/*` (`quickFilter`, `categoryQuickFilter`, `locationQuickFilter`, `makeModelQuickFilter`, `displayValueRangeQuickFilter`) |
  | Filters page/dialog | `search/compact/filtersDialog.tsx`, `search/filters/compact/*` (`filter`, `singleChoice`, `multipleChoice`, `hierarchical`, `range`, `dialogs/*`) |
  | Category switcher | `categorySwitcher/compact/*` (`categoriesDialog`, `categoryCarousel`, `categorySwitcher`) |
  | Location picker | `search/location/compact/*` (`locationsDialog`, `hierarchicalLocationSelectDialog`) |
  | Footer | `strat/navigation/compactFooter.tsx` (mobile pages usually omit the footer — confirm the surface) |

  Read the JSX + its `.cssm` to get the real anatomy (fields, order, states), the same
  way COMPONENT-AUDIT.md was built.

### 2. Materialize into the design system — save what's missing
For each piece not yet in the DS, create it and **save it**, so the system gains it:
- Shared chrome → `design-kit/templates/_partials/` (e.g. a richer `header-mobile`, `bottom-nav` states) and `design-kit/patterns/patterns.css` (mobile ad card, quick-filter bar, bottom-sheet, filters-page patterns).
- React → `src/components/<Name>/` (with `.module.css`, story) when it's a reusable component.
- Page bodies → `design-kit/templates/_pages/<name>.mobile.html` with the directive block (`"header":"mobile"` or `"mobile-back"`, `"bottomNav":"home|search|chat|ads"`).
- Rebuild: `npm run build:templates`.
Name and structure to match the existing mobile partials/patterns. Reuse tokens (run the `token-check` skill after).

### 3. Live-verify — the snapshot may lag production (DECISIONS.md D-003)
If the repo version doesn't match what actually ships, **live wins**:
- Capture the live mobile page/component and correct to match it. Preferred: a saved live mobile page (`m.dubizzle.com.eg` / the responsive site), measured locally with headless Chromium (`getComputedStyle`/`getBoundingClientRect`), or a screenshot from the live CDN.
- ⚠️ This environment's network egress to dubizzle.com.eg / its CDN is **blocked**, so a direct fetch/screenshot fails here. When it's blocked, ask the user to **save and upload** the live mobile page or a screenshot, then measure/compare. Record the measured values in `docs/REFERENCES.md`.

## Missing-inventory checklist (build these as you hit them)

Mobile ad card (per-vertical, D-002) · landing-page header states (default / scrolled / with-verticals / search-focused) · mobile footer · bottom navigation (Home / Search / Sell / Chat / My Ads, active states) · quick-filter bar (horizontal chips) · full filters page + per-filter bottom dialogs · location bottom sheet · category switcher (carousel + dialog) · sort bottom sheet · the generic `bottom-sheet` pattern. Each: source (step 1) → materialize (step 2) → live-verify (step 3).

## Desktop → mobile transform rules

When adapting an existing desktop page (companion mode), apply these — grounded in
`design-kit/layout/layout.json` breakpoints (mobile ≤ 768px; build at **390px**, test
360–414px):

- **One column.** The `search-layout` rail+results grid stacks; the filter rail becomes a **quick-filter bar** (sticky chips) + a **filters page/bottom sheet**, not an inline rail.
- **Chrome swaps.** Desktop 3-row header → `header-mobile` (logo + location + actions) with a search field; add the fixed **bottom-nav**; drop the desktop footer on app-like pages.
- **Overlays not inline.** Location, sort, make/model, category → **bottom sheets** (`responsiveBottomSheet`), full-screen dialogs on small screens.
- **Cards go compact.** Use the mobile ad-card variant (smaller media, tighter type) — not the desktop `.ad-list-card` shrunk.
- **Touch.** Tap targets ≥ 44px; sticky search/CTA within thumb reach; horizontal scroll only for chip rows and carousels, never the page body.
- **RTL always** (`-inline-start/-end`). Keep the same tokens; mobile is a layout change, not a re-skin.

## Cover the flow + prototype (as done for desktop)

A "flow" is every screen a user passes through, not one page. For the requested flow,
build each screen as a `.mobile.html` page and link them into a browsable prototype:
- Enumerate the flow's screens (e.g. Motors: landing → search results → filters sheet → ad detail → contact). List them before building so none is skipped.
- Build each screen mobile-first through the pipeline above.
- `npm run build:templates` regenerates the gallery; the mobile pages appear in `design-kit/templates/index.html`. For a phone-framed prototype view, present the mobile screens in a 390px frame side by side (screenshot with headless Chromium).

## Quality gates (every screen, before done)

1. `npm run build:templates` — no errors.
2. `node scripts/check-design.mjs <files>` — 0 errors.
3. `token-check` skill — 0 hardcoded literals.
4. `accessibility` + `web-design-guidelines` skills on the built HTML — tap targets, labels, focus order.
5. Screenshot at 390px (and 1280px in companion mode) and eyeball against the live reference.

## Where things go

`_partials/` (chrome) · `patterns.css` (mobile patterns) · `_pages/<name>.mobile.html`
(bodies) · `src/components/` (reusable React) · `docs/REFERENCES.md` (measured live
values) · `docs/DECISIONS.md` (any new discovery). Commit the materialized components
so the design system permanently gains them.
