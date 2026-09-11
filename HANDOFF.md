# Handoff

State of this repo and what to do next. Read this first if you're picking it up in a new session or on another account.

## How to resume

The whole design system lives in this folder and is committed to git (no remote yet). To continue:

1. Copy or move `/Users/iqratahir/Dubizzle-Design-System` to the new machine/account.
2. `npm install`
3. Point `design-sync.config.json` → `monorepoPath` at wherever the `dubizzle-maple-master` monorepo lives there.
4. `npm run kit` → http://localhost:4321 (the visual design system)
5. Paste this file into the new session so it has the context below.

Nothing depends on the previous session — everything is on disk.

## Commands

| Command | Does |
|---|---|
| `npm run kit` | Serve the design kit at :4321 — this is the main deliverable |
| `npm run dev` | Storybook (React library) at :6006 |
| `npm run sync` | Re-extract tokens + icons from the monorepo, rebuild templates and preview |
| `npm run build:templates` | Rebuild the 23 static templates from `_partials/` + `_pages/` |
| `npm run build:preview` | Rebuild `design-kit/index.html` |
| `npm run check:all` | Design-adherence linter across kit + components |

## What's done

- **Token pipeline** (`scripts/sync-tokens.mjs`) — resolves the `strat → horizontal → facelift → eg` `@import` chain into 1,269 tokens plus a stable semantic API. Fails loudly on upstream renames.
- **Icon pipeline** (`scripts/sync-icons.mjs`) — 587 icons, 13 categories, resolved by package precedence. Repairs missing `xmlns`, flags `<symbol>`-only files.
- **`RULES.md` + `scripts/check-design.mjs`** — the anti-slop constraints and their enforcement. Allowlist derived from generated tokens so it can't drift.
- **23 static templates** built from shared partials (`design-kit/templates/_partials/` + `_pages/`).
- **`design-kit/index.html`** — the browsable visual design system (generated).
- **React library** — 14 components + 3 page templates, sharing the same generated tokens.
- **Live reference pages** saved in `design-kit/reference/live/` (home, motors, properties).

## THE OPEN ISSUE — templates vs. live site

The user compared the templates against the real dubizzle.com.eg and they did not match. The templates were originally built from the monorepo source, which is **behind production**. Three saved live pages are now in `design-kit/reference/live/` as ground truth. Serve them via `npm run kit` and open `/reference/live/home.html` etc.

### Corrected so far

- **Header** (`_partials/header-desktop.html`) — added the missing third row: the category nav strip (Vehicles … More Categories, 7.3rem tall, white). Replaced "Login or Signup" with the real user centre: Notifications (with red dot), Favourites, Chats — icon above a 1.4rem label.
- **Home page** (`_pages/home.desktop.html`) — rebuilt. The live home is a **category directory, not a listings feed**. There are no ad cards on it at all. It is: hero banner → `h1 "Explore Egypt's Largest Marketplace"` → 12-category grid (4 cols), each with 4 sub-links and a red "All in X ›" → Popular Searches.
- **`patterns.css`** — added a `LIVE-SITE PATTERNS` block with everything measured from the saved pages.

### Card components — three per-vertical anatomies

The list/category card is **three components** sharing one shell (`.ad-list-card`):
- **Cars** — price + model chip → title → `year · km · transmission · fuel` spec line → optional condition chips.
- **Property** — **no free-text title**; body leads with the property type + `beds · baths · area`, then attribute chips (Completion Status, Ownership).
- **Goods** — price → title → a single condition attribute; no structured specs.

All keep the price **charcoal** and contact CTAs at the bottom. The grid card (`.ad-card`) and React `AdCard` are the same designed card; price is charcoal there too. Documented in `design-kit/index.html` → Ad cards → "List variant — three category components" (source in `scripts/build-preview.mjs`).

