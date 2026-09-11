import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Pill.module.css';

export type PillVariant =
  | 'regular'
  | 'success'
  | 'featured'
  | 'error'
  | 'boosted'
  | 'live'
  | 'recent'
  | 'disabled';

export interface PillProps {
  label: ReactNode;
  variant?: PillVariant;
  className?: string;
}

/** Status pill / tag. Variants: regular, success, featured, error, boosted, live, recent, disabled. */
export function Pill({ label, variant = 'regular', className }: PillProps) {
  return <span className={cx(styles.pill, styles[variant], className)}>{label}</span>;
}
