# Live Capture Checklist (SingleFile)

This container **cannot reach dubizzle.com.eg** (network egress is blocked by
policy — verified 403). So capture on your machine and upload the files; I turn
them into clean, tokenized design-system templates. See `docs/DECISIONS.md` D-004.

## How to capture (once)

1. Install the **SingleFile** browser extension (Chrome/Firefox — open source).
2. For each page below, capture it **twice**:
   - **Desktop**: normal window ≥ 1280px wide → SingleFile → save.
   - **Mobile**: open DevTools → device toolbar → set width **390px** → reload → SingleFile → save.
3. Name the file exactly as in the table, and drop it in this folder
   (`design-kit/reference/live/`). Then tell me which ones landed.

> These raw captures are large (4–7 MB) and stay **gitignored** — they're the
> render/measure source, not committed templates. I extract only the slice I need
> from each (never read the whole file), then build the clean tokenized version.

## Tier 1 — essentials (do these first: 10 surfaces × 2 = 20 files)

| Surface | URL | Desktop file | Mobile file |
|---|---|---|---|
| Home | /en/ | `home.desktop.html` | `home.mobile.html` |
| Motors landing | /en/vehicles/cars-for-sale/ (the vertical landing) | `motors.desktop.html` | `motors.mobile.html` |
| Property landing | /en/properties/ | `property.desktop.html` | `property.mobile.html` |
| Cars — listing (base) | /en/vehicles/cars-for-sale/ (results) | `cars-list.desktop.html` | `cars-list.mobile.html` |
| Property — listing (base) | /en/properties/residential-for-sale/ | `property-list.desktop.html` | `property-list.mobile.html` |
| Mobiles — listing (base) | /en/mobile-phones-tablets/mobile-phones/ | `mobiles-list.desktop.html` | `mobiles-list.mobile.html` |
| Car DPV (an ad detail) | any car ad page | `car-dpv.desktop.html` | `car-dpv.mobile.html` |
| Property DPV | any property ad page | `property-dpv.desktop.html` | `property-dpv.mobile.html` |
| Mobile DPV | any phone ad page | `mobile-dpv.desktop.html` | `mobile-dpv.mobile.html` |
| Car finance (the page you linked) | /en/motors/car-finance/ | `car-finance.desktop.html` | `car-finance.mobile.html` |

## Tier 2 — filter states (representative, not exhaustive)

Capture the base listing with ONE filter applied, so I can see how filtered/chip
states render. A few each is enough — not every combination.

| Surface | Example filter | File (desktop / mobile) |
|---|---|---|
| Cars — New only | condition = New | `cars-new.desktop.html` / `.mobile.html` |
| Cars — by make | Make = Toyota | `cars-toyota.desktop.html` / `.mobile.html` |
| Cars — location + price | Cairo + price range | `cars-cairo-price.desktop.html` / `.mobile.html` |
| Property — apartments | type = Apartments | `property-apartments.desktop.html` / `.mobile.html` |
| Property — location | New Cairo | `property-newcairo.desktop.html` / `.mobile.html` |
| Mobiles — by brand | Brand = Apple | `mobiles-apple.desktop.html` / `.mobile.html` |

## What I do with each capture

1. Render it headless, extract the real slice (markup + computed styles + image URLs) for the region — never the whole 4–7 MB file.
2. Rebuild it as a clean, tokenized `_pages/*.html` + any missing `_partials/` / `patterns.css`, with real image references and `var(--token)`s.
3. Record measured values in `docs/REFERENCES.md`; run the quality gates.

**Start with Tier 1.** Upload what you can and tell me which files are in the
folder — I'll process them and produce the clean templates.
