import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { ChevronDownIcon } from '../icons';
import type { Device } from '../AdCard/listing';
import styles from './Chip.module.css';

/**
 * - `quick`   — quick-filter shortcuts under the results header (brands, models). Desktop is
 *               grey-filled and larger; mobile is white.
 * - `filter`  — the mobile filter bar ("Cars for Sale ▾", "Brand and Model ▾"). Selected =
 *               a filter is applied: charcoal outline, bold.
 * - `segment` — the All / New / Used switch. Selected = blue.
 */
export type ChipVariant = 'quick' | 'filter' | 'segment';

export interface ChipProps {
  label?: ReactNode;
  variant?: ChipVariant;
  selected?: boolean;
  /** @deprecated use `selected` */
  active?: boolean;
  device?: Device;
  icon?: ReactNode;
  /** Dropdown caret — filter chips that open a picker. */
  caret?: boolean;
  /** Red count badge — e.g. the number of applied filters on the filters button. */
  count?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  'aria-label'?: string;
}

/** Chips as they appear on dubizzle.com.eg listing pages — see docs/LIVE-MEASUREMENTS.md. */
export function Chip({
  label,
  variant = 'quick',
  selected,
  active,
  device = 'desktop',
  icon,
  caret = false,
  count,
  onClick,
  className,
  'aria-label': ariaLabel,
}: ChipProps) {
  const isSelected = selected ?? active ?? false;
  return (
    <button
      type="button"
      className={cx(styles.chip, styles[variant], device === 'mobile' && styles.mobile, isSelected && styles.selected, className)}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {icon}
      {label}
      {caret && <ChevronDownIcon size={16} className={styles.caret} />}
      {count != null && count > 0 && <span className={styles.count}>{count}</span>}
    </button>
  );
}
