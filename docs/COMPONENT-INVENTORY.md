# Component inventory — from the captured pages

The user asked (2026-09-14) that **every reusable component found in the captured/exported pages is stored in the
component library** (React `src/components` + kit `patterns.css`, measured on live, parity-checked). This is the
working list. Work top-down; when one is done: measure (see `live-capture` skill), build both sides, add stories +
`check:parity` pairs, record values in `docs/LIVE-MEASUREMENTS.md`, tick it here, commit, update PROGRESS.md.

Status: ✅ done (live-measured, React + kit, parity) · 🟡 exists but not live-verified · ⬜ to do

## Done
- ✅ Grid ad card — `AdCard` desktop + mobile (home/landing rails, DPV similar ads)
- ✅ List ad card — `AdListCard` desktop + mobile, property + car, highlighted
- ✅ Chips — `Chip` quick / filter / segment
- ✅ Contact buttons — `ContactButton` (radius + weight from live)
- ✅ Mobile header — `MobileHeader` home + motors (full / minimized / search), property listing header
- ✅ Bottom navigation — `BottomNav`
- ✅ Sort | Save bar + Sell FAB — `SortSaveBar`, `SellFab`, `ListingActions`
- ✅ Category quick links — `QuickLinks` (+ motors tab row)
- ✅ App smart banner — `AppBanner` (full + compact/scrolled)
- ✅ Discover Listings tabs — `DiscoverTabs`
- ✅ "Get more in the app" band — `AppPromoCard`
- ✅ Popular Searches — `PopularSearches`
- ✅ Mobile footer — `MobileFooter`
- ✅ Featured Businesses scroller — `FeaturedBusinesses`
- ✅ Prime Dealers First row — `PrimeDealersRow`
- ✅ Explore dubizzle Motors tiles — `ExploreTiles`
- ✅ Ad detail gallery (photo, back/next, counter, shrinking dot pager) — `AdGallery`
- ✅ "Car / Property of the Week" ribbon — `WeekRibbon`
- ✅ Sticky contact bar (ad detail) — `ContactBar` (+ `ContactButton` `grow`)

## Exists, needs live verification
- 🟡 `Header` (desktop) — live has 3 rows: top bar (logo tab, Motors/Property, العربية, Login or Signup / user centre, Post Your Ad), search row (location select + search + Search button), category nav strip
- 🟡 `Footer` (desktop) — About/Dubizzle/Countries/Follow us columns, app badges; plus the "Download the app" band above it
- 🟡 `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Pagination`, `Pill` — parity OK, live values partly verified (2026-09-12)

## To do — mobile

- ⬜ DPV mobile: price/title block (share icon, down-payment pill), 4-column specs strip, details table,
  seller card, "View in app" CTA
- ⬜ DPV sticky section tabs (Highlights · Details · Description · Posted by), pinned under the header on scroll
- ⬜ Home promo banner slot — `PromoBanner` (390×150 mobile / 1280×180 desktop; no dots, see
  `docs/LIVE-MEASUREMENTS.md`)

## To do — navigation and search (from the interaction-state captures)
- ⬜ Header mega menu — subcategory column with chevrons + right panel ("Popular Brands" / links, "See All")
- ⬜ Header location dropdown — search field, "Use current location", governorate rows with chevrons
- ⬜ Header search suggestions — query + category rows with the open-in-new arrow
- ⬜ Mobile search page — back + field, suggestion rows (full page on mobile, not a dropdown)
- ⬜ Mobile location page
- ⬜ User menu (desktop dropdown) and mobile account page — avatar chip, "Get Verified Now", packages
  banner, menu rows; the signed-in header also carries Notifications / Favourites / Chats / My Ads

## To do — desktop
- ⬜ Breadcrumbs
- ⬜ Page title + ad count pill + Save Search button — listings
- ⬜ Filter rail: Categories tree with counts, Location, Brand & Model, Price range — listings
- ⬜ Sort by dropdown + Prime Dealers First checkbox row — listings
- ⬜ Featured Businesses strip (with arrow) — listings
- ⬜ Home category directory (12 categories × 4 links + "All in …") and hero banner
- ⬜ Section rail header ("Cars for Sale" + "View More") — home
- ⬜ Popular searches / SEO link columns with "View more"
- ⬜ "Join us in building a safer community… Verify now" sticky bottom banner
- ⬜ DPV: gallery, price/title box, seller card, details table, description, location, safety tips
- ⬜ Seller / business profile header (logo, Verified Business, published ads, Share agency profile)
- ⬜ Login dialog (Login with Phone / Email / Google / Facebook)
- ⬜ 404 page

## To do — account and flows (local captures)
- ⬜ Post an Ad: category grid + two-panel category list; attribute form rows (inputs, pickers, New/Used segment,
  payment option chips, extra-features chips, contact method); image uploader; "Need help getting started" card
- ⬜ Upselling: package option cards (checkbox, discount badge, strike price), bundle tabs, cart bar
- ⬜ My Ads: ad management row (status pill, views/phone/chats stats, Remove / Republish), status filter pills
- ⬜ Chats: inbox row, Buying / Selling tabs
- ⬜ Settings: notification/privacy toggle rows; Edit profile form
