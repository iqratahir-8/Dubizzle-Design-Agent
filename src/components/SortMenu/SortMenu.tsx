import { cx } from '../../utils/cx';
import styles from './SortMenu.module.css';

export interface SortMenuProps {
  options?: string[];
  value: string;
  onChange?: (value: string) => void;
  assetsPath?: string;
  className?: string;
}

/** What live offers under "Sort by" on a cars listing (captured sort-menu, 2026-09-22). */
export const SORT_MENU_OPTIONS = ['Newly listed', 'Most relevant', 'Lowest price', 'Highest price', 'Verified accounts'];

/**
 * The menu that opens under `SortBy`. Repo: dubizzle-facelift/search/sorting
 * (sortOptionsDropdown). Live: 22rem wide, radius 4, --shadow-control, 50px rows, 14/21;
 * the chosen row is bold with a red 22px tick 16px in; other rows indent to line up (54px).
 */
export function SortMenu({ options = SORT_MENU_OPTIONS, value, onChange, assetsPath = '/assets', className }: SortMenuProps) {
  return (
    <ul className={cx(styles.menu, className)} role="listbox">
      {options.map((o) => {
        const on = o === value;
        return (
          <li key={o} role="option" aria-selected={on} className={cx(styles.row, on && styles.on)} onClick={() => onChange?.(o)}>
            {on && <img src={`${assetsPath}/live-icons/tick.svg`} alt="" width={22} height={22} className={styles.tick} />}
            <span>{o}</span>
          </li>
        );
      })}
    </ul>
  );
}
