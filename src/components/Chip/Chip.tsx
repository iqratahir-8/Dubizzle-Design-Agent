import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Chip.module.css';

export interface ChipProps {
  label: ReactNode;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  icon?: ReactNode;
  className?: string;
}

/** Filter chip for search and category selectors. Active / inactive states. */
export function Chip({ label, active = false, onClick, icon, className }: ChipProps) {
  return (
    <span className={cx(styles.chip, active && styles.active, className)} onClick={onClick}>
      {icon}
      {label}
    </span>
  );
}
