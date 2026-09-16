import { cx } from '../../utils/cx';
import { ChevronRightIcon } from '../icons';
import styles from './PopularSearches.module.css';

export interface PopularSearchGroup {
  title: string;
  links: string[];
}

export interface PopularSearchesProps {
  title?: string;
  groups: PopularSearchGroup[];
  /** Links shown before "View more" cuts the group off (live shows ~5). */
  visibleLinks?: number;
  onViewMore?: (group: string) => void;
  className?: string;
}

/** Popular Searches link groups at the bottom of the mobile home page (dubizzle.com.eg). */
export function PopularSearches({ title = 'Popular Searches', groups, visibleLinks = 5, onViewMore, className }: PopularSearchesProps) {
  return (
    <section className={cx(styles.section, className)}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.groups}>
        {groups.map((group) => (
          <div key={group.title} className={styles.group}>
            <div className={styles.clip} style={{ ['--visible-links' as string]: visibleLinks }}>
              <span className={styles.groupTitle}>{group.title}</span>
              <ul className={styles.links}>
                {group.links.map((link) => (
                  <li key={link}>
                    <a className={styles.link} href="#">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" className={styles.viewMore} onClick={() => onViewMore?.(group.title)}>
              View more
              <ChevronRightIcon size={10} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
