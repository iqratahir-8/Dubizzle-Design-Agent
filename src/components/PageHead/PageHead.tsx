import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './PageHead.module.css';

export interface PageHeadProps {
  title: string;
  /** Ad count beside the title — live shows "13,065 ads" on a pink pill. */
  count?: string;
  /** Right-hand actions: live puts "Save Search" here. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Listing page title row: the H1, the ad-count pill beside it, and the page's actions on the
 * right. Measured on the live cars search page (docs/LIVE-MEASUREMENTS.md).
 */
export function PageHead({ title, count, actions, className }: PageHeadProps) {
  return (
    <div className={cx(styles.head, className)}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {count && <span className={styles.count}>{count}</span>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
