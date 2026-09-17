import { cx } from '../../utils/cx';
import fixtures from '../../../design-kit/content/fixtures.json';
import styles from './LocationDropdown.module.css';

export interface LocationOption {
  label: string;
  /** Rows that open a further level (a governorate with areas) show a chevron. */
  chevron?: boolean;
}

export interface LocationDropdownProps {
  /** Placeholder in the panel's own search field. */
  searchPlaceholder?: string;
  /** "See ads in all Egypt" — the red row above the list. */
  allLabel?: string;
  /** Section label above the list. */
  chooseLabel?: string;
  currentLocationLabel?: string;
  options?: LocationOption[];
  onSelect?: (label: string) => void;
  onUseCurrentLocation?: () => void;
  className?: string;
}

/** Egypt's governorates, in the order the live dropdown lists them (design-kit/content/fixtures.json). */
export const EGYPT_LOCATIONS: LocationOption[] = fixtures.locations.governorates.map((label) => ({
  label,
  chevron: true,
}));

/**
 * The location dropdown under the header's location field: its own search field, "Use current
 * location", then the governorate list. Measured on the live header (docs/LIVE-MEASUREMENTS.md):
 * 303 wide, 4px radius, the two-part shadow live uses for header overlays.
 */
export function LocationDropdown({
  searchPlaceholder = 'Search for location',
  allLabel = 'See ads in all Egypt',
  chooseLabel = 'Choose location',
  currentLocationLabel = 'Use current location',
  options = EGYPT_LOCATIONS,
  onSelect,
  onUseCurrentLocation,
  className,
}: LocationDropdownProps) {
  return (
    <div className={cx(styles.panel, className)}>
      <div className={styles.searchField}>
        <input className={styles.searchInput} type="search" placeholder={searchPlaceholder} />
      </div>

      <button type="button" className={styles.currentLocation} onClick={onUseCurrentLocation}>
        <svg className={styles.locationIcon} width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" strokeLinecap="round" />
        </svg>
        {currentLocationLabel}
      </button>

      <span className={styles.sectionLabel}>{chooseLabel}</span>

      <div className={styles.list}>
        <button type="button" className={cx(styles.row, styles.allRow)} onClick={() => onSelect?.(allLabel)}>
          <span className={styles.allLabel}>{allLabel}</span>
        </button>
        {options.map((option) => (
          <button key={option.label} type="button" className={styles.row} onClick={() => onSelect?.(option.label)}>
            <span className={styles.rowLabel}>{option.label}</span>
            {option.chevron && (
              <svg className={styles.chevron} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
