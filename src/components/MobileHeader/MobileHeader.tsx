import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Chip } from '../Chip';
import {
  BackIcon,
  ChevronDownIcon,
  DubizzleLogo,
  FiltersIcon,
  HeartIcon,
  LocationPinIcon,
  SearchIcon,
  VerticalMotorsIcon,
  VerticalPropertyIcon,
} from '../icons';
import styles from './MobileHeader.module.css';

/**
 * - `home` / `motors`: the landing header — Dubizzle / Motors / Property tiles over a search field.
 * - `property`: the listing-page header — back, search field with ad count, filter bar.
 */
export type MobileHeaderPage = 'home' | 'motors' | 'property';

/**
 * Landing header states, as the page scrolls (measured on dubizzle.com.eg):
 * 1. `full`      — tiles with icons, search, location (top of page)
 * 2. `minimized` — tiles shrink to labels only, location hidden
 * 3. `search`    — tiles collapse, search field only (motors; home stops at minimized)
 */
export type MobileHeaderState = 'full' | 'minimized' | 'search';

export interface MobileHeaderFilter {
  label: string;
  selected?: boolean;
}

export interface MobileHeaderProps {
  page?: MobileHeaderPage;
  state?: MobileHeaderState;
  searchPlaceholder?: string;
  /** Listing header: shown after the placeholder, e.g. "200,000+ ads". */
  adCount?: string;
  location?: string;
  /** Listing header filter bar. */
  filters?: MobileHeaderFilter[];
  appliedFilters?: number;
  onSearch?: () => void;
  onBack?: () => void;
  onLocation?: () => void;
  onFavourites?: () => void;
  className?: string;
}

const PLACEHOLDER: Record<MobileHeaderPage, string> = {
  home: 'Search for great finds',
  motors: 'Search by Car Model',
  property: 'Properties for Sale & Rent in Egypt',
};

function Tile({ active, label, icon, logo, logoSize = [54, 30] }: { active: boolean; label?: string; icon?: ReactNode; logo?: boolean; logoSize?: [number, number] }) {
  return (
    <a className={cx(styles.tile, active && styles.tileActive)} href="#" aria-current={active ? 'page' : undefined}>
      {logo ? (
        <DubizzleLogo width={logoSize[0]} height={logoSize[1]} aria-label="dubizzle" />
      ) : (
        <span className={styles.tileBody}>
          <span className={styles.tileIcon}>{icon}</span>
          <span className={styles.tileLabel}>{label}</span>
        </span>
      )}
    </a>
  );
}

/** Mobile web header — landing states and the listing header, as they appear on dubizzle.com.eg. */
export function MobileHeader({
  page = 'home',
  state = 'full',
  searchPlaceholder,
  adCount,
  location = 'Egypt',
  filters = [
    { label: 'Properties' },
    { label: 'Price' },
    { label: 'Egypt' },
  ],
  appliedFilters = 1,
  onSearch,
  onBack,
  onLocation,
  onFavourites,
  className,
}: MobileHeaderProps) {
  const placeholder = searchPlaceholder ?? PLACEHOLDER[page];

  if (page === 'property') {
    return (
      <header className={cx(styles.listing, className)}>
        <div className={styles.listingSearchRow}>
          <button type="button" className={styles.back} aria-label="Back" onClick={onBack}>
            <BackIcon size={24} />
          </button>
          <button type="button" className={styles.searchButton} onClick={onSearch}>
            <SearchIcon size={16} />
            <span className={styles.placeholder}>
              {placeholder}
              {adCount && <span className={styles.adCount}>({adCount})</span>}
            </span>
          </button>
        </div>
        <div className={styles.filterBar}>
          <Chip variant="filter" device="mobile" selected icon={<FiltersIcon size={16} />} count={appliedFilters} aria-label="Filters" />
          <div className={styles.filterScroller}>
            {filters.map((filter) => (
              <Chip key={filter.label} variant="filter" device="mobile" label={filter.label} selected={filter.selected} caret />
            ))}
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className={cx(styles.landing, styles[page], styles[state], className)}>
      <header className={styles.bar}>
        <nav className={styles.tiles} aria-label="Verticals">
          {/* Motors shows the larger lock-up (with "formerly OLX") until the header minimizes */}
          <Tile logo active={page === 'home'} logoSize={page === 'motors' ? [64, state === 'full' ? 42 : 24] : [54, 30]} />
          <Tile active={page === 'motors'} label="Motors" icon={<VerticalMotorsIcon size={24} />} />
          <Tile active={false} label="Property" icon={<VerticalPropertyIcon size={24} />} />
        </nav>
        <div className={styles.searchRow}>
          <button type="button" className={styles.searchButton} onClick={onSearch}>
            <SearchIcon size={16} />
            <span className={styles.placeholder}>{placeholder}</span>
          </button>
          {page === 'home' && (
            <button type="button" className={styles.favourites} aria-label="Favourites" onClick={onFavourites}>
              <HeartIcon size={24} />
            </button>
          )}
        </div>
        {page === 'motors' && state === 'full' && (
          <button type="button" className={styles.location} onClick={onLocation}>
            <LocationPinIcon size={15} />
            <span>{location}</span>
            <ChevronDownIcon size={16} />
          </button>
        )}
      </header>
      {page === 'home' && state === 'full' && (
        <button type="button" className={cx(styles.location, styles.locationBelow)} onClick={onLocation}>
          <LocationPinIcon size={17} />
          <span>{location}</span>
          <ChevronDownIcon size={12} />
        </button>
      )}
    </div>
  );
}
