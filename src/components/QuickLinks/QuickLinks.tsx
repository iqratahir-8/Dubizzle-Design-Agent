import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './QuickLinks.module.css';

export interface QuickLink {
  label: string;
  /** An <img> URL or any icon node (32px). */
  icon: string | ReactNode;
  href?: string;
}

export interface QuickLinksProps {
  title?: string;
  /** Motors-style tab row above the tiles, e.g. Category / Make / Model / City / Price Range. */
  tabs?: string[];
  activeTab?: string;
  onTab?: (tab: string) => void;
  items: QuickLink[];
  /** Rows the horizontal grid wraps into (2 on the live home page). */
  rows?: number;
  className?: string;
}

/**
 * Category quick links on mobile home and landing pages — "Explore Egypt's Largest Marketplace":
 * a horizontally scrolling grid of 64px icon tiles with labels (dubizzle.com.eg).
 */
export function QuickLinks({ title, tabs, activeTab, onTab, items, rows = 2, className }: QuickLinksProps) {
  const current = activeTab ?? tabs?.[0];
  return (
    <section className={cx(styles.section, className)}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {tabs && (
        <div className={styles.tabs} role="tablist">
          {tabs.map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={tab === current} className={cx(styles.tab, tab === current && styles.tabActive)} onClick={() => onTab?.(tab)}>
              {tab}
            </button>
          ))}
        </div>
      )}
      <div className={styles.scroller}>
        <ul className={styles.grid} style={{ gridTemplateRows: `repeat(${rows}, auto)` }}>
          {items.map((item) => (
            <li key={item.label}>
              <a className={styles.link} href={item.href ?? '#'}>
                <span className={styles.icon}>{typeof item.icon === 'string' ? <img src={item.icon} alt="" /> : item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
