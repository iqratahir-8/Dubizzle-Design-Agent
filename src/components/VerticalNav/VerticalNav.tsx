import { cx } from '../../utils/cx';
import styles from './VerticalNav.module.css';

export interface VerticalNavItem {
  label: string;
  href?: string;
  /** Red pill after the label, as on "Electric Cars". */
  badge?: string;
}

export interface VerticalNavProps {
  items?: VerticalNavItem[];
  /** Label of the current page — drawn in red. */
  active?: string;
  className?: string;
}

/** The Motors landing's own nav, from the live page. */
export const MOTORS_NAV: VerticalNavItem[] = [
  { label: 'Cars for Sale', href: '/en/motors/' },
  { label: 'New Cars', href: '/en/motors/new-cars/' },
  { label: 'Electric Cars', href: '/en/motors/electric-cars/', badge: 'NEW' },
  { label: 'Car Comparison', href: '/en/motors/new-cars/compare/' },
  { label: 'Car Finance', href: '/en/motors/car-finance/' },
];

/**
 * Sub-nav on a vertical landing page (Motors, Property). On those pages it replaces the
 * header's search row: one row of 16/600 links, 48px apart, the current one in red.
 * Measured on the live motors landing (docs/LIVE-MEASUREMENTS.md).
 */
export function VerticalNav({ items = MOTORS_NAV, active = items[0]?.label, className }: VerticalNavProps) {
  return (
    <nav className={cx(styles.nav, className)} aria-label="Section">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.label}>
            <a
              className={cx(styles.link, item.label === active && styles.active)}
              href={item.href ?? '#'}
              aria-current={item.label === active ? 'page' : undefined}
            >
              {item.label}
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
