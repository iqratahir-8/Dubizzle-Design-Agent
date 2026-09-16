import { useState } from 'react';
import { cx } from '../../utils/cx';
import styles from './MegaMenu.module.css';

export interface MegaMenuLink {
  label: string;
  href?: string;
  /** Rows that lead to a further level show a chevron (the More Categories panels do). */
  chevron?: boolean;
}

export interface MegaMenuPanel {
  title: string;
  seeAllLabel?: string;
  seeAllHref?: string;
  links: MegaMenuLink[];
  /** Live uses two columns for long brand lists, one for link lists with chevrons. */
  columns?: 1 | 2;
}

export interface MegaMenuCategory {
  label: string;
  href?: string;
  /** Second line under the label, as in More Categories ("Dogs; Cats; Birds"). */
  subtitle?: string;
  panel?: MegaMenuPanel;
}

export interface MegaMenuItem {
  label: string;
  href?: string;
  categories: MegaMenuCategory[];
}

export interface MegaMenuProps {
  items: MegaMenuItem[];
  /** Opens an item without a pointer — for stories, screenshots and the design kit. */
  openItem?: string;
  className?: string;
}

/**
 * Desktop header category nav and its mega menu, as on dubizzle.com.eg: hovering a category
 * in the strip opens a panel with the subcategory column on the left and the hovered
 * subcategory's links on the right. Measured on the live header (docs/LIVE-MEASUREMENTS.md).
 *
 * Hover opens it, like live; `openItem` pins one open for a story or a screenshot.
 */
export function MegaMenu({ items, openItem, className }: MegaMenuProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const open = hovered ?? openItem ?? null;

  return (
    <nav className={cx(styles.nav, className)} onMouseLeave={() => setHovered(null)} aria-label="Categories">
      {items.map((item) => {
        const isOpen = item.label === open;
        const active = item.categories.find((c) => c.label === category) ?? item.categories[0];
        return (
          <div
            key={item.label}
            className={styles.item}
            onMouseEnter={() => {
              setHovered(item.label);
              setCategory(null);
            }}
          >
            <a
              className={cx(styles.label, isOpen && styles.labelOpen)}
              href={item.href ?? '#'}
              aria-expanded={isOpen}
              onFocus={() => setHovered(item.label)}
            >
              {item.label}
            </a>

            {isOpen && (
              <div className={styles.menu}>
                <div className={styles.column}>
                  {item.categories.map((c) => (
                    <a
                      key={c.label}
                      className={cx(styles.category, c.label === active?.label && styles.categoryActive)}
                      href={c.href ?? '#'}
                      onMouseEnter={() => setCategory(c.label)}
                    >
                      <span className={styles.categoryText}>
                        <span className={styles.categoryLabel}>{c.label}</span>
                        {c.subtitle && <span className={styles.categorySubtitle}>{c.subtitle}</span>}
                      </span>
                      <svg className={styles.chevron} width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>

                {active?.panel && (
                  <div className={styles.panelWrap}>
                    <div className={styles.panel}>
                      <div className={styles.panelHead}>
                        <span className={styles.panelTitle}>{active.panel.title}</span>
                        {active.panel.seeAllLabel && (
                          <a className={styles.seeAll} href={active.panel.seeAllHref ?? '#'}>
                            {active.panel.seeAllLabel}
                          </a>
                        )}
                      </div>
                      <div className={styles.links} data-columns={active.panel.columns ?? 1}>
                        {active.panel.links.map((link) => (
                          <a key={link.label} className={styles.link} href={link.href ?? '#'}>
                            <span>{link.label}</span>
                            {link.chevron && (
                              <svg className={styles.chevron} width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
