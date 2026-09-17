# Live measurements — ad cards & chips

Computed styles measured on frozen snapshots of dubizzle.com.eg (captured 2026-09-14,
`design-kit/reference/live/`). Desktop = 1440 wide, mobile = 390 wide. Colours:
charcoal `#23262a` (--gray-06), secondary text `#464c55`, grey `#919395` (--gray-04),
chip grey `#f0f0f0`, red `#e00000`.

Where these disagree with the monorepo, **these win** (see PROGRESS.md ground rules).

## Grid ad card
Used on: home page rails, landing-page rails, DPV bottom "similar ads" widget.

| Part | Desktop | Mobile |
|---|---|---|
| Card | 320 wide (rail), padding 12, gap 12, radius 8, **no background/border/shadow** | 187 wide, padding 8, gap 8, radius 6 |
| Image | 296×164, radius 4, cover | 171×160, radius 4 |
| Price | 18/700, line-height 21.6, **red #e00000** | same |
| Price note | "Negotiable" 14/700 lh18 #464c55 · or Down Payment chip: padding 4px 8px, radius 6, bg #f0f0f0, 12/700 #464c55 (amount 900) — gap 8 after price, baseline-aligned | chip hidden on narrow cards |
| Price row | margin-bottom 4 | margin-bottom 4 |
| Title | 16/400 lh20, 1 line clamp, padding-right 32 (heart) | 14/400 lh18, 1 line, margin-bottom 4 |
| Heart | 24×24, absolute at body top-right | 20×20 |
| Specs | 14/700 lh21 charcoal, margin 4px 0; property: `Type • 4 beds • 5 baths • 220 m²`; cars: `4000 km • 2025`; separator "•" #919395 margin 0 6 | 12/700 lh18; property type on its own line, specs below (column gap 4) |
| Location / time | column, gap 6, margin-top 4; location 14/400 lh18 #464c55 (ellipsis); time 14/400 #464c55 | 12/400 lh14 #464c55, gap 4, margin-top 6 |

## List ad card
Used on: search listing pages (LPV), property landing results.

### Desktop (960 wide)
| Part | Value |
|---|---|
| Card | flex row, radius 12, shadow `0 0 10px rgba(0,0,0,.04), 0 0 8px rgba(0,0,0,.04), 0 0 8px -2px rgba(0,0,0,.06)`, no border, margin-bottom 8; list gap 16 |
| Highlighted card (top slot) | border 1px `#f08080`, radius 16 |
| Image | 312 wide × card height (255), left, top-left radius 7; slider dots bottom-centre on a gradient `transparent→rgba(0,0,0,.4)` (26 tall); photo count bottom-right: padding 4px 6px, radius 4, bg `rgba(35,38,42,.75)`, 14px icon + 12/700 white |
| Badge | top-left 8/8: "Featured" padding 3px 6px, radius 4, blue gradient `90deg #4d9feb→#1270ec`, 12/600 lh16 white |
| Body | padding 16 (left starts after image), column, gap 2 |
| Price row | margin-top −8, gap 8, baseline; price **24/700 lh36 charcoal**; Down Payment chip padding 4px 8px, radius 4, bg #f0f0f0, 12/400 #464c55 with amount 12/700 |
| Type + specs row | gap 16, centre; type 16/700 lh20; divider "\|" 14 #919395; specs 16/400 lh24, gap 16, each with a 16px icon + 8 gap |
| Title | h2 16/600 lh30, 1 line ellipsis, ~400 wide |
| Heart | 24×24, top-right of body |
| Attribute chips | margin 12px 0, gap 8; chip padding 6px 10px, radius 4, bg #f0f0f0, gap 4, label 14/400 #464c55 + value 14/700 charcoal (inline) |
| Location · time | margin-bottom 8, 16px icon + gap 6; location 16/400 lh20 charcoal; "•"; time 16/400 #464c55 |
| Actions | gap 8; buttons 40 tall, padding 0 16, radius 6, gap 8, 20px icon, label 14/700 charcoal; Call bg `#e7f1fd`, WhatsApp bg `#e8f7e8`; agency logo 120×40 radius 4 bottom-right |

