import { cx } from '../../utils/cx';
import styles from './AgencyPortalTabSwitcher.module.css';

export interface PortalTab {
  value: string;
  label: string;
  /** Rendered as "Label (n)", like live. */
  count?: number;
}

export interface AgencyPortalTabSwitcherProps {
  tabs: PortalTab[];
  value: string;
  onChange?: (value: string) => void;
  /**
   * md — 43px tall (Credit Info, the ad details drawer). sm — 38px (Leads, Candidates,
   * VIP Leads, Insights). Both measured on live.
   */
  size?: 'md' | 'sm';
  className?: string;
}

/**
 * Segmented tab switcher of the agency portal. Repo: horizontal/agencyPortal/components/
 * agencyPortalTabSwitcher.tsx ("secondary" style — every portal screen uses it). A 1px
 * red-03 frame, white tabs split by grey rules, the active tab red on pale red, bold.
 */
export function AgencyPortalTabSwitcher({ tabs, value, onChange, size = 'md', className }: AgencyPortalTabSwitcherProps) {
  return (
    <div className={cx(styles.switcher, styles[size], className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cx(styles.tab, active && styles.active)}
            onClick={() => onChange?.(t.value)}
          >
            <span className={styles.text}>{t.count === undefined ? t.label : `${t.label} (${t.count})`}</span>
          </button>
        );
      })}
    </div>
  );
}
