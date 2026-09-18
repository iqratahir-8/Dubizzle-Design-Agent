---
name: motion-design
description: >-
  Measure and apply motion in dubizzle Egypt — transitions, menu and sheet opens, carousels,
  toasts, loading. Use when a design needs animation or a transition, when asked about
  timing, easing, duration or micro-interaction, and before adding any motion value to the
  system. Motion here is measured from live, never invented.
---

# Motion

**The system does not currently define motion.** Of 1,269 generated tokens, exactly two
concern timing: `--banner-animation-speed: 1s` and `--tertiary-button-transition: 0.3s`.
`RULES.md` previously asserted "colour transitions only, 0.15s" — that figure was never
measured, and it is the same failure as D-007: a plausible constraint enforced as fact.

So the job here is usually **measurement first, design second**.

## Measure before you animate

Production visibly animates at least these, and none are recorded:

- mega menu open/close on hover
- home and DPV carousels (auto-advance interval, slide duration)
- mobile sheets — filter sheet, location page — sliding up
- toasts entering and leaving
- skeleton / loading placeholders
- button and card hover transitions

To capture a value, read it from the live page rather than eyeballing it:

```js
// in a puppeteer page against live, or against a capture that kept its styles
getComputedStyle(el).transitionProperty;
getComputedStyle(el).transitionDuration;
getComputedStyle(el).transitionTimingFunction;
getComputedStyle(el).animationName;
getComputedStyle(el).animationDuration;
// keyframes: [...document.styleSheets].flatMap(s => [...s.cssRules])
//   .filter(r => r.type === CSSRule.KEYFRAMES_RULE).map(r => r.name)
```

The `live-capture` machinery freezes pages and stops timers precisely so screenshots are
stable — so a frozen capture is the wrong place to measure duration. Measure on the **live**
page, then record the number.

## Recording what you measure

A measured motion value becomes a token in `scripts/sync-tokens.mjs` with a comment saying
where it came from, exactly like `--week-gradient` did, plus a row in
`docs/LIVE-MEASUREMENTS.md`. A value you could not measure goes in `docs/PROPOSALS.md` and
gets flagged to the user for designer sign-off — never quietly into a component.

## Applying motion

- **Motion explains, it does not decorate.** A sheet slides up from the edge it belongs to so
  the user knows where it came from. A toast fades in because it is not a page change. A card
  does not need to do anything.
- **Reuse a measured value** or none at all. Do not pick "300ms ease-out" because it feels right.
- **`prefers-reduced-motion: reduce` is mandatory.** No component in this system honours it
  today; every new one must:

```css
@media (prefers-reduced-motion: reduce) {
  .thing { transition: none; animation: none; }
}
```

- Animate cheap properties — `opacity` and `transform`. Animating `height`, `top` or
  `box-shadow` on a long listing page costs frames on the low-end Android this product runs on.
- **Never animate away a user's reading position**, and never block input behind an animation.

## Still forbidden, measured or not

`transform: scale()` on hover · bounce / spring / elastic easing · staggered entrance
reveals · parallax · anything that moves while the user is scanning a list. dubizzle is a
scanning product: motion that competes with scanning is a defect.

## Working with the Emil Kowalski skills

Those skills (installed, MIT) carry the craft; this one carries the provenance.

| Job | Skill |
|---|---|
| Build an animation | `animate` |
| Review motion code against a craft bar | `review-animations` |
| Audit all motion in the codebase | `improve-animations` |
| Find things that should animate but don't | `find-animation-opportunities` |
| Name a motion the user described vaguely | `animation-vocabulary` |
| Make mweb feel native | `mobile-native` |

What stays with this skill: **where a value came from.** Those skills supply technique
and will happily give you a duration; this one insists you use dubizzle's token, or
measure live, or log a proposal. Craft from them, provenance from here.

## Output

Say which values you measured, which you reused, and which are proposals awaiting sign-off.
"It feels right" is not a source.
