import { cx } from '../../utils/cx';
import { SaveSearchIcon, SortIcon } from '../icons';
import styles from './SortSaveBar.module.css';

export interface SortSaveBarProps {
  onSort?: () => void;
  onSave?: () => void;
  className?: string;
}

/** Floating "Sort | Save" bar at the bottom of mobile listing pages (dubizzle.com.eg). */
export function SortSaveBar({ onSort, onSave, className }: SortSaveBarProps) {
  return (
    <div className={cx(styles.bar, className)}>
      <button type="button" className={styles.action} onClick={onSort}>
        <SortIcon size={20} />
        Sort
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <button type="button" className={styles.action} onClick={onSave}>
        <SaveSearchIcon size={20} />
        Save
      </button>
    </div>
  );
}

export interface SellFabProps {
  onClick?: () => void;
  className?: string;
}

/** Round red "Sell" button floating above the Sort | Save bar on mobile listing pages. */
export function SellFab({ onClick, className }: SellFabProps) {
  return (
    <button type="button" className={cx(styles.fab, className)} onClick={onClick}>
      Sell
    </button>
  );
}

export interface ListingActionsProps extends SortSaveBarProps {
  onSell?: () => void;
  /** Pin to the bottom of the viewport (the live behaviour). */
  fixed?: boolean;
}

/** The two floating controls together, positioned as on the live listing page. */
export function ListingActions({ onSell, fixed = false, className, ...bar }: ListingActionsProps) {
  return (
    <div className={cx(styles.actions, fixed && styles.fixed, className)}>
      <SellFab onClick={onSell} />
      <SortSaveBar {...bar} />
    </div>
  );
}
