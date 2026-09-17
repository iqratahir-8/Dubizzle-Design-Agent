import { cx } from '../../utils/cx';
import styles from './Breadcrumbs.module.css';

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

/**
 * Listing and ad-detail breadcrumbs. Measured on the live cars search page
 * (docs/LIVE-MEASUREMENTS.md): 14/21 links at 64% charcoal, separated by a slash, with the
 * current page in full charcoal.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx(styles.nav, className)}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className={styles.item}>
              {isLast || !item.href ? (
                <span className={cx(styles.crumb, isLast && styles.current)} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <a className={styles.crumb} href={item.href}>
                  {item.label}
                </a>
              )}
              {!isLast && <span className={styles.separator} aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
