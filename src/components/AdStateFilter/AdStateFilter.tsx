import { cx } from '../../utils/cx';
import styles from './AdStateFilter.module.css';

export interface AdStateFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface AdStateFilterProps {
  options: AdStateFilterOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** The status filters live shows above the Agency Ads list. */
export const AD_STATE_FILTERS: AdStateFilterOption[] = [
  { value: 'all', label: 'View all', count: 162 },
  { value: 'active', label: 'Active Ads', count: 5 },
  { value: 'inactive', label: 'Inactive Ads', count: 80 },
  { value: 'pending', label: 'Pending Ads', count: 61 },
  { value: 'moderated', label: 'Moderated Ads', count: 15 },
  { value: 'expiring', label: 'Expiring Soon Ads', count: 0 },
  { value: 'expired', label: 'Expired Ads', count: 1 },
];

/**
 * Ad status filter pills. Repo: horizontal/agencyPortal/agencyAds/stateFilter.tsx, drawn with
 * roundedButtonChoice "selectedSecondary". Live: 34 tall, 8/16 padding, radius 6, 1px
 * secondary-light-grey; selected is charcoal-bordered on gray-00, bold.
 */
export function AdStateFilter({ options, value, onChange, className }: AdStateFilterProps) {
  return (
    <div className={cx(styles.row, className)} role="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} className={cx(styles.choice, on && styles.selected)} onClick={() => onChange?.(o.value)}>
            {o.count === undefined ? o.label : `${o.label} (${o.count})`}
          </button>
        );
      })}
    </div>
  );
}
