import { AdCard } from '../components/AdCard';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { cx } from '../utils/cx';
import { CATEGORIES, MIXED_LISTINGS, type Listing } from './fixtures';
import styles from './templates.module.css';

export interface HomePageProps {
  listings?: Listing[];
  categories?: string[];
  assetPath?: string;
  className?: string;
}

/**
 * Home page template — search and categories above the fold, then a
 * recommendations grid. Deliberately no marketing hero: the real home page
 * gets people into a category or a search as fast as possible.
 */
export function HomePage({
  listings = MIXED_LISTINGS,
  categories = CATEGORIES,
  assetPath,
  className,
}: HomePageProps) {
  return (
    <div className={cx(styles.page, className)}>
      <Header assetPath={assetPath} />

      <main className={styles.container}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Popular Categories</h2>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <a key={category} className={styles.categoryTile} href="#">
                {category}
              </a>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Fresh Recommendations</h2>
          </div>
          <ul className={styles.resultsGrid}>
            {listings.map((listing) => (
              <li key={listing.title}>
                <AdCard {...listing} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer assetPath={assetPath} />
    </div>
  );
}
