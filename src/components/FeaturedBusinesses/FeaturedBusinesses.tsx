import { cx } from '../../utils/cx';
import styles from './FeaturedBusinesses.module.css';

export interface FeaturedBusiness {
  name: string;
  logoUrl?: string;
}

export interface FeaturedBusinessesProps {
  title?: string;
  businesses: FeaturedBusiness[];
  className?: string;
}

/** Featured Businesses logo scroller on mobile landing and listing pages (dubizzle.com.eg). */
export function FeaturedBusinesses({ title = 'Featured Businesses', businesses, className }: FeaturedBusinessesProps) {
  return (
    <section className={cx(styles.section, className)}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.scroller}>
        {businesses.map((business) => (
          <a key={business.name} className={styles.item} href="#">
            <span className={styles.logo}>{business.logoUrl && <img src={business.logoUrl} alt="" />}</span>
            <span className={styles.name}>{business.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
