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
