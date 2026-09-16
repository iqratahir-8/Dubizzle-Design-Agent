# Component Audit — Design System vs. Product Code

Audit of the components in the actual product monorepo (`dubizzle-maple`,
package roots `strat → horizontal → dubizzle-facelift → dubizzle-eg`) against
what this design system currently models. Focus is on the **`dubizzle-facelift`**
layer, which carries the newest components.

## Summary

| | Count |
|---|---|
| Components this design system models (`src/components/`) | **14** + 3 page templates |
| Shared primitives in the product (`strat/components`) | ~43 |
| Component files in `horizontal` | ~242 |
| Component files in **`dubizzle-facelift`** (latest layer) | **~300** |

The 14 modeled components cover the **shared primitives** reasonably, but the
product's real surface — the ad-card systems, the search filter system, dialogs,
toasts, loading/skeletons, the category switcher, the location system, galleries
— is almost entirely unmodeled. The single biggest fidelity gap is the **ad
card**, which this system models as one component but the product implements as
**two systems** (a dedicated `strat` property card, and a shared classifieds card
that branches hero/normal by category). On the price colour: the code snapshot
says red but live production renders charcoal, which this design system matches
(see §3).

## Sources & method

- Read `strat/strat/components/` (the shared UI primitives), plus the
  `components/`, `adCard/`, `contact/`, `search/`, `header/`, `navigation/`
  trees under `dubizzle-facelift/dubizzle-facelift/`.
- Cross-referenced against `src/index.ts` exports.
- Price-colour tokens read from `horizontal/.../branding/styles/variables.css`
  and the `adCard` `.cssm` styles.

## 1. What the design system models today

`Button, Input, Select, Checkbox, Radio, Toggle, Chip, Pill, ContactButton,
AdCard, Tabs, Pagination, Header, Footer` + `HomePage / SearchPage / AdDetailPage`
templates.

> Since this audit: the mobile components were added (see `docs/COMPONENT-INVENTORY.md`),
> and the three React page templates were removed — page templates are now the frozen live
> captures in `design-kit/templates/`, which Storybook frames under **Templates/Pages**.

## 2. Coverage matrix (design system ↔ product)

| DS component | Product location | Status |
|---|---|---|
| Button | `strat/components/button.tsx` (+ `buttonsGroup`, `roundedButtonChoice`, `squareishButtonChoice`) | ✅ modeled; product has more choice variants |
| Input | `strat/components/input.tsx` (+ `inputContainer`, `inputMessage`, `otpInput`, `passwordInput`, `limitedTextarea`, `dateRangeInput`) | 🟡 base only; product has a full input family |
| Select | `strat/components/select.tsx` | ✅ |
| Checkbox | `strat/components/checkbox.tsx` | ✅ |
| Radio | `strat/components/radioGroup.tsx`, `circleRadioButtonsGroup.tsx` | ✅ |
| Toggle | `strat/components/toggle.tsx` | ✅ |
| Pill | `strat/components/pill.tsx` | ✅ |
| Chip | `facelift/components/chip.tsx`, `facelift/search/filters/filtersPreview/*Chip.tsx` | 🟡 product has typed filter chips (price/year/mileage/range/makeModel) |
| ContactButton | `facelift/contact/**` — `chatCTA`, `phoneCTA`, `whatsAppCTA`, `smsCTA`, `buyWithDeliveryCTA`, separate `adSearch/` vs `adDetails/` sets | 🟡 modeled as one; product is a CTA system with per-surface variants |
| Tabs | `strat/generic/tabSwitcher.tsx`, `strat/search/miniForm/tabs/` | ✅ (different impl) |
| Pagination | `strat/searchComponents/pagination/**` | ✅ |
| Header | `facelift/header/**` — `header`, `compact/header`, `headerWithVerticals`, `headerLinks` | 🟡 simplified vs product |
| Footer | `strat/navigation/footer.tsx`, `compactFooter.tsx` | 🟡 simplified vs product |
| **AdCard** | classifieds: `facelift/adCard/**`; property: `strat/listing/**` (see §3) | 🔴 modeled as **one** component; product is **two systems** + a category branch |

## 3. The ad-card system in the product (the reality)

There are **two independent card systems**, split by product line — not one card
per vertical:

