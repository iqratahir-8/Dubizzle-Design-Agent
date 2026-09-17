import { cx } from '../../utils/cx';
import fixtures from '../../../design-kit/content/fixtures.json';
import styles from './MobileLocationPage.module.css';

export interface MobileLocationRow {
  label: string;
  /** Regions open a further level and show a chevron; popular locations don't. */
  chevron?: boolean;
}

export interface MobileLocationSection {
  title: string;
  rows: MobileLocationRow[];
}

export interface MobileLocationPageProps {
  title?: string;
  value?: string;
  placeholder?: string;
  currentLocationLabel?: string;
  sections?: MobileLocationSection[];
  /** Label of the sticky confirm button, e.g. "Select Egypt". */
  ctaLabel?: string;
  onClose?: () => void;
  onChange?: (value: string) => void;
  onUseCurrentLocation?: () => void;
  onSelect?: (label: string) => void;
  onConfirm?: () => void;
  className?: string;
}

/** What live lists: a few popular cities, then every governorate (design-kit/content/fixtures.json). */
export const LOCATION_SECTIONS: MobileLocationSection[] = [
  {
    title: 'Popular Locations',
    rows: ['Cairo', 'Giza', 'Alexandria', 'Matruh', 'Red Sea'].map((label) => ({ label: `${label}, Egypt` })),
  },
  {
    title: 'Choose Region',
    rows: fixtures.locations.governorates.map((label) => ({ label: `${label}, Egypt`, chevron: true })),
  },
];

/**
 * Location on mobile is a page, not a dropdown: the header's location row opens this, with a
 * close button, a search field, "Use current location", the lists, and a sticky confirm button.
 * Measured on the live mobile home (docs/LIVE-MEASUREMENTS.md).
 */
export function MobileLocationPage({
  title = 'Location',
  value = '',
  placeholder = 'Search for great finds',
  currentLocationLabel = 'Use current location',
  sections = LOCATION_SECTIONS,
  ctaLabel = 'Select Egypt',
  onClose,
  onChange,
  onUseCurrentLocation,
  onSelect,
  onConfirm,
  className,
}: MobileLocationPageProps) {
  return (
    <div className={cx(styles.page, className)}>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <span className={styles.title}>{title}</span>
        </div>

        <div className={styles.field}>
          <svg className={styles.fieldIcon} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input className={styles.input} type="search" value={value} placeholder={placeholder} onChange={(event) => onChange?.(event.target.value)} />
        </div>

        <button type="button" className={styles.currentLocation} onClick={onUseCurrentLocation}>
          <svg className={styles.currentIcon} width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 3L3 10.5l7.5 3 3 7.5L21 3z" />
          </svg>
          {currentLocationLabel}
        </button>

        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <span className={styles.sectionTitle}>{section.title}</span>
            {section.rows.map((row) => (
              <button key={row.label} type="button" className={styles.row} onClick={() => onSelect?.(row.label)}>
                <span className={styles.rowLabel}>{row.label}</span>
                {row.chevron && (
                  <svg className={styles.chevron} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </section>
        ))}
      </div>

      <div className={styles.ctaBar}>
        <button type="button" className={styles.cta} onClick={onConfirm}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
