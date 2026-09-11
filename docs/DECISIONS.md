# Design Decisions & Discoveries

The design system's memory. Each entry records a decision or a discovery, the
**evidence** behind it, and its status — so it isn't re-litigated or re-broken in
a later session. Read this before building; add to it whenever you learn something
the code alone wouldn't tell you.

Format: `D-NNN — title` · date · status · what · evidence.

---

## D-001 — Listing price is CHARCOAL, not red
**2026-09-11 · adopted (cars + property); goods unverified**

The main ad-card price renders in charcoal `#23262a` (`--text-primary` / `--gray-06`),
not the brand red. Red stays reserved for action/brand (Post Your Ad, CTAs).

*Evidence:* measured the saved live dubizzle.com.eg pages — main price computes to
`rgb(35,38,42)` at 24px/700 on both motors and properties. The monorepo code says
red (`.priceLabel { color: $adCardPriceColor }` → `$primaryColor` → `$red05` →
`#e00000`), but **live production renders charcoal**, so the code snapshot is behind
production. The `$gray06` in `gridViewStyles.cssm:127` is on `.downpaymentPriceLabel`
(secondary price), not the main price. Goods/normal-category card has no saved live
reference yet — code says red there too; confirm before assuming charcoal.

## D-002 — The listing card is three category anatomies, not one
**2026-09-11 · adopted**

One shell (`.ad-list-card`), three per-vertical bodies, keyed by category:
- **Cars** — price + model chip → title → `mileage • year` (the live `AdCarSubtitle` shows only two fields).
- **Property** — no free-text title; leads with property **type** + `beds • baths • area`, then attribute chips (Completion Status, Ownership).
- **Goods** — price → title → a single condition attribute; no structured specs.

*Evidence:* the product implements this as a shared `AdCard` that branches
`hero` (cars/property/jobs) vs `normal` (goods) at runtime
(`useShowHeroCategoryAdCardDesign`), with per-vertical subtitle atoms
(`ad/adCarSubtitle`, `adPropertySubtitle`, `adJobSubtitle`). A separate `strat`
property card exists for the Bayut/Zameen layout.

## D-003 — The monorepo lags production; live is ground truth
**2026-09-11 · standing rule**

The extracted `dubizzle-maple` snapshot is behind what actually ships (the price
colour is the proof). When code and live disagree, **live wins.** Re-measure the
live page per feature rather than trusting the snapshot.

## D-004 — Method: capture live, measure with headless Chromium
**2026-09-11 · standing method**

Don't trust the monorepo or a screenshot alone. Serve the saved live page and
measure real elements with `getComputedStyle` + `getBoundingClientRect` (Playwright
/ Chromium). That is how every value in COMPONENT-AUDIT.md and REFERENCES.md was
obtained, and it's what caught the price-colour discrepancy. Note: this environment's
network egress to dubizzle.com.eg is blocked, so live pages must be **saved and
uploaded**, then measured locally.
