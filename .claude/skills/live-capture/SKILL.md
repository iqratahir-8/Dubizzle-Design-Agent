---
name: live-capture
description: >-
  Re-capture dubizzle.com.eg pages as pixel-perfect frozen snapshots and regenerate the
  design system's live templates, screenshots and gallery from them — public pages,
  logged-in account screens (redacted) and the Post an Ad flow (never published). Use
  this WHENEVER a new dubizzle release shipped, a template or screenshot looks different
  from the live site, a page/flow has no template yet, the user says "fetch/capture/
  extract the screens", "update the templates from live", "pixel perfect", "recapture",
  or asks to measure a live component. Also use before building a component whose live
  styling is unknown.
---

# Live capture

## Why

The live site is the source of truth — the product monorepo lags production. Templates
used to be hand-built and drifted; now they are generated from frozen captures that render
within ~0–3% of the live screenshots. This skill keeps that true after every release.

A capture is a **frozen snapshot** (`scripts/lib/snapshot.mjs`), not `page.content()`:
applied CSSOM rules, inlined fonts (dubizzle draws some text through an obfuscation font),
images, SVG sprites, iframe pictures, stopped timers, no scripts. It is built on a *clone*
of the DOM because the motors app strips stylesheets it didn't insert.

## Ground rules (agreed with the user — never break)

1. **Privacy.** Logged-in captures replace real names, phones, emails, message text and
   date of birth with sample data *before* anything is saved. Two gates must pass:
   `leaks()` on the HTML and `visibleLeaks()` on the rendered page before every
   screenshot (React forms restore real values otherwise — this once leaked a real name
   and phone into screenshots). Never weaken or skip either gate. Never write the account
   holder's real name into any file, log, commit or message.
2. **Never publish or change the account.** Never click Post now / Post / Pay / Buy /
   Republish / Remove / Save / Send; don't open unread chats; don't change settings.
   `capture-post-ad.mjs` also aborts every non-GET request for the whole run — keep that.
3. **Captures stay local.** `design-kit/reference/live/` is gitignored; account-derived
   templates are gitignored. The capture Chrome profile (`~/.dubizzle-capture/`) holds
   session cookies — never commit or copy it.
4. **Live wins** over the monorepo when they disagree.

## Commands

Needs the kit server for checks: `npm run kit` (port 4321). Storybook (`npm run dev`) for parity.

| Task | Command |
|---|---|
| Public pages (desktop + mobile) | `npm run capture:rendered -- <names…> [--layout=mobile]` — names from `design-kit/reference/capture-manifest.json` |
| Sign in for logged-in captures | `npm run capture:login` opens a plain Chrome window (automation-controlled Chrome gets "invalid credentials"); the **user** signs in there; confirm with `npm run capture:login -- --check` |
| Account screens | `npm run capture:account [-- my-ads chat …]` |
| Interaction states (mega menus, location dropdown, search suggestions, mobile search/location pages) | `npm run capture:states [-- names] [--layout=desktop]` — the list lives in `scripts/lib/states.mjs` |
| Signed-in states (user menu, mobile account page) | `npm run capture:states -- --account` |
| Post an Ad flow + upsell | `npm run capture:post-ad [-- --layout=desktop]` |
| Capture fidelity | `npm run check:captures [-- names]` |
| Regenerate templates | `npm run build:templates` |
| Template fidelity | `npm run check:templates [-- names]` |
| Gallery | `npm run build:gallery` (also runs after every capture) |

## Capturing something that only exists after an interaction

A page capture always shows menus closed, so dropdowns and overlays need their own capture.
Add an entry to `scripts/lib/states.mjs` (`url`, `layouts`, `steps`) and run `capture:states`.
Steps are `hover` (a real mouse move — React's `onMouseEnter` ignores synthetic events), `click`,
`type` and `wait`; target an element by `text` (+ `within: [minY, maxY]` when the word repeats on
the page) or by `at: [x, y]` where the text is personal, like the account name. State captures
embed their images — the page behind an overlay carries a rotating ad, and a capture that
re-fetched it would never match its own screenshot — and are screenshotted at viewport size, so
`check:captures` compares them at viewport size too.

## Workflow after a release

1. Public pages: `npm run capture:rendered -- $(node -p "Object.values(require('./design-kit/reference/capture-manifest.json').tiers).flatMap(Object.keys).join(' ')")`.
   Ad pages expire — if a DPV 404s, pick a fresh `/en/ad/` link from its listing page and
   update the manifest.
2. Ask the user to confirm the capture window is signed in (only they can sign in), then
   `npm run capture:account` and `npm run capture:post-ad`. Check each result line; for
   Post an Ad confirm the `filled:` list is long (a short list means fields didn't take).
3. `npm run check:captures` → every page `ok` (≤ 3%). For a BROKEN one, crop live vs
   re-render around "diverges from N%" and fix the cause (known ones below) — don't
   loosen the tolerance.
4. `npm run build:templates` then `npm run check:templates` → all ok.
5. If components may have changed: measure them on the snapshots (below), update React
   + `patterns.css` + `docs/LIVE-MEASUREMENTS.md`, `npm run check:parity` → 0 differ.
6. Update `PROGRESS.md`, commit (captures and account templates are ignored automatically —
   verify nothing from `reference/live/` is staged).

## Adding a page that has no template

1. Add its path to `capture-manifest.json` (tier `templates` for template-only pages).
   Pages that aren't HTTP 200 → `EXPECTED_STATUS`; dialogs (login) → `OPEN_DIALOG` in
   `capture-rendered.mjs` (viewport screenshots — full-page shots re-lay fixed dialogs);
   short pages → `MIN_TEXT`.
2. Capture, then map it in `design-kit/templates/live-templates.json` (`"account": true`
   and a `.gitignore` line if it came from a logged-in session).
3. Build + check templates; retire the hand-built `_pages/<name>.*.html` it replaces.

## Measuring a live component

Open the snapshot from the kit server (`http://localhost:4321/reference/live/<name>.<layout>.html`)
in headless Chrome at the capture's viewport (`LAYOUTS` in `scripts/lib/render-helpers.mjs`),
find the element (walk up from a text node such as a price), and read `getComputedStyle` +
`getBoundingClientRect` for the element and its children. Map every colour to a token
(`design-kit/tokens/tokens.css`); if production uses a value with no token (a gradient, a
radius), add a semantic token in `scripts/sync-tokens.mjs` and run `npm run sync:tokens` —
don't hard-code it. Put throwaway scripts in `scripts/.tmp-*.mjs` (gitignored; puppeteer-core
only resolves from inside the repo).

## Known failure causes (already handled — recognise them)

| Symptom | Cause |
|---|---|
| Scrambled text ("AsB/I1") | obfuscation font not inlined |
| Blank icons | cross-origin `<svg><use href>` sprites — inlined; refs may be relative at snapshot time |
| Page unstyled only in the live screenshot | app stripped restyled sheets — snapshot on a DOM clone |
| Text slightly wider, wraps differently | script-loaded fonts (Typekit FontFace API) — rebuilt as @font-face |
| Background image missing in a template | url() inside a CSS custom property resolves against the stylesheet — `_live-css/` must sit beside `desktop/` |
| Dialog missing | full-page screenshot of a dialog screen — use viewport size |
| "Loading…" frozen into HTML | save before loading overlay cleared — wait for it |
| 100% diff, height ×0.1 | page navigated/redirected or saved mid-render |