**A. `strat/` — a dedicated property card** (Bayut / Zameen): `listing/listing.tsx`
→ `defaultListing.tsx` → `listingDetails.tsx` (+ `listingPrice.tsx`,
`compact/compactCardListing.tsx`, `listingCardMinimalist.tsx`). Field order:
photo overlays → price → specs (rooms/baths/area) → agency → title → location →
verification/down-payment tags → contact buttons → agency logo.

**B. `horizontal` + `dubizzle-facelift` + `dubizzle-eg` — one shared classifieds
`AdCard`** that **branches by category at runtime**, not by separate files.
`horizontal/adCard/adCard.tsx` + `useShowHeroCategoryAdCardDesign.ts` dispatch:

- **Hero-category card** (`adCardForHeroCategory.tsx`) → **cars, property, jobs**.
- **Normal-category card** (`adCardForNormalCategory.tsx`) → **goods / general** (the fallback).
- A feature-flagged **`adCardRefactor/`** (`gridLayout` / `listLayout` / `heroCard` / `jobsCard`) re-implementing the same split, gated by `CONFIG.build.STRAT_ENABLE_REFACTORED_AD_CARD`.

`dubizzle-eg` ships almost **no card code of its own** — only hooks; the real EG
cards are facelift's, resolved via `@app` (`dubizzle-eg` variables `@import`
facelift's). So **facelift is the source of truth for the EG card.**

**The per-vertical difference lives in subtitle atoms**, keyed by
`AdCardSubtitleCategories` (VEHICLES / PROPERTIES / JOBS / …):

- `ad/adCarSubtitle.tsx` — `mileage` (or `NEW`) • `year`. Two fields only.
- `ad/adPropertySubtitle.tsx` — a property-**type** tag (inline on desktop) + `beds • baths • area`.
- `ad/adJobSubtitle.tsx` — job extra fields.

Each spec is a `BasicTag` separated by `•` (`horizontal/adCard/tags`).

### Price colour — the code snapshot and live production disagree

The exact discrepancy is **code vs. live**, not a per-view split:

| Source | Main ad price | Evidence |
|---|---|---|
| Product **source code** (this maple clone) | **RED `#e00000`** | `.priceLabel { color: $adCardPriceColor }` (`horizontal/adCard/styles/adCard.cssm:60`) → `$adCardPriceColor: $primaryColor` → `$primaryColor: $red05` → `$red05: #e00000` (`dubizzle-facelift/branding/styles/variables.css:85,49,11`). Grid view inlines the same rule (`gridViewStyles.cssm:122-124`), so it is red too. |
| **Live dubizzle.com.eg** (saved pages, measured) | **CHARCOAL `#23262a`** | computed `rgb(35,38,42)`, 24px/700, on both motors + properties main prices |
| This **design system** | **CHARCOAL `#23262a`** | matches live |

Notes:
- The `$gray06` (charcoal) in `gridViewStyles.cssm:127` is on **`.downpaymentPriceLabel`** (the secondary / down-payment price, `rgb(70,76,85)` at 12px on the live pages), **not** the main `.priceLabel`. The main price is red in code for both grid and list.
- The **strat property card** price is charcoal by a different path — no colour on `.price`, inherits the card link colour `$neutralColor → $black → #222222`.

