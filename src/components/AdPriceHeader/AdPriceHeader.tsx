import { HeartIcon } from '../icons';
import { cx } from '../../utils/cx';
import styles from './AdPriceHeader.module.css';

export interface AdPriceHeaderProps {
  price: string;
  /** "EGP 957,000" — shown in the grey chip beside the price when the ad offers finance. */
  downPayment?: string;
  title: string;
  location: string;
  postedAt: string;
  favourited?: boolean;
  onFavourite?: () => void;
  onShare?: () => void;
  assetsPath?: string;
  className?: string;
}

/**
 * The block under the gallery on an ad detail page: price, title, where and when.
 * Anatomy from the live capture (car-dpv.desktop, 2026-09-23), verified by npm run check:live:
 * a 42px price row (28/42 at 600, charcoal) with the down-payment chip 8 after it
 * (--gray-01, radius 6, 4/8, label 600 + amount 900), the 40px favourite and 24px share on the
 * right, then the h1 at 19.88/29.96 at 700 and a 14/21 line with a 17px pin and the age.
 */
export function AdPriceHeader({
  price,
  downPayment,
  title,
  location,
  postedAt,
  favourited = false,
  onFavourite,
  onShare,
  assetsPath = '/assets',
  className,
}: AdPriceHeaderProps) {
  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.priceRow}>
        <div className={styles.priceGroup}>
          <span className={styles.price}>{price}</span>
          {downPayment && (
            <span className={styles.downPayment}>
              <span>Down Payment</span>
              <span className={styles.downPaymentAmount}>{downPayment}</span>
            </span>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.favourite}
            aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={favourited}
            onClick={onFavourite}
          >
            <HeartIcon size={24} />
          </button>
          <button type="button" className={styles.share} aria-label="Share this ad" onClick={onShare}>
            <img src={`${assetsPath}/icons/share.svg`} alt="" width={24} height={24} />
          </button>
        </div>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <img src={`${assetsPath}/live-icons/pin-16.svg`} alt="" width={17} height={17} />
          {location}
        </span>
        <span className={styles.metaItem}>{postedAt}</span>
      </div>
    </header>
  );
}
