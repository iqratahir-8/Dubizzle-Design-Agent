import { cx } from '../../utils/cx';
import { ChevronDownIcon } from '../icons';
import styles from './AdDetailsTable.module.css';

export interface AdDetail {
  label: string;
  value: string;
}

export interface AdDetailsTableProps {
  heading?: string;
  details: AdDetail[];
  /** Rows shown before the "View +N more" toggle. Live shows 6 on a car. */
  visibleRows?: number;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

/**
 * The attribute grid on an ad detail page. Anatomy from the live capture (car-dpv.desktop,
 * 2026-09-23), verified by npm run check:live: a 23.94/36 heading, then two columns 16 apart
 * with rows 4 apart, each row a 40% key cell on --gray-01 and a bold value cell on the
 * near-white, both 16/24 with 8/12 padding — and a blue 14/700 "View +N more" under them.
 */
export function AdDetailsTable({
  heading = 'Details',
  details,
  visibleRows = 6,
  expanded = false,
  onToggle,
  className,
}: AdDetailsTableProps) {
  const shown = expanded ? details : details.slice(0, visibleRows);
  const hidden = details.length - shown.length;

  return (
    <section className={cx(styles.section, className)}>
      <h3 className={styles.heading}>{heading}</h3>
      <div className={styles.grid}>
        {shown.map((detail) => (
          <div key={detail.label} className={styles.row}>
            <span className={styles.key}>{detail.label}</span>
            <span className={styles.value}>{detail.value}</span>
          </div>
        ))}
      </div>
      {(hidden > 0 || expanded) && (
        <button type="button" className={styles.more} onClick={onToggle} aria-expanded={expanded}>
          {expanded ? 'View less' : `View +${hidden} more`}
          <ChevronDownIcon size={16} />
        </button>
      )}
    </section>
  );
}
