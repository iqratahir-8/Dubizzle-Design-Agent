# Page coverage — what is captured, what is missing

Audited 2026-09-16 by walking the live navigation of both verticals on dubizzle.com.eg and
comparing it with `design-kit/reference/capture-manifest.json`. Status here is about **page
types** (distinct layouts worth a template), not every URL — a listing page repeats for every
category, city and brand, so one capture of each shape is enough.

Status: ✅ captured (all of tier 3 was captured on 2026-09-16 and is now a template)

**Result (first pass):** 18 page types were missing — 10 in Motors, 8 in Property. All were captured on
2026-09-16 (desktop + mobile, 36 captures, 35 faithful on the first run and the last after a
re-capture) and built into templates, so `design-kit/templates/` now covers 43 pages.

**Result (second pass, after the user pointed out what was still missing):** the vertical
landings were captured, but nothing that only exists *after an interaction* was — the header
mega menus, the location dropdown, the search suggestions, the mobile search and location
overlays, the signed-in user menu — and three internal pages linked from the Motors / Property
landings. `scripts/capture-states.mjs` now captures interaction states the same way pages are
captured; all 13 new captures render 0–1.6% off their screenshots.

## Interaction states (`npm run capture:states`)

| State | Where | Template |
|---|---|---|
| Mega menu — Vehicles (subcategory column + Popular Brands panel) | desktop header nav, on hover | ✅ `menu-vehicles` |
| Mega menu — Properties | desktop header nav | ✅ `menu-properties` |
| Mega menu — More Categories | desktop header nav | ✅ `menu-more-categories` |
| Location dropdown (search field, Use current location, governorate list) | desktop header | ✅ `location-dropdown` |
| Keyword search suggestions ("toyota" → per-category rows) | desktop header | ✅ `search-suggestions` |
| Mobile search page — empty | mobile, tapping the search field | ✅ `m-search-overlay` |
| Mobile search page — suggestions | mobile | ✅ `m-search-suggestions` |
| Mobile location page | mobile, tapping the location row | ✅ `m-location-page` |
| User menu (avatar chip → account menu) | desktop header, signed in | ✅ `user-menu` (local) |
| Mobile account page | mobile, Account in the bottom nav | ✅ `m-user-menu` (local) |

The two signed-in states are redacted and stay local, like the other account captures. The mobile
search and location "dropdowns" are full pages on mobile, not overlays — one more mobile/desktop
divergence to design for.

## Internal pages linked from the landings

| Page | URL | Template |
|---|---|---|
| Property agencies directory (filters + agency cards, 1,756 agencies) | `/en/realestate/agencies` | ✅ `property-agencies` |
| Car finance — bank detail | `/en/motors/car-finance/eg-bank/` | ✅ `car-finance-bank` |
| Car comparison — result (two cars side by side) | `/en/motors/new-cars/compare/mg-6-vs-toyota-corolla/` | ✅ `car-comparison-result` |

## The mistake this audit found

The Property link in the live header goes to **`/en/realestate/`** — the vertical landing, the
counterpart of `/en/motors/`: category groups (Apartments, Villas, Vacation homes, Commercial,
Buildings & land) each with type chips and "See all", then compounds by area.

What we captured as "Properties landing" is **`/en/properties/`**, which is the all-property ad
listing — the counterpart of `/en/vehicles/`, not of `/en/motors/`. Both are real pages, so the
capture stays, relabelled "All properties listing"; the vertical landing is now captured as
`realestate` → template `property-landing`. The mobile Property header in the component library
was measured on the listing, so re-check it against the landing before relying on it there.

## Motors

