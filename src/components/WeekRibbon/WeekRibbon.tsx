import { cx } from '../../utils/cx';
import styles from './WeekRibbon.module.css';

export interface WeekRibbonProps {
  /** "Car of the Week", "Property of the Week" — the live label includes the category. */
  label?: string;
  className?: string;
}

/**
 * "Car / Property of the Week" ribbon — the red gradient badge dubizzle puts on the winning
 * ad's photo, on the ad detail gallery and on the listing card.
 * Measured on the live mobile ad detail page (docs/LIVE-MEASUREMENTS.md).
 */
export function WeekRibbon({ label = 'Car of the Week', className }: WeekRibbonProps) {
  return (
    <span className={cx(styles.ribbon, className)}>
      <svg className={styles.star} width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95L12 2.5z" />
      </svg>
      {label}
    </span>
  );
}
