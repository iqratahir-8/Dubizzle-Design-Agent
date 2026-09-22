import { cx } from '../../utils/cx';
import styles from './MoreFiltersPanel.module.css';

export interface MoreFiltersField { label: string; placeholder?: string; value?: string }
export interface MoreFiltersPanelProps {
  fields?: MoreFiltersField[];
  onChange?: (label: string, value: string) => void;
  onReset?: () => void;
  onApply?: () => void;
  assetsPath?: string;
  className?: string;
}

/**
 * "More Filters" on Agency Ads. Repo: horizontal/agencyPortal/agencyAds/filters.
 * Live (portal-ads-more-filters): 27.2rem panel 8px under the button, 16px padding,
 * radius 6, --shadow-filter-menu; bold 14/21 labels over the portal's 48px search fields (live
 * puts the search glyph in both); Reset / Apply
 * side by side, 11rem × 40, 10px above.
 */
export function MoreFiltersPanel({ fields = [{ label: 'Agent Code' }, { label: 'Phone Number' }], onChange, onReset, onApply, assetsPath = '/assets', className }: MoreFiltersPanelProps) {
  return (
    <div className={cx(styles.panel, className)}>
      {fields.map((f) => (
        <label key={f.label} className={styles.field}>
          <span className={styles.label}>{f.label}</span>
          <span className={styles.box}><img className={styles.icon} src={`${assetsPath}/live-icons/search-portal.svg`} alt="" width={24} height={25} /><input className={styles.input} placeholder={f.placeholder ?? f.label} value={f.value} onChange={(e) => onChange?.(f.label, e.target.value)} /></span>
        </label>
      ))}
      <div className={styles.actions}>
        <button type="button" className={styles.reset} onClick={onReset}>Reset</button>
        <button type="button" className={styles.apply} onClick={onApply}>Apply</button>
      </div>
    </div>
  );
}