| Page type | URL | Status |
|---|---|---|
| Vertical landing | `/en/motors/` | ✅ `motors` |
| All vehicles listing | `/en/vehicles/` | ✅ `vehicles-all` |
| Cars listing | `/en/vehicles/cars-for-sale/` | ✅ `cars-list` |
| Listing — filtered (New) | `?filter=new_used_eq_1` | ✅ `cars-new` |
| Listing — brand | `/…/cars-for-sale/toyota/` | ✅ `cars-toyota` |
| Listing — brand + model (SEO copy block) | `/…/cars-for-sale/mercedes-benz/model-c180/` | ✅ `cars-model-list` |
| Listing — city + price filter | `/…/cars-for-sale/cairo/?filter=price_between…` | ✅ `cars-cairo-price` |
| Listing — motorcycles | `/en/vehicles/motorcycles-accessories/` | ✅ `motorcycles-list` |
| Listing — trucks & buses | `/en/vehicles/trucks-buses-other-vehicles/` | ✅ `trucks-list` |
| Ad detail — car | `/en/ad/…` | ✅ `car-dpv` |
| Dealer profile | `/en/companies/Smart-Car-6610` | ✅ `seller-page` |
| Car finance | `/en/motors/car-finance/` | ✅ `car-finance` |
| **New Cars catalogue** | `/en/motors/new-cars/` | ✅ `new-cars` |
| **New Cars — brand** | `/en/motors/new-cars/toyota/` | ✅ `new-cars-brand` |
| **New Cars — model** (price range, variants, FAQs) | `/en/motors/new-cars/toyota/corolla/` | ✅ `new-cars-model` |
| **Car comparison tool** | `/en/motors/new-cars/compare/` | ✅ `new-cars-compare` |
| **Electric cars landing** | `/en/motors/electric-cars/` | ✅ `electric-cars` |

Not captured on purpose: the tag shortcuts (`?filter=tags_eq_german-car` …) are the cars listing
with a filter applied; the blog articles (`/best-chinese-suvs-egypt-2026/` …) are a separate
WordPress design, not the product.

## Property

| Page type | URL | Status |
|---|---|---|
| **Vertical landing** | `/en/realestate/` | ✅ `realestate` |
| All properties listing | `/en/properties/` | ✅ `property` (labelled "landing" — see above) |
| Listing — apartments for sale | `/en/properties/apartments-duplex-for-sale/` | ✅ `property-list` |
| Listing — villas for sale | `/en/properties/villas-for-sale/` | ✅ `property-villas` |
| Listing — area | `/…/apartments-duplex-for-sale/new-cairo/` | ✅ `property-newcairo` |
| **Listing — for rent** (rent price/period UI) | `/en/properties/apartments-duplex-for-rent/` | ✅ `property-rent-list` |
| **Listing — commercial** | `/en/properties/commercial-for-sale/` | ✅ `property-commercial-list` |
| **Listing — vacation homes / chalets** | `/en/properties/vacation-homes-for-sale/` | ✅ `property-vacation-list` |
| **Listing — buildings & land** | `/en/properties/buildings-lands-other/` | ✅ `property-land-list` |
| **Compound page** | `/en/properties/mivida-compound/` | ✅ `property-compound` |
| **Area page** (all types in a city) | `/en/properties/new-cairo/` | ✅ `property-area` |
| Ad detail — property for sale | `/en/ad/…` | ✅ `property-dpv` |
| **Ad detail — property for rent** | `/en/ad/…-for-rent-…` | ✅ `property-rent-dpv` |
| **Agency profile** | `/en/companies/gate-real-estate-602` | ✅ `property-agency` |

Property type chips (`?filter=type_eq_3` Penthouse, Studio, Chalet…) are the same listing with a
filter, so they don't need their own capture.

## Other verticals and shared pages

| Page | Status |
|---|---|
| Home | ✅ `home` |
| Mobile phones listing, search by query, mobile ad detail | ✅ `mobiles-list`, `mobiles-apple`, `mobile-dpv` |
| Login dialog, 404 | ✅ `login`, `not-found` |
| Post an ad, upselling, My ads, chats, profile, settings, packages | ✅ (local, redacted captures) |
| Advertise with us (`/en/advertise`) | ⬜ not planned — marketing page, no product UI |
| Sitemap (`/en/sitemap/most-popular`) | ⬜ not planned — link columns only |
| Empty search result state | ⬜ worth capturing later (needs a query with no results) |
| Favourites, saved searches | ⬜ hand-built templates; need logged-in captures |
| Help centre (`/hc/…`) | out of scope — Zendesk, not dubizzle's design |
