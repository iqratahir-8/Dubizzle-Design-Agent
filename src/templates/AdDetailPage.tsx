import { Chip } from '../components/Chip';
import { ContactButton } from '../components/ContactButton';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Pill } from '../components/Pill';
import { cx } from '../utils/cx';
import { AD_DETAIL } from './fixtures';
import styles from './templates.module.css';

export interface AdDetailPageProps {
  ad?: typeof AD_DETAIL;
  assetPath?: string;
  className?: string;
}

/**
 * Ad detail template — gallery, then a content column beside a 34rem rail
 * holding the seller and the three contact CTAs. Price is the largest element
 * on the page and sits above the title.
 */
export function AdDetailPage({ ad = AD_DETAIL, assetPath, className }: AdDetailPageProps) {
  return (
    <div className={cx(styles.page, styles.pageSearch, className)}>
      <Header activeVertical="property" assetPath={assetPath} />

      <main className={styles.container}>
        <div className={styles.gallery}>
          <div className={styles.galleryMain} />
          <div className={styles.gallerySide}>
            <div />
            <div />
          </div>
        </div>

        <div className={styles.detailLayout}>
          <div>
            <div className={styles.card}>
              <p className={styles.detailPrice}>{ad.price}</p>
              <h1 className={styles.detailTitle}>{ad.title}</h1>
              <p className={styles.detailMeta}>{ad.location}</p>
              <p className={styles.detailMeta}>{ad.posted}</p>
              <div className={styles.chipRow} style={{ marginTop: 'var(--space-3)' }}>
                <Pill variant="featured" label="Featured" />
                <Pill variant="boosted" label="Boosted" />
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.filterTitle}>Details</h2>
              <dl className={styles.specTable}>
                {ad.specs.map(([label, value]) => (
                  <div key={label} className={styles.specRow}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={styles.card}>
              <h2 className={styles.filterTitle}>Description</h2>
              <p className={styles.bodyText}>{ad.description}</p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.filterTitle}>Amenities</h2>
              <div className={styles.chipRow}>
                {ad.amenities.map((amenity) => (
                  <Chip key={amenity} label={amenity} />
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className={styles.card}>
              <div className={styles.sellerCard}>
                <span className={styles.sellerAvatar}>{ad.seller.name.charAt(0)}</span>
                <div>
                  <p className={styles.detailTitle}>{ad.seller.name}</p>
                  <p className={styles.detailMeta}>{ad.seller.memberSince}</p>
                </div>
              </div>
              <div className={styles.contactStack}>
                <ContactButton variant="chat" fullWidth />
                <ContactButton variant="call" fullWidth />
                <ContactButton variant="whatsapp" fullWidth />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer assetPath={assetPath} />
    </div>
  );
}
