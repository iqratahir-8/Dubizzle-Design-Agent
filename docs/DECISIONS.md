# Design Decisions & Discoveries

The design system's memory. Each entry records a decision or a discovery, the
**evidence** behind it, and its status — so it isn't re-litigated or re-broken in
a later session. Read this before building; add to it whenever you learn something
the code alone wouldn't tell you.

Format: `D-NNN — title` · date · status · what · evidence.

---

## D-001 — Price colour depends on the card type: LIST = charcoal, GRID = red
**2026-09-11 · adopted · revised 2026-09-14 after measuring grid cards**

> **Revision (2026-09-14):** the charcoal finding below holds for the **list** card (search
> results, 24px desktop / 18px mobile). The **grid** card — home and landing-page rails and
> the similar-ads widget under an ad — renders its price **red** `#e00000` at 18px/700 on
> desktop and mobile (measured on `home.desktop` / `home.mobile` captures). Components:
> `AdListCard` charcoal, `AdCard` red. See `docs/LIVE-MEASUREMENTS.md`.

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

## D-005 — Page templates are generated from live captures
**2026-09-14 · adopted**

Hand-built templates only approximated production, so feature work started with template
fixes. Templates are now frozen captures (`scripts/build-live-templates.mjs`,
`design-kit/templates/live-templates.json`) and are pixel-checked against the live screenshots
(`npm run check:templates`, ~0–3%). New UI is composed on top of them with the component
library. Hand-built `_pages` remain only where no capture exists. Refresh with the
`live-capture` skill after a release.

## D-006 — Two privacy gates on every logged-in capture
**2026-09-14 · adopted after an incident**

React-controlled form fields restored the account's real name and phone after DOM redaction,
so they appeared in screenshots while the saved HTML was clean. Redaction now sets field values
through the native setter + input event, and `visibleLeaks()` refuses any screenshot whose
rendered text or field values still contain the account name or a non-sample phone. Both
`leaks()` (HTML) and `visibleLeaks()` (screen) must pass. Never remove either.


## D-007 — Gradients and frosted glass are real; the blanket ban was a fabrication
**2026-09-17 · adopted · supersedes the gradient/glassmorphism lines in RULES.md §2**

`RULES.md` claimed gradients were limited to the Featured/Elite/Pro badges, and that
`backdrop-filter` "is not used anywhere in dubizzle". Both were wrong. They were written
before the live-capture pipeline existed, by generalising from three gradient tokens I
happened to recognise in the monorepo, plus a generic anti-AI-slop checklist. Nothing was
measured. `check:design` then enforced the invention as an error, so it actively pushed
generated work *away* from production for weeks.

*Evidence:* swept all 124 local captures for computed `background-image: *gradient*` and
`backdrop-filter != none` on rendered elements (>4px).

- **333 gradient instances, ~30 distinct values, in six roles:** status badges (~100),
  photo scrims `rgba(0,0,0,0)→rgba(0,0,0,.4)` (37), rail edge fades (40), the per-vertical
  "Post your ad" CTA band (~50), the "of the Week" ribbon (14), DPV specs-strip depth (3).
- **The CTA band is tinted per vertical:** home `#f7fafe→#e7f1fd`, motors `#e9eaf7`,
  property `270deg #fef3de→#ffe1e1`, mobiles `#e7f1fd` — all with production's odd
  `79.97%` stop.
- **`backdrop-filter`: exactly one component** — the media-type chip ("Video") over a card
  photo, `blur(4px)` + `rgba(23,25,28,.75)`, radius 4px, 63×22, in 13 captures across both
  verticals and both layouts. Systematic, not a stray.

What survived the correction: **every gradient found does a job.** None is atmosphere — no
mesh, no gradient hero, no gradient button, no gradient text. So the rule is now a *role
allowlist* (RULES.md §1) rather than either a blanket ban or blanket permission, with a
token per role (`--cta-band-*`, `--rail-fade-*`, `--surface-depth`, `--glass-chip-bg/-blur`).
`check:design` allows those tokens and still errors on an inline literal gradient or any
other `backdrop-filter`.

**The general lesson, which matters more than the rule:** a constraint in `RULES.md` that
isn't traceable to a measurement is a liability, because the linter turns it into law.
Every remaining ✗ in §2 should be checkable against the captures. Where one isn't, mark it
as judgement rather than stating it as fact about dubizzle.
