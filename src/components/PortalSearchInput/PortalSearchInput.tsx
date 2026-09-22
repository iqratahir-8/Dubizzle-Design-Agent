import { cx } from '../../utils/cx';
import { SearchIcon } from '../icons';
import styles from './PortalSearchInput.module.css';

export interface PortalSearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  width?: string;
  className?: string;
}

/**
 * Search field of the agency portal lists. Repo: horizontal/agencyPortal/components/
 * searchInput.tsx. Live: 24rem × 4.8rem, 1px gray-03, radius 6, 24px icon 16px in,
 * text 15.96px at 12px after the icon; the frame turns red-03 on focus.
 */
export function PortalSearchInput({ placeholder = 'Search here...', value, onChange, width, className }: PortalSearchInputProps) {
  return (
    <label className={cx(styles.box, className)} style={width ? { width } : undefined}>
      <SearchIcon size={24} className={styles.icon} />
      <input className={styles.input} type="search" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} />
    </label>
  );
}