### Mobile (358 wide)
| Part | Value |
|---|---|
| Card | block (stacked), radius 8, bg white, same shadow; highlighted: border 1px `#ba0000` |
| Image | 358×240, top radius 7; dots as desktop; heart 20px **white**, 40×40 hit area top-right; Featured badge top-left 8/8 |
| Body | padding 4px 12px 16px, column, gap 6 |
| Price | h5 18/700 lh27 charcoal, letter-spacing −0.5; right padding 90; Down Payment chip on the next line |
| Type / specs | column gap 4; type 16/700 lh20; specs 14/400 lh21, gap 12, 16px icon + 8 |
| Attribute chips | margin 6px 0, gap 8; chip padding 6px 10px, radius 4, bg #f0f0f0, **stacked** label over value |
| Location row | 14/400 lh18 #464c55, 14px icon + 6; agency logo 90×30, 1px #e0e0e0 border, radius 4, right |
| Actions | padding 0 12 12; full-width buttons 40 tall, radius 6 |

### Car variant (both sizes)
| Part | Desktop | Mobile |
|---|---|---|
| Brand line | `Mercedes-Benz • CLA 200` 14/400 lh21 charcoal, "•" #919395 margin 0 6 | same, gap 8 |
| Title | h2 16/600 lh30 | 14/400 lh18.2, 1 line |
| Attribute chips | **stacked** (label over value) on both sizes, one row, overflow hidden | same, margin 6px 0 |
| Time | after location ("• 17 hours ago") | top-right of the price row, 12/400 lh16 #464c55 |
| Elite badge | padding 3px 6px, radius 4, gradient `90deg #ffe8ad→#e39e00`, **charcoal** 12/600 text, 14px flame icon (status/elite.svg) | same |
| Location icon | outline pin (location/location.svg), 16px desktop / 14px mobile | |