**Goods still needs a live reference.** motors/properties were built from saved live pages; there is no saved goods page, and this environment's network egress to dubizzle.com.eg is blocked, so a live fetch isn't possible from here. The goods card above is built from the general classifieds pattern — save a live goods category page (e.g. mobile phones) into `design-kit/reference/live/goods.html` and re-check it.

### Still to do

1. ~~**Vertical landing pages are missing entirely** — `motors.desktop.html` and `properties.desktop.html`.~~ **DONE.** Both built from the saved live pages and verified with headless Chromium against the measured values (rail 304px, tinted card #fef5f5, listing price charcoal `rgb(35,38,42)` at 24px/700).
   - Motors: breadcrumb → page-head (`12,864 ads` count pill + Save Search) → left rail (tinted Categories tree, white Location, Brand and Model — all with live counts) → right column (Featured Businesses strip, `All / New / Used` segmented, sort toolbar, Car of the Week ribbon, Elite Ads, results, Popular Cars chips). Listing cards horizontal with vehicle attr-chips + Call/WhatsApp/Chat.
   - Properties: **no** Featured Businesses strip and **no** segmented control (motors-only). Leads with a Location panel (areas + counts + "View More Locations ›"). Left rail adds a Price range. No aggregate count pill — the live properties landing doesn't surface one; counts live per-category in the rail. Property cards use beds/baths/area specs.
   - Added one small pattern (`.contact-row`) and sized `.attr-chip img` while doing this.
2. **Mobile versions** of the corrected home + the two verticals (`home.mobile.html` is stale; `motors.mobile.html` / `properties.mobile.html` don't exist yet).
3. **`search.desktop.html` needs reworking** to the real pattern — it currently uses price/beds/area inputs, but live uses the category+location tree with counts.
4. **Re-check `ad-detail`** against live — no saved reference for it yet; ask the user for one.

### Important discrepancies found (live wins over the monorepo)

- **Listing price is CHARCOAL (`--text-primary`, 2.4rem/700), not red.** The monorepo still defines `$adCardPriceColor: $primaryColor`, and `RULES.md` + the older `.ad-card` pattern still say red. Live renders `rgb(35,38,42)` on both verticals. `RULES.md` §3 and the `.ad-card__price` rule both need updating, and `design-kit/index.html` repeats the red claim.
- Live body/nav text is `#222222` in places where our token is `#23262a`.
- `Elite` renders as a small gold pill with a flame icon near the image, not a corner overlay badge.
- `Car of the Week` / `Property of the Week` are **red ribbons** across the image's top-left corner, not pills.

### Measured values (from live, for reference)

| Element | Value |
|---|---|
| Header gray row | 68px tall, `#f6f6f6` |
| Header white row | 76px, padding `16px 0 12px` |
| Category nav strip | 73px, white, items 16px/600 |
| Post Your Ad | 130×40, `#e00000`, radius 6 |
| Search button | 111×48, `#23262a`, radius `0 6 6 0` |
| Location select | 303×48 |
| `h1` | 23.94px/700 charcoal |
| Count pill | `#fbe0e0`, 14px/700, radius 4, padding `2px 7px` |
| Save Search | 140×46, white, `1px #e0e0e0`, radius 6, 16px/700 |
| Categories card | 304 wide, `#fef5f5`, radius 8, padding 16 |
| Segmented option | 109×37, white, `1px #dadbdb`, radius 4, padding `9px 16px`; active is `--color-secondary-light` |
| Listing price | 24px/700 **charcoal** |

## Method that worked

Don't trust the monorepo or a screenshot alone. Serve the saved live page, then measure with `mcp__Claude_Browser__javascript_tool` — `getComputedStyle` + `getBoundingClientRect` on real elements. That's how every value in the table above was obtained, and it's what caught the price-colour discrepancy. The Browser pane in this environment frequently stops compositing, so screenshots are unreliable; computed-style checks are not.

## Git

7 commits, no remote. `git log --oneline` for history. When ready to publish, add the remote and push — nothing in the repo assumes a remote exists.
