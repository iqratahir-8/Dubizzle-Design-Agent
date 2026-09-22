import { cx } from '../../utils/cx';
import { ChevronRightIcon, LocationPinIcon } from '../icons';
import styles from './MobileFilters.module.css';

/*
 * The mobile filters page (full screen on live, not a sheet). Repo:
 * dubizzle-facelift/search/compact/filtersDialog.tsx (+ search/filters/range.tsx,
 * priceFilter.tsx, compact/confirmButton.tsx). Measured on the live capture
 * m-filters.mobile (2026-09-22): header 56 tall, 6/16 padding, 1px gray-02 rule;
 * sections 16px in, 32px apart, title 15.96/700 then 8px; fields 8px further in,
 * 40 tall, 1px gray-02, radius 6, 12px padding; range = two 152px boxes around "To"
 * with 12px each side; chips 34 tall, 8/16, 1px gray-03, radius 6, 8px apart;
 * results bar 16px padding, 1px gray-02 top rule, red 40px button, 15.96/700.
 */

export interface FiltersHeaderProps {
  category: string;
  onClose?: () => void;
  onReset?: () => void;
  onCategory?: () => void;
  /** Reset is grey until a filter is set. */
  canReset?: boolean;
  assetsPath?: string;
}
export function FiltersHeader({ category, onClose, onReset, onCategory, canReset = false, assetsPath = '/assets' }: FiltersHeaderProps) {
  return (
    <header className={styles.header}>
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}><img src={`${assetsPath}/live-icons/close-filters.svg`} alt="" width={18} height={18} /></button>
      <button type="button" className={styles.searching} onClick={onCategory}>
        <span className={styles.searchingLabel}>Searching for</span> <span className={styles.searchingValue}>{category}</span>
        <img src={`${assetsPath}/live-icons/chevron-down-small.svg`} alt="" width={12} height={20} />
      </button>
      <button type="button" className={cx(styles.reset, canReset && styles.resetOn)} onClick={onReset} disabled={!canReset}>Reset</button>
    </header>
  );
}

export interface FilterSectionProps { title: string; children?: React.ReactNode }
export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className={styles.section}>
      <span className={styles.sectionTitle}>{title}</span>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export interface FilterFieldProps {
  value?: string;
  placeholder?: string;
  /** location — leading pin; picker — trailing chevron. */
  kind?: 'location' | 'picker';
  onClick?: () => void;
}
export function FilterField({ value, placeholder = 'Choose', kind = 'picker', onClick }: FilterFieldProps) {
  return (
    <button type="button" className={cx(styles.field, !value && styles.fieldEmpty)} onClick={onClick}>
      {kind === 'location' && <LocationPinIcon size={16} className={styles.pin} />}
      <span className={styles.fieldText}>{value || placeholder}</span>
      {kind === 'picker' && <ChevronRightIcon size={12} className={styles.fieldChevron} />}
    </button>
  );
}

export interface RangeFilterProps {
  min?: string;
  max?: string;
  onChange?: (min: string, max: string) => void;
  /** e.g. "EGP" — shown inside both boxes on the right. */
  suffix?: string;
}
export function RangeFilter({ min = '', max = '', onChange, suffix }: RangeFilterProps) {
  return (
    <div className={styles.range}>
      <label className={styles.rangeBox}>
        <input className={styles.rangeInput} inputMode="numeric" placeholder="Min" value={min} onChange={(e) => onChange?.(e.target.value, max)} />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </label>
      <span className={styles.to}>To</span>
      <label className={styles.rangeBox}>
        <input className={styles.rangeInput} inputMode="numeric" placeholder="Max" value={max} onChange={(e) => onChange?.(min, e.target.value)} />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </label>
    </div>
  );
}

export interface ChoiceChipsProps { options: string[]; value?: string[]; onChange?: (v: string[]) => void }
export function ChoiceChips({ options, value = [], onChange }: ChoiceChipsProps) {
  return (
    <div className={styles.chips}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} className={cx(styles.chip, on && styles.chipOn)} onClick={() => onChange?.(on ? value.filter((v) => v !== o) : [...value, o])}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export interface ResultsBarProps { label: string; onClick?: () => void }
export function ResultsBar({ label, onClick }: ResultsBarProps) {
  return (
    <div className={styles.resultsBar}>
      <button type="button" className={styles.results} onClick={onClick}>{label}</button>
    </div>
  );
}