Contact buttons (both cards): 40 tall, radius **6**, label 14/**700**, Call `#e7f1fd` 104 wide, WhatsApp `#e8f7e8` 126 wide.

## Chips (listing pages)

| Chip | Size | Default | Selected |
|---|---|---|---|
| **Quick filter** — brand shortcuts under the header · desktop | 42 tall, padding 0 16, radius 6, gap 8 between | bg `#f6f6f6`, border 1px `#e0e0e0`, 16/400 lh24 `#222` | (not observed; design system uses charcoal border + bold) |
| **Quick filter** · mobile | 37 tall, padding 0 12, radius 6 | bg white, border 1px `#dadbdb`, 14/400 lh21 `#222` | — |
| **Filter bar** (mobile: "Cars for Sale ▾", "Brand and Model ▾") | 32 tall, padding 0 12, radius 6, gap 8; caret 16 | transparent, border 1px `#dadbdb`, 14/400 charcoal | **filter applied:** border 1px charcoal `#23262a`, bg `#f6f6f6`, 14/700 |
| Filters button count badge | padding 2px 6px, radius 10 | bg `#e00000`, 10/400 lh13 white | |
| **Segment** (All / New / Used) — desktop and mobile | 37 tall, min-width 109, padding 0 16, radius 4 | white, border 1px `#dadbdb`, 14/400 lh21 black | **blue:** bg `#e7f1fd`, border `#c4dbfa`, 14/700 `#0f5dc4` |

Token mapping: `#f6f6f6` --gray-00 · `#f0f0f0` --gray-01 · `#e0e0e0` --gray-02 · `#dadbdb` --gray-03 ·
`#919395` --gray-04 · `#464c55` --gray-05 · `#23262a` --gray-06 · `#e7f1fd` --blue-02 · `#c4dbfa` --blue-03 ·
`#0f5dc4` --blue-06 · Featured `#4d9feb→#1270ec` --blue-08→--blue-09 · Elite `#ffe8ad→#e39e00` --yellow-03→--yellow-06.
The monorepo's `--elite-tag-bg` / `--featured-ad-accent-bgcolor` gradients differ from live; components use the live ones.

## Mobile web components (390px)

Measured on the live site while scrolling (header states) and on the snapshots. Components:
`MobileHeader`, `BottomNav`, `SortSaveBar` / `SellFab` / `ListingActions`, `QuickLinks`, `AppBanner`
(kit: `.m-header`, `.m-listing-header`, `.bottom-nav`, `.sort-save`, `.sell-fab`, `.quick-links`, `.app-banner`).
Icons extracted from the live pages into `design-kit/icons/mobile/`.

### Landing header — home and motors (three scroll states)
| | Home | Motors |
|---|---|---|
| Bar | sticky under app banner, bg `#f0f0f0`, padding 16, column gap 12 | fixed, transparent, padding 16 16 12, gap 12 |
| Tiles (Dubizzle / Motors / Property) | 114×59, padding 6px 12px, 1px `#e0e0e0`, radius 6, white, shadow `0 2px 8px rgba(0,0,0,.14)`; active red with white 54×30 logo | 114×58, padding 8px 10px, no border, same shadow; active red; logo 64×42 |
| Tile content | 24px icon over label 14/700 lh21 `#222` | 24px icon over label 14/700 lh18.2 |
| Search | 306×40 button, padding 0 16 0 12, gap 8, 1px `#919395`, radius 6, shadow `0 2px 10px rgba(0,0,0,.1)`, 16px icon, placeholder 14 `#919395` "Search for great finds"; + 44×40 favourites button (white, same shadow, 24px heart) | full-width 42px field, same border; placeholder "Search by Car Model" |
| Location | below the header: red pin 17 + "Egypt" 14/700 + chevron 12, gap 8 | inside the header, 12 under search: red pin 15 + "Egypt" 14/900 + chevron 16 |
| **State 1 full** | tiles with icons + search + location (header 143) | same (169) |
| **State 2 minimized** | tiles 49 tall, icons collapsed, labels only; no location (132) | same (131); logo 64×24 |
| **State 3 search** | tiles collapse, search field only (deep scroll) | tiles collapsed, search field only (70) |

### Listing header — property / search results
108 tall, white, padding 12 16, gap 12, shadow `0 2px 4px rgba(0,0,0,.133)`. Row 1: back 24 + search button
(same as home, placeholder "Properties for Sale & Rent in Egypt (200,000+ ads)"). Row 2: filter button (filter chip,
selected, 16px icon, red count badge) + horizontally scrolling filter chips with carets.

### Bottom navigation
59 tall, white, padding 7 0, shadow `0 -2px 4px rgba(0,0,0,.133)`; 5 columns × 72px, gap 8. Item: 24px icon over
label 12/400 lh18, gap 3; active `#23262a`, inactive `#919395`. Items: Home, Chat, **Sell** (44px red circle with
white ring + plus, raised 13px, label 12 `#464c55`), My Ads, Account.

### Sort | Save + Sell (listing pages)
Fixed bottom container, column gap 10. Sell FAB 56×56 circle `#e00000`, "Sell" 16/700 white, right 16. Bar 156×42,
1px `#e0e0e0`, radius 6, white, shadow `0 4px 12px rgba(0,0,0,.22)`; actions padding 8px 12px, gap 4, 20px icon +
14/700 lh21; divider 1×16 `#e0e0e0`.

### Quick links (home "Explore Egypt's Largest Marketplace")
Title 20/700 lh27, padding 16 16 0. Grid padding 16 0, two rows, horizontal scroll, row gap 12, columns 80. Tile:
64×64, radius 6, bg `#f6f6f6`, 32px icon; label 14/400 lh18.2, max 2 lines, 8 below. Motors tab row: gap 30,
padding 14 0, 14px lh14; active 700 charcoal + 2px red underline; inactive 500 `#626465` (→ `--gray-05`).

### App banner
75 tall, white, padding 10 12, gap 10. Close 15; app icon 45×45 box, 1px `#e5e5e5`, radius 10; title 14/700 lh16.8
`#17191c`; badges (4.5 ★, 10M+ ↓) padding 4 6, radius 999, bg `rgba(231,241,253,.6)` (→ `--blue-01`), 14/400;
"Get App" 32 tall, padding 0 16, radius 999, `#2f6fed` (→ `--blue-09`), 14/700 white.

New tokens: `--shadow-tile`, `--shadow-search`, `--shadow-bottom-nav`, `--shadow-sticky-header`, `--shadow-floating`,
`--weight-medium`, `--radius-app-icon`.

### Discover Listings tabs (home)
Equal-width tabs, padding 12, column gap 6. Active: 2px `#e00000` bottom border; inactive: 1px `#e0e0e0`.
Head row centred, gap 6: label 14/700 lh21 charcoal + optional badge (padding 2px 4px, radius 4, red, 10/600 lh13
white). Subtitle 12/400 lh18 `#464c55`, centred.

### "Get more in the app" band (home, motors)
Padding 12 16, column gap 12, background `linear-gradient(270deg,#ffedea -0.93%,#fefbf5 50.98%)`
(`--app-promo-gradient`). Row gap 12: image 140×92 radius 8; text column gap 8 — title 16/700 lh20, bullets gap 8,
each bullet gap 6 with a 14px circle `#fbe0e0` holding an 8px tick + 12/400 lh16 text. CTA full width, 32 tall,
padding 10 16, radius 4, red, 12/600 lh18 white.

### Popular Searches (home)
Heading 18/700, padding 0 16. Groups gap 16, padding 0 16, each with a 1px `#e0e0e0` bottom border and clipped to
~5 links (168 tall). Group title 14/700 lh21; links gap 12, 14/400 lh18 `#222`; "View more" bottom-right,
14/700 `#e00000` + 10px chevron.

### Mobile footer
Accordion rows 57 tall, padding 16, 1px `rgba(0,47,52,.2)` (`--border-subtle`) top border, label 16/400 lh24,
15px chevron. "Follow us" row 81 tall with five 40px social icons (gap 8). App badges row: padding 16, 2px top
border, three 84×28 badges centred. Copyright bar: padding 16 0, background `#e0e0e0`, 12/400 black centred,
tagline 12/700. Footer padding-bottom 60 for the bottom nav.

### Featured Businesses scroller (motors, listings)
Title 18/700 lh23.4. Scroller gap 12, items 132 wide, column gap 8: logo box 43 tall, 1px `#e0e0e0`, radius 6,
white; name 14/400 lh16.8.

### "Prime Dealers First" row (cars listing)
Row 57 tall, padding 12 16, 1px `#e0e0e0` bottom border, white. Left: 32px crown + label 16/700 lh20.
Switch **39×20** (smaller than the form Toggle), radius pill, off `#919395`, knob 16 white with
`--shadow-control`.

### "Explore dubizzle Motors" tiles (motors)
Title 18/700 lh21.6. Two columns, gap 12; tile 100 tall, padding 10, radius 8, background `#f6f6f6`; label
14/700 lh16.8; badge padding 4 8, radius pill, red, 10/700 white; illustration ~105×73 anchored bottom-right.

### App banner — compact (scrolled)
42 tall, padding 6 12, 1px `#e5e5e5` top and bottom borders; icon box 28 with `--app-icon-gradient`
(white → `#ffedea`), 22px icon; title only; CTA 28 tall.

Added tokens: `--app-promo-gradient`, `--app-icon-gradient`.

### Ad detail gallery (mobile DPV)
Photo full-bleed 390×294 (aspect 390/294), `object-fit: cover`, no radius. Back disc 32 at top 12 / start 16,
background `#f0f0f0`. Next disc 48 on the end edge (inset 10), vertically centred, `rgba(0,0,0,.2)`.
Photo counter bottom 12 / end 16: padding 4 8, radius 4, `rgba(0,0,0,.75)`, 12/700 lh18 white, 12px camera icon,
gap 4. Dot pager bottom 16, centred, 8px gaps: **active 8×8 white, neighbours 6×6, everything further 4×4**
`rgba(255,255,255,.4)` — the dots shrink with distance, they are not all one size.

### "Car / Property of the Week" ribbon
Bottom-left of the gallery photo (start 8 / bottom 8) and on the listing card. Padding 2 6, radius 4,
`linear-gradient(92.05deg, #e00000 64.95%, #ba0000 121.09%)`, 12/700 lh18 white, 12px star, gap 4.

### Sticky contact bar (mobile DPV)
`position: fixed; bottom: 0; z-index: 2`, white, 1px `#e0e0e0` top border, 65 tall. Row padding 12 16, gap 8.
Buttons 40 tall, radius 6, 14/700: Call `#e7f1fd` **152** wide, WhatsApp `#e8f7e8` **198** wide at 390 — they
keep their content width and split the leftover space evenly (`flex: auto`), so the two are not equal halves.

Added tokens: `--overlay-counter`, `--overlay-arrow`, `--dot-idle`, `--week-gradient`.

### Note — the home "hero carousel"
The home promo banner is a single full-bleed slot: 390×150 on mobile (no radius), 1280×180 with a 4px radius on
desktop, inside a `react-swipeable-views` track. **It has no dots of its own** — the dots visible in screenshots
are printed in the advertiser's artwork. Don't build a pager for it.

### Header mega menu (desktop)
The strip is the header's third row: full-width white over a 1px `#e0e0e0` top border, items spread
across the 1280 container (`justify-content: space-between`), first flush with its start edge and
last with its end. Strip item 48 tall, padding 0 12, 14/600. **The open item is marked by `box-shadow: inset 0 -4px 0 #222`,
not a border** — and it is a `:hover` style, so it vanishes from a frozen capture unless the capture
persists it (`capture-states.mjs` copies the hovered chain's styles inline and stamps
`<meta name="live-state">`).

Panel hangs from the bottom of the strip, 732×404 = a 302 column + a 430 panel:
- Column: white, padding-block 12. Item 32 tall (33 with a subtitle), padding 8/12/8/20, label 14/16.1,
  chevron 10. Active item: background `#f0f0f0`, label `#0f5dc4` (`--blue-06`) at 700. Subtitle line
  12–14 grey, ellipsised.
- The panel is rendered **inside the hovered subcategory's row** and positioned beside the column,
  not as a sibling of it — worth knowing when reading the markup or scripting against it.
- Panel: background `#f6f6f6`, 1px `#e0e0e0` inline-start border, padding 16. Head: title 18/20.7 bold,
  "See All" 14 bold `#e00000`, 12 bottom padding over a 1px `#e0e0e0` rule. Links 14/24 `#222`, two
  columns for brand lists, one column with chevrons for category lists.

All seven menus and their panels are in `design-kit/content/mega-menus.json` (7 categories,
67 subcategories, 201 links). Jobs has a column and no panels; More Categories is the only menu
whose rows carry a subtitle line.

### Desktop header (checked 2026-09-17)
Band 68 tall on `#f6f6f6` — 14 above and below the 40px Post Your Ad button. Vertical links
(Motors, Property) are 130×35 anchors **bottom-aligned** in the band, label 16/700, so the active
tab flares straight into the white row. Post Your Ad 130×40, radius 6, label 14/700 white.
"Login or Signup" is 14/400 (not bold), language link 14/400. Search row: location field 303×48
radius 6 with a 1px `#919395` border; search field 850×48 radius `6 0 0 6`; Search button 111×48
`#23262a`, radius `0 6 6 0`, label **17/500** — the only 17px in the header. Category strip: see
the mega menu entry above.

### Vertical landing sub-nav (Motors)
A `<ul>` across the 1280 container, items 48 apart, each 49 tall with 12 padding-block and a
16/24/600 label; the current page is `#e00000`, the rest `#23262a`. "NEW" pill: 42×19, 11/11/700
white on `#e00000`, pill radius, padding 4 8, 6 from the label. On these pages the sub-nav replaces
the header's search row.

### Header location dropdown
Panel 303 wide (max 450 tall, scrolls), radius 4, padding-top 16, on `--shadow-overlay`
(`0 0 6px rgba(0,0,0,.12), 0 6px 6px rgba(0,0,0,.24)` — the shadow live gives header overlays).
Its own search field 271×48, radius 6, 1px `#e0e0e0`, text 16 with 12 of start padding.
"Use current location" 16/700 `#3a88ef` with a 26px target icon, padding 16. "Choose location"
14/700 `#919395`, padding 8 16 0. Rows 41 tall, padding 10 16, label 14/21; "See ads in all Egypt"
is the same row in `#e00000`; governorate rows carry a chevron.

### Header search suggestions
Panel as wide as the search field (850 at 1440; 961 when the field is wider), radius 4, the same
`--shadow-overlay`. Rows 61 tall, padding 8 16: query 16/24 over category 14/20 `#464c55`, with a
20px open-in-new arrow at the end. The row under the pointer sits on `#f0f0f0`.

### Mobile search page
Search on mobile is a page, not a dropdown. Header 390×75: padding 10 12, gap 10, white, 1px
`#e5e5e5` bottom border, 15×19 back chevron, field 326×40 radius 6 with a 1px `#e0e0e0` border and
a magnifier. Suggestion rows 61 tall inside a list inset 16: query in `<em>` 16/23 bold over the
category 14/20 `#464c55`, a 15px open-in-new arrow at the end, 1px `#e0e0e0` between rows. The row
under the finger is `#f0f0f0` **full-bleed**, while its content stays inset.

### Mobile location page
Page padding 16 16 0 with 80 of bottom clearance for the sticky bar. Title row 30 tall, gap 8:
close icon then the title 16/30/700. Field 358×40 (radius 6, 1px `#e0e0e0`), 29 below the title.
"Use current location" 16/700 `#3a88ef` with a 20px arrow, padding-block 23. Section titles
("Popular locations", "Choose region") 16/24/700, padding-block 12. Rows: padding 8 0 16, 1px
`#e0e0e0` bottom border, label 14/21; region rows carry a 20px chevron, popular ones don't.
Sticky bar: padding 16, 1px `#e0e0e0` top border, white, with a full-width 40px red button,
label 16/700 ("Select Egypt").

### Account menu (desktop dropdown)
Panel 340 wide, radius 12, on `--shadow-menu` (`0 4px 10px rgba(0,0,0,.1)`). **The panel is grey
(`#f0f0f0`) and the groups are white** — the 4px gaps between groups are the dividers, there is no
border. Header: 56px avatar, 14 gap, name 18/24/700 over "Get Verified Now" 14/21 `#3a88ef` with a
chevron, padding 16. Packages banner: inset 16, padding 12, radius 6, `--blue-02`, title 16/20/700
over a 12/16 subtitle, chevron at the end. Rows 57 tall, padding-inline 20, 20px icon then a 26 gap,
label 16/24.

### Account page (mobile)
Page padding 16. Head: 72px avatar (1px `--red-02` ring) + name 20/28/700. Verify and packages
banners: full width, padding 12, radius 6, `--blue-02`, 12 above each. Favourites is a **bordered
white card**, 83 tall, icon over a 14/700 label. Rows: padding-block 16, 1px `#e0e0e0` between,
24px icon, title 16/24/700 over subtitle 14/21, chevron at the end.

Both were measured on redacted captures, so the name in the stories and the kit is a placeholder.

### Listing page head (desktop)
- **Breadcrumbs:** a `<ul>` with 8 of bottom padding; crumbs 14/21 in `rgba(35,38,42,.64)`
  (`--text-muted`), separated by a slash with 4 either side; the current page is full charcoal.
- **Title row:** H1 24/26.3/700 with the ad count 16 to its right — the count sits on a pale red
  pill (`--red-02`), padding 2 7, radius 4, 14/21/700 charcoal. Not a grey pill.
- **Save Search:** 140×45, padding 10 12, radius 6, white with a 1px `#e0e0e0` border, label 16/700
  — the secondary button.
- **Sort:** a text button, "Sort by:" 14/21 then the value 16/22, 4 apart, with a 24px chevron.

### Signed-in header extras
Notifications · Favourites · Chats · My Ads sit **32 apart** (not 24), each an icon over a 14/18
label in `#464c55`; then the 40px avatar and the name at 15/18/700. Live labels the third one
"Chats", plural.

## Gradients and frosted glass (measured across 124 captures, 2026-09-17)

Swept every local capture for computed `background-image: *gradient*` and
`backdrop-filter != none` on rendered elements. 333 gradient instances, 13 glass.
See `docs/DECISIONS.md` D-007. Tokens in `RULES.md` §1.

| Role | Value | Token |
|---|---|---|
| Featured badge | `linear-gradient(90deg, #4d9feb, #1270ec)` | `--featured-gradient` |
| Elite badge | `linear-gradient(90deg, #ffe8ad, #e39e00)` | `--elite-gradient` |
| Pro badge | `linear-gradient(270deg, #e00000, #17191c)` | `--pro-gradient` |
| "of the Week" ribbon | `linear-gradient(92.05deg, #e00000 64.95%, #ba0000 121.09%)` · 115×22 | `--week-gradient` |
| Photo scrim | `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.4))` | `--overlay-image-fade` |
| Rail edge fade | `to right/left, #f0f0f0 -7.33%, #f0f0f0 25.45%, transparent 73.44%` · 80×140 | `--rail-fade-end` / `--rail-fade-start` |
| CTA band — home | `#f7fafe 0 → #e7f1fd 79.97%` · 960×130 | `--cta-band-home` |
| CTA band — motors | `#e9eaf7 0 → #e9eaf7 79.97%` (flat) | `--cta-band-motors` |
| CTA band — property | `270deg, #fef3de 0 → #ffe1e1 79.97%` | `--cta-band-property` |
| CTA band — mobiles | `#e7f1fd 0 → #e7f1fd 79.97%` (flat) | `--cta-band-mobiles` |
| DPV specs strip | `linear-gradient(#f6f6f6, #f0f0f0)` · 826×78 | `--surface-depth` |
| Media chip ("Video") | `backdrop-filter: blur(4px)` + `rgba(23,25,28,.75)`, radius 4px · 63×22 | `--glass-chip-blur` + `--glass-chip-bg` |

The CTA band's `79.97%` stop is production's own value — don't round it to 80%.

The media chip is the **only** `backdrop-filter` in the product. It appears in
`cars-list`, `cars-new`, `cars-toyota`, `motors`, `property-area`, `property-list`,
`property-newcairo`, `property-rent-list` — both layouts.
