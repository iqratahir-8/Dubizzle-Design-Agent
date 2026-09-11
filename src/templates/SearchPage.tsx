import { useState } from 'react';
import { AdCard } from '../components/AdCard';
import { Chip } from '../components/Chip';
import { Checkbox } from '../components/Checkbox';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Pagination } from '../components/Pagination';
import { Radio } from '../components/Radio';
import { cx } from '../utils/cx';
import { BEDROOM_OPTIONS, CAIRO_AREAS, PROPERTY_LISTINGS, type Listing } from './fixtures';
import styles from './templates.module.css';

export interface SearchPageProps {
  listings?: Listing[];
  resultCount?: string;
  assetPath?: string;
  className?: string;
}

/**
 * Search results page template — 30.4rem filter rail beside a 1/2/3-column
 * results grid, matching dubizzle-facelift's searchPageDesktop layout.
 * Copy this and swap the data source; keep the structure.
 */
export function SearchPage({
  listings = PROPERTY_LISTINGS,
  resultCount = '12,847 ads',
  assetPath,
  className,
}: SearchPageProps) {
  const [beds, setBeds] = useState('3');
  const [areas, setAreas] = useState<string[]>(['New Cairo']);
  const [furnished, setFurnished] = useState('Any');
  const [page, setPage] = useState(1);

  function toggleArea(area: string) {
    setAreas((current) =>
      current.includes(area) ? current.filter((a) => a !== area) : [...current, area],
    );
  }

  return (
    <div className={cx(styles.page, styles.pageSearch, className)}>
      <Header activeVertical="property" assetPath={assetPath} />

      <main className={styles.container}>
        <div className={styles.searchLayout}>
          <aside className={styles.filterRail}>
            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Price (EGP)</h3>
              <div className={styles.rangeRow}>
                <Input placeholder="Min" aria-label="Minimum price" />
                <Input placeholder="Max" aria-label="Maximum price" />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Location</h3>
              <div className={styles.filterOptions}>
                {CAIRO_AREAS.map((area) => (
                  <Checkbox
                    key={area}
                    label={area}
                    checked={areas.includes(area)}
                    onChange={() => toggleArea(area)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Bedrooms</h3>
              <div className={styles.chipRow}>
                {BEDROOM_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    active={beds === option}
                    onClick={() => setBeds(option)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Area (m²)</h3>
              <div className={styles.rangeRow}>
                <Input placeholder="Min" aria-label="Minimum area" />
                <Input placeholder="Max" aria-label="Maximum area" />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Furnished</h3>
              <div className={styles.filterOptions}>
                {['Any', 'Furnished', 'Unfurnished'].map((option) => (
                  <Radio
                    key={option}
                    name="furnished"
                    label={option}
                    selected={furnished === option}
                    onChange={() => setFurnished(option)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className={styles.resultsHead}>
              <h1 className={styles.resultsCount}>{resultCount}</h1>
              <Chip label="Sort by: Newest first" />
            </div>

            <ul className={styles.resultsGrid}>
              {listings.map((listing) => (
                <li key={listing.title}>
                  <AdCard {...listing} />
                </li>
              ))}
            </ul>

            <div className={styles.pagination}>
              <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
            </div>
          </section>
        </div>
      </main>

      <Footer assetPath={assetPath} />
    </div>
  );
}
