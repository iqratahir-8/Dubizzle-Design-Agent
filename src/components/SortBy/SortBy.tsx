import { cx } from '../../utils/cx';
import { ChevronDownIcon } from '../icons';
import styles from './SortBy.module.css';

export interface SortByProps {
  /** Text before the value; live writes "Sort by:". */
  label?: string;
  value: string;
  onClick?: () => void;
  className?: string;
}

/** The sort options live offers on a cars listing. */
export const SORT_OPTIONS = ['Newly listed', 'Price: low to high', 'Price: high to low', 'Mileage: low to high'];

/**
 * The "Sort by: …" trigger above listing results — a text button that opens the sort menu
 * (a bottom sheet on mobile). Measured on the live cars search page
 * (docs/LIVE-MEASUREMENTS.md): label 14/21, value 16/400, 4px apart.
 */
export function SortBy({ label = 'Sort by:', value, onClick, className }: SortByProps) {
  return (
    <button type="button" className={cx(styles.button, className)} onClick={onClick}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <ChevronDownIcon className={styles.chevron} size={24} />
    </button>
  );
}
