#!/usr/bin/env node
/**
 * Component parity check: the React library (Storybook) and the HTML design kit
 * (patterns.css) implement the same components twice, so they drift. This renders each
 * component in both, reads computed styles, and reports every property that differs.
 *
 * Needs both servers running:
 *   npm run dev            # Storybook on :6006
 *   npm run kit            # design kit on :4321
 *   npm run check:parity   # exits 1 on any mismatch
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';

const SB = process.env.STORYBOOK_URL || 'http://localhost:6006';
const KIT = process.env.KIT_URL || 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Properties that define how a component looks, independent of the page it sits in. */
const BOX = ['height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopLeftRadius', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'backgroundColor', 'backgroundImage', 'boxShadow'];
const TYPE = ['color', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'textTransform'];
const ALL = [...BOX, ...TYPE];
const SIZED = [...ALL, 'width'];
const SIZED_NO_W = ALL;
/** Cards stretch to their container — compare everything but the height it grows to. */
const BOX_NO_H = [...BOX.filter((p) => p !== 'height'), ...TYPE];

/**
 * Each pair names a Storybook story + an element in it, and the matching element on the
 * kit's reference page. `n` picks the nth match. Storybook class names are CSS-Module
 * hashes, so React elements are found by tag/role or by the module's class stem.
 */
