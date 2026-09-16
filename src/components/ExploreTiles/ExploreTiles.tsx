import { cx } from '../../utils/cx';
import styles from './ExploreTiles.module.css';

export interface ExploreTile {
  label: string;
  /** Red "New" pill under the label. */
  badge?: string;
  imageUrl?: string;
  href?: string;
}

export interface ExploreTilesProps {
  title?: string;
  tiles: ExploreTile[];
  className?: string;
}

/**
 * "Explore dubizzle Motors" tiles on the mobile motors landing page (dubizzle.com.eg):
 * two-column cards with a label and an illustration anchored bottom-right.
 */
export function ExploreTiles({ title, tiles, className }: ExploreTilesProps) {
  return (
    <section className={cx(styles.section, className)}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.grid}>
        {tiles.map((tile) => (
          <a key={tile.label} className={styles.tile} href={tile.href ?? '#'}>
            <span className={styles.text}>
              <span className={styles.label}>{tile.label}</span>
              {tile.badge && <span className={styles.badge}>{tile.badge}</span>}
            </span>
            {tile.imageUrl && <img className={styles.image} src={tile.imageUrl} alt="" />}
          </a>
        ))}
      </div>
    </section>
  );
}
