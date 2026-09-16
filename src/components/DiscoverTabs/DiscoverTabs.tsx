import { cx } from '../../utils/cx';
import styles from './DiscoverTabs.module.css';

export interface DiscoverTab {
  label: string;
  subtitle?: string;
  /** Red "New" pill after the label. */
  badge?: string;
}

export interface DiscoverTabsProps {
  tabs: DiscoverTab[];
  active?: string;
  onChange?: (label: string) => void;
  className?: string;
}

/**
 * "Discover Listings" tabs on the mobile home page (dubizzle.com.eg): equal-width tabs with a
 * subtitle; the active one has a 2px red underline, the rest a hairline.
 */
export function DiscoverTabs({ tabs, active, onChange, className }: DiscoverTabsProps) {
  const current = active ?? tabs[0]?.label;
  return (
    <div className={cx(styles.tabs, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={tab.label === current}
          className={cx(styles.tab, tab.label === current && styles.active)}
          onClick={() => onChange?.(tab.label)}
        >
          <span className={styles.head}>
            <span className={styles.label}>{tab.label}</span>
            {tab.badge && <span className={styles.badge}>{tab.badge}</span>}
          </span>
          {tab.subtitle && <span className={styles.subtitle}>{tab.subtitle}</span>}
        </button>
      ))}
    </div>
  );
}