export const PAIRS = [
  ['Button / primary', { story: 'components-button--primary', sel: 'button' }, { sel: '#buttons .btn--primary:not(.btn--sm):not(.btn--lg):not([disabled])' }],
  ['Button / secondary', { story: 'components-button--secondary', sel: 'button' }, { sel: '#buttons .btn--secondary:not([disabled])' }],
  ['Button / tertiary', { story: 'components-button--tertiary', sel: 'button' }, { sel: '#buttons .btn--tertiary' }],
  ['Button / ghost', { story: 'components-button--ghost', sel: 'button' }, { sel: '#buttons .btn--ghost' }],
  ['Button / disabled', { story: 'components-button--disabled', sel: 'button' }, { sel: '#buttons .btn--primary[disabled]' }],
  ['Button / small', { story: 'components-button--sizes', sel: 'button', n: 0 }, { sel: '#buttons .btn--sm' }],
  ['Button / large', { story: 'components-button--sizes', sel: 'button', n: 2 }, { sel: '#buttons .btn--lg' }],
  ['Contact / chat', { story: 'components-contactbutton--all-variants', sel: 'button', n: 0 }, { sel: '#buttons .contact-btn--chat' }],
  ['Contact / call', { story: 'components-contactbutton--all-variants', sel: 'button', n: 1 }, { sel: '#buttons .contact-btn--call' }],
  ['Contact / whatsapp', { story: 'components-contactbutton--all-variants', sel: 'button', n: 2 }, { sel: '#buttons .contact-btn--whatsapp' }],
  ['Chip / quick desktop', { story: 'components-chip--quick-row', sel: 'div > div:nth-child(1) > button', props: SIZED_NO_W }, { sel: '[data-parity="quick-desktop"] .chip' }],
  ['Chip / quick mobile', { story: 'components-chip--quick-row', sel: 'div > div:nth-child(2) > button', props: SIZED_NO_W }, { sel: '[data-parity="quick-mobile"] .chip' }],
  ['Chip / filter applied', { story: 'components-chip--filter-bar', sel: 'button', n: 1, props: SIZED_NO_W }, { sel: '[data-parity="filter-bar"] .chip', n: 1 }],
  ['Chip / filter not applied', { story: 'components-chip--filter-bar', sel: 'button', n: 2, props: SIZED_NO_W }, { sel: '[data-parity="filter-bar"] .chip', n: 2 }],
  ['Chip / filter count badge', { story: 'components-chip--filter-bar', sel: '[class*="_count_"]' }, { sel: '[data-parity="filter-bar"] .chip__count' }],
  ['Chip / segment selected', { story: 'components-chip--segment', sel: 'button', n: 0, props: SIZED }, { sel: '[data-parity="segment"] .chip', n: 0 }],
  ['Chip / segment', { story: 'components-chip--segment', sel: 'button', n: 1, props: SIZED }, { sel: '[data-parity="segment"] .chip', n: 1 }],
  ['Pill / regular', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 0 }, { sel: '#tags .pill--regular' }],
  ['Pill / success', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 1 }, { sel: '#tags .pill--success' }],
  ['Pill / featured', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 2 }, { sel: '#tags .pill--featured' }],
  ['Pill / error', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 3 }, { sel: '#tags .pill--error' }],
  ['Pill / boosted', { story: 'components-pill--all-variants', sel: '#storybook-root span', n: 4 }, { sel: '#tags .pill--boosted' }],
  ['Input / field', { story: 'components-input--default', sel: '[class*="field"]' }, { sel: '#forms input.input' }],
  ['Input / label', { story: 'components-input--default', sel: 'label' }, { sel: '#forms .field__label' }],
  ['Input / error text', { story: 'components-input--with-error', sel: '[class*="errorText"]' }, { sel: '#forms .field__error' }],
  ['Select / control', { story: 'components-select--default', sel: '[role="combobox"]', props: BOX }, { sel: '#forms .select' }],
  ['Checkbox / checked box', { story: 'components-checkbox--checked', sel: '[class*="box"]', props: SIZED }, { sel: '#forms .control input:checked + .control__box' }],
  ['Radio / selected', { story: 'components-radio--group', sel: '[class*="outer"]', props: SIZED }, { sel: '#forms .control input:checked + .control__radio' }],
  ['Toggle / on track', { story: 'components-toggle--on', sel: '[class*="track"]', props: SIZED }, { sel: '#forms .control input:checked + .control__track' }],
  ['Tabs / active tab', { story: 'components-tabs--line', sel: '[role="tab"][aria-selected="true"]' }, { sel: '#nav-components .tabs__tab--active' }],
  ['Tabs / inactive tab', { story: 'components-tabs--line', sel: '[role="tab"][aria-selected="false"]' }, { sel: '#nav-components .tabs__tab:not(.tabs__tab--active)' }],
  ['Pagination / active', { story: 'components-pagination--default', sel: 'button[aria-current="page"]', props: SIZED }, { sel: '#nav-components .pagination__btn--active' }],
  ['AdCard desktop / card', { story: 'components-adcard--property', sel: 'article', props: SIZED }, { sel: '[data-parity="grid-desktop"]' }],
  ['AdCard desktop / image', { story: 'components-adcard--property', sel: '[class*="_media_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__media' }],
  ['AdCard desktop / price row', { story: 'components-adcard--property', sel: '[class*="_priceRow_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__price-row' }],
  ['AdCard desktop / price', { story: 'components-adcard--property', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__price' }],
  ['AdCard desktop / title', { story: 'components-adcard--property', sel: '[class*="_title_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__title' }],
  ['AdCard desktop / specs', { story: 'components-adcard--property', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__specs' }],
  ['AdCard desktop / meta', { story: 'components-adcard--property', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__meta' }],
  ['AdCard desktop / location', { story: 'components-adcard--property', sel: '[class*="_location_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__location' }],
  ['AdCard desktop / time', { story: 'components-adcard--property', sel: '[class*="_time_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__time' }],
  ['AdCard mobile / card', { story: 'components-adcard--mobile', sel: 'article', props: SIZED }, { sel: '[data-parity="grid-mobile"]' }],
  ['AdCard mobile / image', { story: 'components-adcard--mobile', sel: '[class*="_media_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__media' }],
  ['AdCard mobile / price row', { story: 'components-adcard--mobile', sel: '[class*="_priceRow_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__price-row' }],
  ['AdCard mobile / price', { story: 'components-adcard--mobile', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__price' }],
  ['AdCard mobile / title', { story: 'components-adcard--mobile', sel: '[class*="_title_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__title' }],
  ['AdCard mobile / specs', { story: 'components-adcard--mobile', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__specs' }],
  ['AdCard mobile / meta', { story: 'components-adcard--mobile', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__meta' }],
  ['AdCard mobile / location', { story: 'components-adcard--mobile', sel: '[class*="_location_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__location' }],
  ['AdCard mobile / time', { story: 'components-adcard--mobile', sel: '[class*="_time_"]', props: ALL }, { sel: '[data-parity="grid-mobile"] .ad-card__time' }],
  ['AdCard desktop / down payment', { story: 'components-adcard--property', sel: '[class*="_downPayment_"]', props: ALL }, { sel: '[data-parity="grid-desktop"] .ad-card__dp' }],
  ['AdCard / featured badge', { story: 'components-adcard--featured', sel: '[class*="_badge_"]', props: ALL }, { sel: '#featured-grid-card .ad-card__badge' }],
  ['AdListCard desktop / card', { story: 'components-adlistcard--property', sel: 'article', props: BOX_NO_H }, { sel: '[data-parity="list-desktop"]' }],
  ['AdListCard desktop / image', { story: 'components-adlistcard--property', sel: '[class*="_media_"]', props: BOX_NO_H }, { sel: '[data-parity="list-desktop"] .ad-list-card__media' }],
  ['AdListCard desktop / body', { story: 'components-adlistcard--property', sel: '[class*="_body_"]', props: BOX_NO_H }, { sel: '[data-parity="list-desktop"] .ad-list-card__body' }],
  ['AdListCard desktop / price', { story: 'components-adlistcard--property', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__price' }],
  ['AdListCard desktop / down payment', { story: 'components-adlistcard--property', sel: '[class*="_downPayment_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__dp' }],
  ['AdListCard desktop / type', { story: 'components-adlistcard--property', sel: '[class*="_type_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__type' }],
  ['AdListCard desktop / specs', { story: 'components-adlistcard--property', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__specs' }],
  ['AdListCard desktop / attribute chip', { story: 'components-adlistcard--property', sel: '[class*="_attribute_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .attr-chip' }],
  ['AdListCard desktop / meta', { story: 'components-adlistcard--property', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__meta' }],
  ['AdListCard desktop / actions', { story: 'components-adlistcard--property', sel: '[class*="_actions_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__actions' }],
  ['AdListCard desktop / featured badge', { story: 'components-adlistcard--property', sel: '[class*="_badge_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-card__badge' }],
  ['AdListCard mobile / card', { story: 'components-adlistcard--mobile-property', sel: 'article', props: BOX_NO_H }, { sel: '[data-parity="list-mobile"]' }],
  ['AdListCard mobile / image', { story: 'components-adlistcard--mobile-property', sel: '[class*="_media_"]', props: BOX_NO_H }, { sel: '[data-parity="list-mobile"] .ad-list-card__media' }],
  ['AdListCard mobile / body', { story: 'components-adlistcard--mobile-property', sel: '[class*="_body_"]', props: BOX_NO_H }, { sel: '[data-parity="list-mobile"] .ad-list-card__body' }],
  ['AdListCard mobile / price', { story: 'components-adlistcard--mobile-property', sel: '[class*="_price_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__price' }],
  ['AdListCard mobile / down payment', { story: 'components-adlistcard--mobile-property', sel: '[class*="_downPayment_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__dp' }],
  ['AdListCard mobile / type', { story: 'components-adlistcard--mobile-property', sel: '[class*="_type_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__type' }],
  ['AdListCard mobile / specs', { story: 'components-adlistcard--mobile-property', sel: '[class*="_specs_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__specs' }],
  ['AdListCard mobile / attribute chip', { story: 'components-adlistcard--mobile-property', sel: '[class*="_attribute_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .attr-chip' }],
  ['AdListCard mobile / meta', { story: 'components-adlistcard--mobile-property', sel: '[class*="_meta_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__meta' }],
  ['AdListCard mobile / actions', { story: 'components-adlistcard--mobile-property', sel: '[class*="_actions_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-list-card__actions' }],
  ['AdListCard mobile / featured badge', { story: 'components-adlistcard--mobile-property', sel: '[class*="_badge_"]', props: ALL }, { sel: '[data-parity="list-mobile"] .ad-card__badge' }],
  ['AdListCard desktop / title', { story: 'components-adlistcard--property', sel: '[class*="_title_"]', props: ALL }, { sel: '[data-parity="list-desktop"] .ad-list-card__title' }],
  ['MobileHeader home full / bar', { story: 'mobile-mobileheader--home-full', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-home-full"] .m-header__bar', n: 0 }],
  ['MobileHeader home full / search', { story: 'mobile-mobileheader--home-full', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-home-full"] .m-search', n: 0 }],
  ['MobileHeader home full / placeholder', { story: 'mobile-mobileheader--home-full', sel: '[class*="_placeholder_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-home-full"] .m-search__placeholder', n: 0 }],
  ['MobileHeader home full / tile', { story: 'mobile-mobileheader--home-full', sel: '[class*="_tile_"]', n: 1, props: BOX }, { sel: '[data-parity="m-home-full"] .m-header__tile', n: 1 }],
  ['MobileHeader home full / active tile', { story: 'mobile-mobileheader--home-full', sel: '[class*="_tileActive_"]', n: 0, props: BOX }, { sel: '[data-parity="m-home-full"] .m-header__tile--active', n: 0 }],
  ['MobileHeader home full / tile label', { story: 'mobile-mobileheader--home-full', sel: '[class*="_tileLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-home-full"] .m-header__tile-label', n: 0 }],
  ['MobileHeader home full / favourites', { story: 'mobile-mobileheader--home-full', sel: '[class*="_favourites_"]', n: 0, props: BOX }, { sel: '[data-parity="m-home-full"] .m-header__favourites', n: 0 }],
  ['MobileHeader home full / location', { story: 'mobile-mobileheader--home-full', sel: '[class*="_location_"]', n: 0, props: ALL }, { sel: '[data-parity="m-home-full"] .m-header__location', n: 0 }],
  ['MobileHeader home minimized / bar', { story: 'mobile-mobileheader--home-minimized', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-home-minimized"] .m-header__bar', n: 0 }],
  ['MobileHeader home minimized / search', { story: 'mobile-mobileheader--home-minimized', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-home-minimized"] .m-search', n: 0 }],
  ['MobileHeader home minimized / placeholder', { story: 'mobile-mobileheader--home-minimized', sel: '[class*="_placeholder_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-home-minimized"] .m-search__placeholder', n: 0 }],
  ['MobileHeader home minimized / tile', { story: 'mobile-mobileheader--home-minimized', sel: '[class*="_tile_"]', n: 1, props: BOX }, { sel: '[data-parity="m-home-minimized"] .m-header__tile', n: 1 }],
  ['MobileHeader home minimized / active tile', { story: 'mobile-mobileheader--home-minimized', sel: '[class*="_tileActive_"]', n: 0, props: BOX }, { sel: '[data-parity="m-home-minimized"] .m-header__tile--active', n: 0 }],
  ['MobileHeader home minimized / favourites', { story: 'mobile-mobileheader--home-minimized', sel: '[class*="_favourites_"]', n: 0, props: BOX }, { sel: '[data-parity="m-home-minimized"] .m-header__favourites', n: 0 }],
  ['MobileHeader home search / bar', { story: 'mobile-mobileheader--home-search', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-home-search"] .m-header__bar', n: 0 }],
  ['MobileHeader home search / search', { story: 'mobile-mobileheader--home-search', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-home-search"] .m-search', n: 0 }],
  ['MobileHeader home search / placeholder', { story: 'mobile-mobileheader--home-search', sel: '[class*="_placeholder_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-home-search"] .m-search__placeholder', n: 0 }],
  ['MobileHeader motors full / bar', { story: 'mobile-mobileheader--motors-full', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-motors-full"] .m-header__bar', n: 0 }],
  ['MobileHeader motors full / search', { story: 'mobile-mobileheader--motors-full', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-motors-full"] .m-search', n: 0 }],
  ['MobileHeader motors full / placeholder', { story: 'mobile-mobileheader--motors-full', sel: '[class*="_placeholder_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-motors-full"] .m-search__placeholder', n: 0 }],
  ['MobileHeader motors full / tile', { story: 'mobile-mobileheader--motors-full', sel: '[class*="_tile_"]', n: 1, props: BOX }, { sel: '[data-parity="m-motors-full"] .m-header__tile', n: 1 }],
  ['MobileHeader motors full / active tile', { story: 'mobile-mobileheader--motors-full', sel: '[class*="_tileActive_"]', n: 0, props: BOX }, { sel: '[data-parity="m-motors-full"] .m-header__tile--active', n: 0 }],
  ['MobileHeader motors full / tile label', { story: 'mobile-mobileheader--motors-full', sel: '[class*="_tileLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-motors-full"] .m-header__tile-label', n: 0 }],
  ['MobileHeader motors full / location', { story: 'mobile-mobileheader--motors-full', sel: '[class*="_location_"]', n: 0, props: ALL }, { sel: '[data-parity="m-motors-full"] .m-header__location', n: 0 }],
  ['MobileHeader motors minimized / bar', { story: 'mobile-mobileheader--motors-minimized', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-motors-minimized"] .m-header__bar', n: 0 }],
  ['MobileHeader motors minimized / search', { story: 'mobile-mobileheader--motors-minimized', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-motors-minimized"] .m-search', n: 0 }],
  ['MobileHeader motors minimized / placeholder', { story: 'mobile-mobileheader--motors-minimized', sel: '[class*="_placeholder_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-motors-minimized"] .m-search__placeholder', n: 0 }],
  ['MobileHeader motors minimized / tile', { story: 'mobile-mobileheader--motors-minimized', sel: '[class*="_tile_"]', n: 1, props: BOX }, { sel: '[data-parity="m-motors-minimized"] .m-header__tile', n: 1 }],
  ['MobileHeader motors minimized / active tile', { story: 'mobile-mobileheader--motors-minimized', sel: '[class*="_tileActive_"]', n: 0, props: BOX }, { sel: '[data-parity="m-motors-minimized"] .m-header__tile--active', n: 0 }],
  ['MobileHeader motors minimized / tile label', { story: 'mobile-mobileheader--motors-minimized', sel: '[class*="_tileLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-motors-minimized"] .m-header__tile-label', n: 0 }],
  ['MobileHeader motors search / bar', { story: 'mobile-mobileheader--motors-search', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-motors-search"] .m-header__bar', n: 0 }],
  ['MobileHeader motors search / search', { story: 'mobile-mobileheader--motors-search', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-motors-search"] .m-search', n: 0 }],
  ['MobileHeader motors search / placeholder', { story: 'mobile-mobileheader--motors-search', sel: '[class*="_placeholder_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-motors-search"] .m-search__placeholder', n: 0 }],
  ['MobileHeader property / header', { story: 'mobile-mobileheader--property', sel: 'header', n: 0, props: BOX }, { sel: '[data-parity="m-listing"]', n: 0 }],
  ['MobileHeader property / search', { story: 'mobile-mobileheader--property', sel: '[class*="_searchButton_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-listing"] .m-search', n: 0 }],
  ['MobileHeader property / filter chip', { story: 'mobile-mobileheader--property', sel: 'button[aria-pressed]', n: 1, props: SIZED_NO_W }, { sel: '[data-parity="m-listing"] .chip', n: 1 }],
  ['BottomNav / bar', { story: 'mobile-bottomnav--home', sel: 'nav', n: 0, props: BOX }, { sel: '[data-parity="m-nav"]', n: 0 }],
  ['BottomNav / active item', { story: 'mobile-bottomnav--home', sel: 'a', n: 0, props: BOX }, { sel: '[data-parity="m-nav"] .bottom-nav__item', n: 0 }],
  ['BottomNav / active label', { story: 'mobile-bottomnav--home', sel: '[class*="_label_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-nav"] .bottom-nav__item', n: 0 }],
  ['BottomNav / inactive label', { story: 'mobile-bottomnav--home', sel: '[class*="_label_"]', n: 1, props: TYPE }, { sel: '[data-parity="m-nav"] .bottom-nav__item', n: 1 }],
  ['BottomNav / sell', { story: 'mobile-bottomnav--home', sel: 'button', n: 0, props: ALL }, { sel: '[data-parity="m-nav"] .bottom-nav__sell', n: 0 }],
  ['SortSaveBar / bar', { story: 'mobile-sortsavebar--on-listing-page', sel: '[class*="_bar_"]', n: 0, props: BOX }, { sel: '[data-parity="m-actions"] .sort-save', n: 0 }],
  ['SortSaveBar / action', { story: 'mobile-sortsavebar--on-listing-page', sel: '[class*="_action_"]', n: 0, props: ALL }, { sel: '[data-parity="m-actions"] .sort-save__action', n: 0 }],
  ['SellFab', { story: 'mobile-sortsavebar--on-listing-page', sel: '[class*="_fab_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-actions"] .sell-fab', n: 0 }],
  ['QuickLinks / title', { story: 'mobile-quicklinks--home', sel: 'h2', n: 0, props: ALL }, { sel: '[data-parity="m-quick"] .quick-links__title', n: 0 }],
  ['QuickLinks / icon tile', { story: 'mobile-quicklinks--home', sel: '[class*="_icon_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-quick"] .quick-links__icon', n: 0 }],
  ['QuickLinks / label', { story: 'mobile-quicklinks--home', sel: '[class*="_label_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-quick"] .quick-links__label', n: 0 }],
  ['AppBanner / banner', { story: 'mobile-appbanner--default', sel: '[class*="_banner_"]', n: 0, props: BOX }, { sel: '[data-parity="m-banner"]', n: 0 }],
  ['AppBanner / title', { story: 'mobile-appbanner--default', sel: '[class*="_title_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-banner"] .app-banner__title', n: 0 }],
  ['AppBanner / badge', { story: 'mobile-appbanner--default', sel: '[class*="_badge_"]', n: 0, props: ALL }, { sel: '[data-parity="m-banner"] .app-banner__badge', n: 0 }],
  ['AppBanner / cta', { story: 'mobile-appbanner--default', sel: '[class*="_cta_"]', n: 0, props: ALL }, { sel: '[data-parity="m-banner"] .app-banner__cta', n: 0 }],
  ['DiscoverTabs / active tab', { story: 'mobile-discovertabs--default', sel: '[class*="_tab_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="m-discover"] .discover-tabs__tab', n: 0 }],
  ['DiscoverTabs / inactive tab', { story: 'mobile-discovertabs--default', sel: '[class*="_tab_"]', n: 1, props: BOX_NO_H }, { sel: '[data-parity="m-discover"] .discover-tabs__tab', n: 1 }],
  ['DiscoverTabs / label', { story: 'mobile-discovertabs--default', sel: '[class*="_label_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-discover"] .discover-tabs__label', n: 0 }],
  ['DiscoverTabs / badge', { story: 'mobile-discovertabs--default', sel: '[class*="_badge_"]', n: 0, props: ALL }, { sel: '[data-parity="m-discover"] .discover-tabs__badge', n: 0 }],
  ['DiscoverTabs / subtitle', { story: 'mobile-discovertabs--default', sel: '[class*="_subtitle_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-discover"] .discover-tabs__subtitle', n: 0 }],
  ['AppPromoCard / card', { story: 'mobile-apppromocard--home', sel: '[class*="_card_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="m-promo"]', n: 0 }],
  ['AppPromoCard / title', { story: 'mobile-apppromocard--home', sel: '[class*="_title_"]', n: 0, props: ALL }, { sel: '[data-parity="m-promo"] .app-promo__title', n: 0 }],
  ['AppPromoCard / point', { story: 'mobile-apppromocard--home', sel: '[class*="_point_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-promo"] .app-promo__point', n: 0 }],
  ['AppPromoCard / tick', { story: 'mobile-apppromocard--home', sel: '[class*="_tick_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-promo"] .app-promo__tick', n: 0 }],
  ['AppPromoCard / cta', { story: 'mobile-apppromocard--home', sel: '[class*="_cta_"]', n: 0, props: ALL }, { sel: '[data-parity="m-promo"] .app-promo__cta', n: 0 }],
  ['PopularSearches / heading', { story: 'mobile-popularsearches--default', sel: 'h2', n: 0, props: ALL }, { sel: '[data-parity="m-popular"] .popular-searches__heading', n: 0 }],
  ['PopularSearches / group clip', { story: 'mobile-popularsearches--default', sel: '[class*="_clip_"]', n: 0, props: BOX }, { sel: '[data-parity="m-popular"] .popular-searches__clip', n: 0 }],
  ['PopularSearches / group title', { story: 'mobile-popularsearches--default', sel: '[class*="_groupTitle_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-popular"] .popular-searches__title', n: 0 }],
  ['PopularSearches / link', { story: 'mobile-popularsearches--default', sel: '[class*="_link_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-popular"] .popular-searches__link', n: 0 }],
  ['PopularSearches / view more', { story: 'mobile-popularsearches--default', sel: '[class*="_viewMore_"]', n: 0, props: ALL }, { sel: '[data-parity="m-popular"] .popular-searches__more', n: 0 }],
  ['MobileFooter / row', { story: 'mobile-mobilefooter--default', sel: '[class*="_row_"]', n: 0, props: BOX }, { sel: '[data-parity="m-footer"] .m-footer__row', n: 0 }],
  ['MobileFooter / label', { story: 'mobile-mobilefooter--default', sel: '[class*="_rowLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-footer"] .m-footer__label', n: 0 }],
  ['MobileFooter / badges', { story: 'mobile-mobilefooter--default', sel: '[class*="_badges_"]', n: 0, props: BOX }, { sel: '[data-parity="m-footer"] .m-footer__badges', n: 0 }],
  ['MobileFooter / copyright', { story: 'mobile-mobilefooter--default', sel: '[class*="_copyright_"]', n: 0, props: ALL }, { sel: '[data-parity="m-footer"] .m-footer__copyright', n: 0 }],
  ['FeaturedBusinesses / title', { story: 'mobile-featuredbusinesses--default', sel: '[class*="_title_"]', n: 0, props: ALL }, { sel: '[data-parity="m-featured"] .featured-businesses__title', n: 0 }],
  ['FeaturedBusinesses / item', { story: 'mobile-featuredbusinesses--default', sel: '[class*="_item_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="m-featured"] .featured-businesses__item', n: 0 }],
  ['FeaturedBusinesses / logo', { story: 'mobile-featuredbusinesses--default', sel: '[class*="_logo_"]', n: 0, props: BOX }, { sel: '[data-parity="m-featured"] .featured-businesses__logo', n: 0 }],
  ['FeaturedBusinesses / name', { story: 'mobile-featuredbusinesses--default', sel: '[class*="_name_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-featured"] .featured-businesses__name', n: 0 }],
  ['PrimeDealersRow / row', { story: 'mobile-primedealersrow--off', sel: '[class*="_row_"]', n: 0, props: BOX }, { sel: '[data-parity="m-prime"]', n: 0 }],
  ['PrimeDealersRow / label', { story: 'mobile-primedealersrow--off', sel: '[class*="_label_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-prime"] .prime-dealers__label', n: 0 }],
  ['PrimeDealersRow / track', { story: 'mobile-primedealersrow--off', sel: '[class*="_track_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-prime"] .prime-dealers__track', n: 0 }],
  ['PrimeDealersRow / knob', { story: 'mobile-primedealersrow--off', sel: '[class*="_knob_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-prime"] .prime-dealers__knob', n: 0 }],
  ['ExploreTiles / title', { story: 'mobile-exploretiles--default', sel: '[class*="_title_"]', n: 0, props: ALL }, { sel: '[data-parity="m-explore"] .explore-tiles__title', n: 0 }],
  ['ExploreTiles / tile', { story: 'mobile-exploretiles--default', sel: '[class*="_tile_"]', n: 0, props: BOX }, { sel: '[data-parity="m-explore"] .explore-tiles__tile', n: 0 }],
  ['ExploreTiles / label', { story: 'mobile-exploretiles--default', sel: '[class*="_label_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-explore"] .explore-tiles__label', n: 0 }],
  ['ExploreTiles / badge', { story: 'mobile-exploretiles--default', sel: '[class*="_badge_"]', n: 0, props: ALL }, { sel: '[data-parity="m-explore"] .explore-tiles__badge', n: 0 }],
  ['WeekRibbon / ribbon', { story: 'mobile-weekribbon--property', sel: '[class*="_ribbon_"]', n: 0, props: ALL }, { sel: '[data-parity="m-week"]', n: 0 }],
  ['AdGallery / frame', { story: 'mobile-adgallery--default', sel: '[class*="_gallery_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-gallery"]', n: 0 }],
  ['AdGallery / back', { story: 'mobile-adgallery--default', sel: '[class*="_back_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-gallery"] .ad-gallery__back', n: 0 }],
  ['AdGallery / next', { story: 'mobile-adgallery--default', sel: '[class*="_next_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-gallery"] .ad-gallery__next', n: 0 }],
  ['AdGallery / counter', { story: 'mobile-adgallery--default', sel: '[class*="_counter_"]', n: 0, props: ALL }, { sel: '[data-parity="m-gallery"] .ad-gallery__counter', n: 0 }],
  ['AdGallery / ribbon', { story: 'mobile-adgallery--default', sel: '[class*="_ribbon_"]', n: 0, props: ALL }, { sel: '[data-parity="m-gallery"] .ad-gallery__ribbon', n: 0 }],
  ['AdGallery / dot active', { story: 'mobile-adgallery--default', sel: '[class*="_active_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-gallery"] .ad-gallery__dot--active', n: 0 }],
  ['AdGallery / dot near', { story: 'mobile-adgallery--default', sel: '[class*="_near_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-gallery"] .ad-gallery__dot--near', n: 0 }],
  ['AdGallery / dot far', { story: 'mobile-adgallery--default', sel: '[class*="_far_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-gallery"] .ad-gallery__dot--far', n: 0 }],
  ['ContactBar / bar', { story: 'mobile-contactbar--default', sel: '[class*="_bar_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="m-contact-bar"]', n: 0 }],
  ['ContactBar / row', { story: 'mobile-contactbar--default', sel: '[class*="_row_"]', n: 0, props: BOX }, { sel: '[data-parity="m-contact-bar"] .contact-bar__row', n: 0 }],
  ['ContactBar / call', { story: 'mobile-contactbar--default', sel: 'button', n: 0, props: SIZED }, { sel: '[data-parity="m-contact-bar"] .contact-btn--call', n: 0 }],
  ['ContactBar / whatsapp', { story: 'mobile-contactbar--default', sel: 'button', n: 1, props: SIZED }, { sel: '[data-parity="m-contact-bar"] .contact-btn--whatsapp', n: 0 }],
  ['MegaMenu / strip label', { story: 'components-megamenu--vehicles', sel: '[class*="_label_"]', n: 1, props: ALL }, { sel: '[data-parity="mega"] .mega-nav__item:not(.is-open) .mega-nav__label', n: 0 }],
  ['MegaMenu / open label', { story: 'components-megamenu--vehicles', sel: '[class*="_labelOpen_"]', n: 0, props: ALL }, { sel: '[data-parity="mega"] .is-open > .mega-nav__label', n: 0 }],
  ['MegaMenu / column', { story: 'components-megamenu--vehicles', sel: '[class*="_column_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="mega"] .mega-menu__column', n: 0 }],
  ['MegaMenu / category', { story: 'components-megamenu--vehicles', sel: '[class*="_category_"]:not([class*="_categoryActive_"])', n: 0, props: ALL }, { sel: '[data-parity="mega"] .mega-menu__cat:not(.mega-menu__cat--active)', n: 0 }],
  ['MegaMenu / category active', { story: 'components-megamenu--vehicles', sel: '[class*="_categoryActive_"]', n: 0, props: ALL }, { sel: '[data-parity="mega"] .mega-menu__cat--active', n: 0 }],
  ['MegaMenu / category label (active)', { story: 'components-megamenu--vehicles', sel: '[class*="_categoryActive_"] [class*="_categoryLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="mega"] .mega-menu__cat--active .mega-menu__cat-label', n: 0 }],
  ['MegaMenu / panel wrap', { story: 'components-megamenu--vehicles', sel: '[class*="_panelWrap_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="mega"] .mega-menu__panel-wrap', n: 0 }],
  ['MegaMenu / panel', { story: 'components-megamenu--vehicles', sel: '[class*="_panel_"]:not([class*="_panelWrap_"]):not([class*="_panelHead_"]):not([class*="_panelTitle_"])', n: 0, props: BOX_NO_H }, { sel: '[data-parity="mega"] .mega-menu__panel', n: 0 }],
  ['MegaMenu / panel head', { story: 'components-megamenu--vehicles', sel: '[class*="_panelHead_"]', n: 0, props: BOX }, { sel: '[data-parity="mega"] .mega-menu__panel-head', n: 0 }],
  ['MegaMenu / panel title', { story: 'components-megamenu--vehicles', sel: '[class*="_panelTitle_"]', n: 0, props: ALL }, { sel: '[data-parity="mega"] .mega-menu__panel-title', n: 0 }],
  ['MegaMenu / see all', { story: 'components-megamenu--vehicles', sel: '[class*="_seeAll_"]', n: 0, props: ALL }, { sel: '[data-parity="mega"] .mega-menu__see-all', n: 0 }],
  ['MegaMenu / link', { story: 'components-megamenu--vehicles', sel: '[class*="_link_"]', n: 0, props: ALL }, { sel: '[data-parity="mega"] .mega-menu__link', n: 0 }],
  ['VerticalNav / link', { story: 'layout-verticalnav--motors', sel: '[class*="_link_"]:not([class*="_active_"])', n: 0, props: ALL }, { sel: '[data-parity="vertical-nav"] .vertical-nav__link:not(.vertical-nav__link--active)', n: 0 }],
  ['VerticalNav / active', { story: 'layout-verticalnav--motors', sel: '[class*="_active_"]', n: 0, props: ALL }, { sel: '[data-parity="vertical-nav"] .vertical-nav__link--active', n: 0 }],
  ['VerticalNav / badge', { story: 'layout-verticalnav--motors', sel: '[class*="_badge_"]', n: 0, props: ALL }, { sel: '[data-parity="vertical-nav"] .vertical-nav__badge', n: 0 }],
  ['LocationDropdown / panel', { story: 'components-locationdropdown--default', sel: '[class*="_panel_"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="location-dropdown"]', n: 0 }],
  ['LocationDropdown / search field', { story: 'components-locationdropdown--default', sel: '[class*="_searchField_"]', n: 0, props: BOX }, { sel: '[data-parity="location-dropdown"] .location-dropdown__search', n: 0 }],
  ['LocationDropdown / use current', { story: 'components-locationdropdown--default', sel: '[class*="_currentLocation_"]', n: 0, props: ALL }, { sel: '[data-parity="location-dropdown"] .location-dropdown__current', n: 0 }],
  ['LocationDropdown / section label', { story: 'components-locationdropdown--default', sel: '[class*="_sectionLabel_"]', n: 0, props: ALL }, { sel: '[data-parity="location-dropdown"] .location-dropdown__section', n: 0 }],
  ['LocationDropdown / row', { story: 'components-locationdropdown--default', sel: '[class*="_row_"]', n: 1, props: ALL }, { sel: '[data-parity="location-dropdown"] .location-dropdown__row', n: 1 }],
  ['LocationDropdown / all row label', { story: 'components-locationdropdown--default', sel: '[class*="_allLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="location-dropdown"] .location-dropdown__all', n: 0 }],
  ['SearchSuggestions / panel', { story: 'components-searchsuggestions--default', sel: '[class*="_panel_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="search-suggestions"]', n: 0 }],
  ['SearchSuggestions / row', { story: 'components-searchsuggestions--default', sel: '[class*="_row_"]:not([class*="_active_"])', n: 0, props: BOX }, { sel: '[data-parity="search-suggestions"] .search-suggestions__row:not(.search-suggestions__row--active)', n: 0 }],
  ['SearchSuggestions / active row', { story: 'components-searchsuggestions--default', sel: '[class*="_active_"]', n: 0, props: BOX }, { sel: '[data-parity="search-suggestions"] .search-suggestions__row--active', n: 0 }],
  ['SearchSuggestions / query', { story: 'components-searchsuggestions--default', sel: '[class*="_query_"]', n: 0, props: TYPE }, { sel: '[data-parity="search-suggestions"] .search-suggestions__query', n: 0 }],
  ['SearchSuggestions / category', { story: 'components-searchsuggestions--default', sel: '[class*="_category_"]', n: 0, props: TYPE }, { sel: '[data-parity="search-suggestions"] .search-suggestions__category', n: 0 }],
  ['MobileSearchPage / header', { story: 'mobile-mobilesearchpage--with-suggestions', sel: '[class*="_header_"]', n: 0, props: BOX }, { sel: '[data-parity="m-search-page"] .m-search-page__header', n: 0 }],
  ['MobileSearchPage / field', { story: 'mobile-mobilesearchpage--with-suggestions', sel: '[class*="_field_"]:not([class*="_fieldIcon_"])', n: 0, props: BOX }, { sel: '[data-parity="m-search-page"] .m-search-page__field', n: 0 }],
  ['MobileSearchPage / row', { story: 'mobile-mobilesearchpage--with-suggestions', sel: '[class*="_rowButton_"]', n: 0, props: BOX }, { sel: '[data-parity="m-search-page"] .m-search-page__row-button', n: 0 }],
  ['MobileSearchPage / active row', { story: 'mobile-mobilesearchpage--with-suggestions', sel: '[class*="_active_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="m-search-page"] .m-search-page__row--active', n: 0 }],
  ['MobileSearchPage / query', { story: 'mobile-mobilesearchpage--with-suggestions', sel: '[class*="_query_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-search-page"] .m-search-page__query', n: 0 }],
  ['MobileSearchPage / category', { story: 'mobile-mobilesearchpage--with-suggestions', sel: '[class*="_category_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-search-page"] .m-search-page__category', n: 0 }],
  ['MobileLocationPage / title', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_title_"]:not([class*="_titleRow_"])', n: 0, props: ALL }, { sel: '[data-parity="m-location-page"] .m-location-page__title', n: 0 }],
  ['MobileLocationPage / field', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_field_"]:not([class*="_fieldIcon_"])', n: 0, props: BOX }, { sel: '[data-parity="m-location-page"] .m-location-page__field', n: 0 }],
  ['MobileLocationPage / use current', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_currentLocation_"]', n: 0, props: ALL }, { sel: '[data-parity="m-location-page"] .m-location-page__current', n: 0 }],
  ['MobileLocationPage / section title', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_sectionTitle_"]', n: 0, props: ALL }, { sel: '[data-parity="m-location-page"] .m-location-page__section-title', n: 0 }],
  ['MobileLocationPage / row', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_row_"]:not([class*="_rowLabel_"])', n: 0, props: BOX }, { sel: '[data-parity="m-location-page"] .m-location-page__row', n: 0 }],
  ['MobileLocationPage / row label', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_rowLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="m-location-page"] .m-location-page__row-label', n: 0 }],
  ['MobileLocationPage / cta bar', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_ctaBar_"]', n: 0, props: BOX }, { sel: '[data-parity="m-location-page"] .m-location-page__cta-bar', n: 0 }],
  ['MobileLocationPage / cta', { story: 'mobile-mobilelocationpage--default', sel: '[class*="_cta_"]:not([class*="_ctaBar_"])', n: 0, props: ALL }, { sel: '[data-parity="m-location-page"] .m-location-page__cta', n: 0 }],
  ['UserMenu / panel', { story: 'layout-usermenu--default', sel: '[class*="_panel_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="user-menu"]', n: 0 }],
  ['UserMenu / header', { story: 'layout-usermenu--default', sel: '[class*="_header_"]', n: 0, props: BOX }, { sel: '[data-parity="user-menu"] .user-menu__header', n: 0 }],
  ['UserMenu / avatar', { story: 'layout-usermenu--default', sel: '[class*="_avatar_"]', n: 0, props: SIZED }, { sel: '[data-parity="user-menu"] .user-menu__avatar', n: 0 }],
  ['UserMenu / name', { story: 'layout-usermenu--default', sel: '[class*="_name_"]', n: 0, props: TYPE }, { sel: '[data-parity="user-menu"] .user-menu__name', n: 0 }],
  ['UserMenu / verify', { story: 'layout-usermenu--default', sel: '[class*="_verify_"]', n: 0, props: TYPE }, { sel: '[data-parity="user-menu"] .user-menu__verify', n: 0 }],
  ['UserMenu / promo', { story: 'layout-usermenu--default', sel: '[class*="_promo_"]:not([class*="_promoText_"]):not([class*="_promoTitle_"]):not([class*="_promoSubtitle_"]):not([class*="_promoIcon_"])', n: 0, props: BOX }, { sel: '[data-parity="user-menu"] .user-menu__promo', n: 0 }],
  ['UserMenu / promo title', { story: 'layout-usermenu--default', sel: '[class*="_promoTitle_"]', n: 0, props: TYPE }, { sel: '[data-parity="user-menu"] .user-menu__promo-title', n: 0 }],
  ['UserMenu / row', { story: 'layout-usermenu--default', sel: '[class*="_row_"]:not([class*="_rowLabel_"]):not([class*="_rowIcon_"])', n: 0, props: BOX }, { sel: '[data-parity="user-menu"] .user-menu__row', n: 0 }],
  ['UserMenu / row label', { story: 'layout-usermenu--default', sel: '[class*="_rowLabel_"]', n: 0, props: TYPE }, { sel: '[data-parity="user-menu"] .user-menu__row-label', n: 0 }],
  ['AccountMenu / avatar', { story: 'mobile-accountmenu--default', sel: '[class*="_avatar_"]', n: 0, props: SIZED }, { sel: '[data-parity="account-menu"] .account-menu__avatar', n: 0 }],
  ['AccountMenu / name', { story: 'mobile-accountmenu--default', sel: '[class*="_name_"]', n: 0, props: TYPE }, { sel: '[data-parity="account-menu"] .account-menu__name', n: 0 }],
  ['AccountMenu / verify', { story: 'mobile-accountmenu--default', sel: '[class*="_verify_"]:not([class*="_verifyIcon_"]):not([class*="_verifyLabel_"])', n: 0, props: BOX }, { sel: '[data-parity="account-menu"] .account-menu__verify', n: 0 }],
  ['AccountMenu / shortcut', { story: 'mobile-accountmenu--default', sel: '[class*="_shortcut_"]:not([class*="_shortcutLabel_"])', n: 0, props: BOX }, { sel: '[data-parity="account-menu"] .account-menu__shortcut', n: 0 }],
  ['AccountMenu / promo', { story: 'mobile-accountmenu--default', sel: '[class*="_promo_"]:not([class*="_promoText_"]):not([class*="_promoTitle_"]):not([class*="_promoSubtitle_"])', n: 0, props: BOX }, { sel: '[data-parity="account-menu"] .account-menu__promo', n: 0 }],
  ['AccountMenu / row', { story: 'mobile-accountmenu--default', sel: '[class*="_row_"]:not([class*="_rowText_"]):not([class*="_rowTitle_"]):not([class*="_rowSubtitle_"]):not([class*="_rowIcon_"])', n: 0, props: BOX }, { sel: '[data-parity="account-menu"] .account-menu__row', n: 0 }],
  ['AccountMenu / row title', { story: 'mobile-accountmenu--default', sel: '[class*="_rowTitle_"]', n: 0, props: TYPE }, { sel: '[data-parity="account-menu"] .account-menu__row-title', n: 0 }],
  ['AccountMenu / row subtitle', { story: 'mobile-accountmenu--default', sel: '[class*="_rowSubtitle_"]', n: 0, props: TYPE }, { sel: '[data-parity="account-menu"] .account-menu__row-subtitle', n: 0 }],
  ['Breadcrumbs / list', { story: 'components-breadcrumbs--default', sel: '[class*="_list_"]', n: 0, props: BOX_NO_H }, { sel: '[data-parity="breadcrumbs"] .breadcrumbs__list', n: 0 }],
  ['Breadcrumbs / crumb', { story: 'components-breadcrumbs--default', sel: '[class*="_crumb_"]:not([class*="_current_"])', n: 0, props: ALL }, { sel: '[data-parity="breadcrumbs"] .breadcrumbs__crumb:not(.breadcrumbs__crumb--current)', n: 0 }],
  ['Breadcrumbs / current', { story: 'components-breadcrumbs--default', sel: '[class*="_current_"]', n: 0, props: TYPE }, { sel: '[data-parity="breadcrumbs"] .breadcrumbs__crumb--current', n: 0 }],
  ['Breadcrumbs / separator', { story: 'components-breadcrumbs--default', sel: '[class*="_separator_"]', n: 0, props: ALL }, { sel: '[data-parity="breadcrumbs"] .breadcrumbs__separator', n: 0 }],
  ['PageHead / title', { story: 'components-pagehead--with-save-search', sel: 'h1', n: 0, props: ALL }, { sel: '[data-parity="page-head-row"] .page-head-row__title', n: 0 }],
  ['PageHead / count', { story: 'components-pagehead--with-save-search', sel: '[class*="_count_"]', n: 0, props: ALL }, { sel: '[data-parity="page-head-row"] .page-head-row__count', n: 0 }],
  ['PageHead / actions', { story: 'components-pagehead--with-save-search', sel: '[class*="_actions_"]', n: 0, props: BOX }, { sel: '[data-parity="page-head-row"] .page-head-row__actions', n: 0 }],
  // Overlays & feedback
  ['Toast / box', { story: 'feedback-toast--success', sel: '[role="status"]', n: 0, props: SIZED }, { sel: '[data-parity="toast"]', n: 0 }],
  ['Toast / icon', { story: 'feedback-toast--success', sel: 'img', n: 0, props: SIZED }, { sel: '[data-parity="toast"] .toast__icon', n: 0 }],
  ['Toast / message', { story: 'feedback-toast--success', sel: '[class*="_main_"]', n: 0, props: TYPE }, { sel: '[data-parity="toast"] .toast__main', n: 0 }],
  ['Dialog / panel', { story: 'feedback-logindialog--default', sel: '[role="dialog"]', n: 0, props: SIZED_NO_W }, { sel: '[data-parity="login-dialog"]', n: 0 }],
  ['LoginDialog / title', { story: 'feedback-logindialog--default', sel: '[class*="_title_"]', n: 0, props: ALL }, { sel: '[data-parity="login-dialog"] .login-dialog__title', n: 0 }],
  ['LoginDialog / logo', { story: 'feedback-logindialog--default', sel: '[class*="_logo_"]', n: 0, props: SIZED }, { sel: '[data-parity="login-dialog"] .login-dialog__logo', n: 0 }],
  ['LoginDialog / provider', { story: 'feedback-logindialog--default', sel: '[class*="_provider_"]', n: 0, props: SIZED }, { sel: '[data-parity="login-dialog"] .login-dialog__provider', n: 0 }],
  ['LoginDialog / or', { story: 'feedback-logindialog--default', sel: '[class*="_or_"]', n: 0, props: [...ALL, 'marginTop'] }, { sel: '[data-parity="login-dialog"] .login-dialog__or', n: 0 }],
  ['LoginDialog / create', { story: 'feedback-logindialog--default', sel: '[class*="_create_"]', n: 0, props: [...ALL, 'marginTop'] }, { sel: '[data-parity="login-dialog"] .login-dialog__create', n: 0 }],
  ['SortMenu / menu', { story: 'components-sortmenu--default', sel: '[role="listbox"]', n: 0, props: SIZED }, { sel: '[data-parity="sort-menu"]', n: 0 }],
  ['SortMenu / chosen', { story: 'components-sortmenu--default', sel: '[role="option"]', n: 0, props: SIZED }, { sel: '[data-parity="sort-menu"] .sort-menu__row', n: 0 }],
  ['SortMenu / row', { story: 'components-sortmenu--default', sel: '[role="option"]', n: 1, props: SIZED }, { sel: '[data-parity="sort-menu"] .sort-menu__row', n: 1 }],
  ['MobileFilters / header', { story: 'mobile-mobilefilters--page', sel: 'header', n: 0, props: SIZED }, { sel: '[data-parity="m-filters"] .m-filters__header', n: 0 }],
  ['MobileFilters / searching', { story: 'mobile-mobilefilters--page', sel: '[class*="_searching_"]', n: 0, props: ALL }, { sel: '[data-parity="m-filters"] .m-filters__searching', n: 0 }],
  ['MobileFilters / reset', { story: 'mobile-mobilefilters--page', sel: '[class*="_reset_"]', n: 0, props: ALL }, { sel: '[data-parity="m-filters"] .m-filters__reset', n: 0 }],
  ['MobileFilters / section title', { story: 'mobile-mobilefilters--page', sel: '[class*="_sectionTitle_"]', n: 0, props: [...ALL, 'marginBottom'] }, { sel: '[data-parity="m-filters"] .m-filters__section-title', n: 0 }],
  ['MobileFilters / field', { story: 'mobile-mobilefilters--page', sel: '[class*="_field_"]', n: 1, props: SIZED }, { sel: '[data-parity="m-filters"] .m-filters__field', n: 1 }],
  ['MobileFilters / range box', { story: 'mobile-mobilefilters--page', sel: '[class*="_rangeBox_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-filters"] .m-filters__range-box', n: 0 }],
  ['MobileFilters / suffix', { story: 'mobile-mobilefilters--page', sel: '[class*="_suffix_"]', n: 0, props: ALL }, { sel: '[data-parity="m-filters"] .m-filters__suffix', n: 0 }],
  ['MobileFilters / chip', { story: 'mobile-mobilefilters--page', sel: '[class*="_chip_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-filters"] .m-filters__chip', n: 0 }],
  ['MobileFilters / results', { story: 'mobile-mobilefilters--page', sel: '[class*="_results_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-filters"] .m-filters__results', n: 0 }],
  // Agency portal — repo horizontal/agencyPortal/components, measured on live
  ['AgencyPageHeading / title', { story: 'agency-portal-agencypageheading--with-subtitle', sel: 'h1', n: 0, props: ALL }, { sel: '[data-parity="agency-heading"] .agency-heading__title', n: 0 }],
  ['AgencyPageHeading / subtitle', { story: 'agency-portal-agencypageheading--with-subtitle', sel: 'p', n: 0, props: ALL }, { sel: '[data-parity="agency-heading"] .agency-heading__subtitle', n: 0 }],
  ['PortalTabs sm / frame', { story: 'agency-portal-agencyportaltabswitcher--leads', sel: '[role="tablist"]', n: 0, props: SIZED }, { sel: '[data-parity="portal-tabs-sm"]', n: 0 }],
  ['PortalTabs sm / active', { story: 'agency-portal-agencyportaltabswitcher--leads', sel: '[role="tab"]', n: 0, props: SIZED }, { sel: '[data-parity="portal-tabs-sm"] .portal-tabs__tab', n: 0 }],
  ['PortalTabs sm / resting', { story: 'agency-portal-agencyportaltabswitcher--leads', sel: '[role="tab"]', n: 2, props: SIZED }, { sel: '[data-parity="portal-tabs-sm"] .portal-tabs__tab', n: 2 }],
  ['PortalTabs sm / rule', { story: 'agency-portal-agencyportaltabswitcher--leads', sel: '[class*="_text_"]', n: 2, props: [...ALL, 'borderLeftWidth', 'borderLeftColor', 'marginTop'] }, { sel: '[data-parity="portal-tabs-sm"] .portal-tabs__text', n: 2 }],
  ['PortalTabs md / tab', { story: 'agency-portal-agencyportaltabswitcher--credit-info', sel: '[role="tab"]', n: 1, props: SIZED }, { sel: '[data-parity="portal-tabs-md"] .portal-tabs__tab', n: 1 }],
  ['AdState / active', { story: 'agency-portal-adstate--all-states', sel: '[class*="_state_"]', n: 0, props: SIZED }, { sel: '[data-parity="ad-states"] .ad-state', n: 0 }],
  ['AdState / expired', { story: 'agency-portal-adstate--all-states', sel: '[class*="_state_"]', n: 1, props: SIZED }, { sel: '[data-parity="ad-states"] .ad-state', n: 1 }],
  ['AdState / rejected', { story: 'agency-portal-adstate--all-states', sel: '[class*="_state_"]', n: 4, props: SIZED }, { sel: '[data-parity="ad-states"] .ad-state', n: 4 }],
  ['AdStateFilter / selected', { story: 'agency-portal-adstatefilter--default', sel: 'button', n: 0, props: SIZED }, { sel: '[data-parity="state-filter"] .state-filter__choice', n: 0 }],
  ['AdStateFilter / resting', { story: 'agency-portal-adstatefilter--default', sel: 'button', n: 1, props: SIZED }, { sel: '[data-parity="state-filter"] .state-filter__choice', n: 1 }],
  ['PortalSearchInput / box', { story: 'agency-portal-portalsearchinput--default', sel: 'label', n: 0, props: SIZED }, { sel: '[data-parity="portal-search"]', n: 0 }],
  ['PortalSearchInput / input', { story: 'agency-portal-portalsearchinput--default', sel: 'input', n: 0, props: ALL }, { sel: '[data-parity="portal-search"] input', n: 0 }],
  ['PortalSelect / field', { story: 'agency-portal-multiplechoicedropdown--closed', sel: 'button', n: 0, props: BOX }, { sel: '[data-parity="portal-select-closed"] .portal-select__field', n: 0 }],
  ['PortalSelect / title', { story: 'agency-portal-multiplechoicedropdown--closed', sel: '[class*="_title_"]', n: 0, props: TYPE }, { sel: '[data-parity="portal-select-closed"] .portal-select__title', n: 0 }],
  ['PortalMenu / panel', { story: 'agency-portal-multiplechoicedropdown--open-checklist', sel: '[role="listbox"]', n: 0, props: SIZED }, { sel: '[data-parity="portal-select-open"] .portal-menu', n: 0 }],
  ['PortalMenu / entry', { story: 'agency-portal-multiplechoicedropdown--open-checklist', sel: '[role="option"]', n: 0, props: SIZED }, { sel: '[data-parity="portal-select-open"] .portal-menu__entry', n: 0 }],
  ['PortalMenu / box on', { story: 'agency-portal-multiplechoicedropdown--open-checklist', sel: '[class*="_box_"]', n: 3, props: SIZED }, { sel: '[data-parity="portal-select-open"] .portal-menu__box', n: 3 }],
  ['PortalMenu / box off', { story: 'agency-portal-multiplechoicedropdown--open-checklist', sel: '[class*="_box_"]', n: 0, props: SIZED }, { sel: '[data-parity="portal-select-open"] .portal-menu__box', n: 0 }],
  ['SideDialog large / panel', { story: 'agency-portal-sidedialog--ad-details-drawer', sel: '[role="dialog"]', n: 0, props: ALL }, { sel: '[data-parity="side-dialog"]', n: 0 }],
  ['SortBy / button', { story: 'components-sortby--default', sel: 'button', n: 0, props: BOX }, { sel: '[data-parity="sort-by"]', n: 0 }],
  ['SortBy / label', { story: 'components-sortby--default', sel: '[class*="_label_"]', n: 0, props: TYPE }, { sel: '[data-parity="sort-by"] .sort-by__label', n: 0 }],
  ['SortBy / value', { story: 'components-sortby--default', sel: '[class*="_value_"]', n: 0, props: TYPE }, { sel: '[data-parity="sort-by"] .sort-by__value', n: 0 }],
  ['AppBanner compact / banner', { story: 'mobile-appbanner--compact', sel: '[class*="_banner_"]', n: 0, props: BOX }, { sel: '[data-parity="m-banner-compact"]', n: 0 }],
  ['AppBanner compact / icon', { story: 'mobile-appbanner--compact', sel: '[class*="_appIcon_"]', n: 0, props: SIZED }, { sel: '[data-parity="m-banner-compact"] .app-banner__icon', n: 0 }],
  ['AppBanner compact / cta', { story: 'mobile-appbanner--compact', sel: '[class*="_cta_"]', n: 0, props: ALL }, { sel: '[data-parity="m-banner-compact"] .app-banner__cta', n: 0 }],
];

async function read(page, sel, n = 0, props = ALL) {
  return page.evaluate(
    (sel, n, props) => {
      const el = document.querySelectorAll(sel)[n];
      if (!el) return null;
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, p === 'fontFamily' ? cs[p].split(',')[0].replace(/["']/g, '').trim() : cs[p]]));
    },
    sel,
    n,
    props,
  );
}

/** Sub-pixel noise from rem math and rounding isn't drift. */
function same(a, b) {
  if (a === b) return true;
  const na = parseFloat(a);
  const nb = parseFloat(b);
  return /^-?[\d.]+px$/.test(a) && /^-?[\d.]+px$/.test(b) && Math.abs(na - nb) < 0.6;
}

const profile = mkdtempSync(join(tmpdir(), 'dbz-parity-'));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, userDataDir: profile });
const kit = await browser.newPage();
await kit.setViewport({ width: 1440, height: 900 });
await kit.goto(`${KIT}/index.html`, { waitUntil: 'networkidle0', timeout: 60_000 });

const sb = await browser.newPage();
await sb.setViewport({ width: 1440, height: 900 });

let mismatched = 0;
let missing = 0;
const lines = [];
let currentStory = null;
for (const [name, react, html] of PAIRS) {
  if (react.story !== currentStory) {
    await sb.goto(`${SB}/iframe.html?id=${react.story}&viewMode=story`, { waitUntil: 'networkidle0', timeout: 60_000 });
    await sb.waitForSelector('#storybook-root > *', { timeout: 30_000 });
    currentStory = react.story;
  }
  const props = react.props ?? ALL;
  const a = await read(sb, react.sel.split(',').map((x) => (x.trim().startsWith('#storybook-root') ? x : `#storybook-root ${x.trim()}`)).join(', '), react.n, props);
  const b = await read(kit, html.sel, html.n, props);
  if (!a || !b) {
    missing++;
    lines.push(`MISSING  ${name}: ${!a ? 'storybook' : ''}${!a && !b ? ' + ' : ''}${!b ? 'kit' : ''} element not found`);
    continue;
  }
  const diffs = props.filter((p) => !same(a[p], b[p]));
  if (diffs.length) {
    mismatched++;
    lines.push(`DIFF     ${name}`);
    for (const p of diffs) lines.push(`           ${p.padEnd(20)} storybook ${String(a[p]).slice(0, 60).padEnd(34)} kit ${String(b[p]).slice(0, 60)}`);
  } else {
    lines.push(`same     ${name}`);
  }
}

await browser.close();
rmSync(profile, { recursive: true, force: true });
console.log(lines.join('\n'));
console.log(`\n${PAIRS.length - mismatched - missing} identical, ${mismatched} differ, ${missing} not found`);
process.exit(mismatched || missing ? 1 : 0);