**Conclusion:** the code default is red, but live production renders the main
price **charcoal** — so this maple clone is **behind production** on the price
token (consistent with the handoff's warning that the snapshot lags prod). This
design system's charcoal price is therefore **correct for what ships** on the
cars/property vertical pages. The only surface still **unverified** is the
**goods / normal-category** card (no saved live goods page); the code says red
there too, so confirm it against a live goods page before assuming charcoal.

## 4. Facelift layer (latest) — largest unmodeled areas

Component files by area under `dubizzle-facelift`, highest first:

| Area | Files | In DS? |
|---|---|---|
| `search/` (filters, location, sorting, results, quickFilters, freeText) | 94 | 🔴 none (kit has only a static filter rail) |
| `adDetails/` (gallery, sections, seller, features) | 53 | 🟡 only a static template |
| `verticals/` (properties-heavy: searchBox widgets, promotedAds, featuredAgencies) | 38 | 🔴 none |
| `adCard/` | 32 | 🔴 one flattened component |
| `user/` (dropdown, menu links, dialogs) | 30 | 🔴 none |
| `categorySwitcher/` (`splitCategoriesDropdown` mega-menu) | 21 | 🔴 none |
| `contact/` (CTA system) | 19 | 🟡 one `ContactButton` |
| `components/` (`chip`, `toast`, `dialogWithHeader`, `featureIcon`, `listEntry`, `options`, `verifiedBadge`, `filtersButton`, `iconWithBg`, `compactHeader`) | 15 | 🟡 `chip` only |
| `header/` | 11 | 🟡 one `Header` |
| `navigation/` (`bottomBar`, `bottomBarLink`) | 9 | 🟡 static pattern only |
| `ad/` (per-vertical subtitles, installments/price labels) | 8 | 🔴 none |
| `branding/` (`eliteTag`, `eliteStrip`, `chatIcon`) | 5 | 🟡 `elite-tag` CSS only |

Foundational primitives present in `strat/components` but **not** modeled at all:
**layout** (`box`, `flex`, `container`, `group`, `section`), **typography**
(`text`), **dialogs** (`dialog`, `dialogWithHeader`, `floatingDialog`),
**loading** (`loadingSpinner`, `loadingDots`, `loadingAnimation`), **messageBox**,
**counter**, and auth inputs (`otpInput`, `passwordInput`, `passwordVisibilityToggle`).

## 5. Fidelity issues found

1. **Ad card is two systems, not one component.** A dedicated `strat` property card, and a shared classifieds `AdCard` that branches by category (hero: cars/property/jobs; normal: goods) at runtime. Model it as: classifieds base shell + hero/normal branch + per-vertical subtitle, and treat the strat property card separately.
2. **Price colour: code says red, live says charcoal** (see §3). Measured on the saved production pages, the main price is charcoal `#23262a` — this design system matches live. The maple clone's red token is behind production. Only the goods/normal-category card is unverified (no live goods page).
3. **Cars spec row is over-specified.** Product `AdCarSubtitle` shows only `mileage • year`; this system's card showed `year · km · transmission · fuel` (four fields).
4. **Property lead is close but not exact.** Product uses a property-**type** tag (inline on desktop) alongside `beds • baths • area`; this system leads the specs line with a bold type token.
5. **"Of the Week / Day" are real components,** not a ribbon: `search/results/adOfTheWeek`, `adCard/compact/carOfTheDayStrip`, `adCard/compact/adOfTheDayCard`.
6. **Contact CTAs differ by product line, surface and channel.** Strat property: **Email → Call → WhatsApp** (`listingContactButtons.tsx`). Classifieds: **Call → Chat → WhatsApp** (`contact/adSearch/{phoneCTA,chatCTA,whatsAppCTA}`), plus `buyWithDeliveryCTA` when delivery-eligible and `QuickApplyButton` for jobs. The single `ContactButton` collapses all of this.

## 6. Recommendations (prioritized)

1. **Price colour is effectively resolved** (§3): live production renders the main price charcoal `#23262a`, which this design system matches; the code's red token is a stale snapshot. Remaining action is small — verify the **goods / normal-category** card against a live goods page (code says red there too), then record charcoal as the confirmed token.
2. **Re-model the ad card to match the product** — a classifieds base shell + `hero`/`normal` category branch + per-vertical subtitle (`car` / `property` / `job` / `goods`), and a separate property card for the strat/Bayut-style layout. Correct the cars subtitle to `mileage • year`.
3. **Add the foundational primitives the product is built on** and the DS lacks: layout (`Box`/`Flex`/`Container`/`Section`/`Text`), `Dialog` + mobile `BottomSheet`, `Toast`, `Loading`/`Skeleton`, `Badge`/`Tag` (elite, featured, verified).
4. **Decide whether search is in scope.** It's the single largest area (94 files); today the kit has only a static filter rail. If yes, prioritize `range`/`rangeSlider`, `priceFilter`, `multipleChoice`/`singleChoice`, `hierarchical`, `selectedFilters`, and the `filtersPreview` chip family.
5. **Pin the extraction to the facelift layer.** `dubizzle-eg` ships almost no card code of its own and resolves facelift's via `@app`, so facelift is the EG source of truth. Re-run the sync against it and record which layer each token/component came from.
6. **Expand the input family** (`otpInput`, `passwordInput`, `dateRangeInput`, `limitedTextarea`) and the **category switcher** (`splitCategoriesDropdown`) if the design system is meant to cover full flows, not just primitives.

---

_This audit reflects a shallow clone of `dubizzle-maple-master-copy` at the time
of writing; counts are file counts, not deduplicated component counts._
