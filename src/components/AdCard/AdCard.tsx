import type { MouseEventHandler } from 'react';
import { cx } from '../../utils/cx';
import { EliteIcon, HeartIcon, ImagePlaceholderIcon } from '../icons';
import { specItems } from './listing';
import type { Device, Listing } from './listing';
import styles from './AdCard.module.css';

export interface AdCardProps extends Listing {
  /** Desktop and mobile web render different card sizes — pick explicitly so both can be shown side by side. */
  device?: Device;
  favourite?: boolean;
  onFavourite?: () => void;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
}

/**
 * Grid ad card — home and landing-page rails and the "similar ads" widget under an ad.
 * Matches dubizzle.com.eg (docs/LIVE-MEASUREMENTS.md): flat card, red price, price note
 * or down-payment chip, one-line title with the heart beside it, bold spec line, grey
 * location and time. Search results use AdListCard instead.
 */
export function AdCard({
  device = 'desktop',
  favourite = false,
  onFavourite,
  onClick,
  className,
  ...listing
}: AdCardProps) {
  const { price, priceNote, downPayment, title, type, location, time, imageUrl, featured, elite } = listing;
  const specs = specItems(listing);
  const mobile = device === 'mobile';

  return (
    <article className={cx(styles.card, mobile && styles.mobile, className)} onClick={onClick}>
      <div className={styles.media}>
        {imageUrl ? <img src={imageUrl} alt="" /> : <ImagePlaceholderIcon size={32} className={styles.placeholder} />}
        {(elite || featured) && (
          <span className={cx(styles.badge, elite ? styles.elite : styles.featured)}>
            {elite && <EliteIcon size={14} />}
            {elite ? 'Elite' : 'Featured'}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.priceRow}>
          <span className={styles.price}>{price}</span>
          {downPayment ? (
            <span className={styles.downPayment}>
              Down Payment <strong>{downPayment}</strong>
            </span>
          ) : (
            priceNote && <span className={styles.priceNote}>{priceNote}</span>
          )}
        </div>

        <p className={styles.title}>{title}</p>

        <button
          type="button"
          className={cx(styles.favourite, favourite && styles.favouriteOn)}
          aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={favourite}
          onClick={(event) => {
            event.stopPropagation();
            onFavourite?.();
          }}
        >
          <HeartIcon size={mobile ? 20 : 24} />
        </button>

        {(type || specs.length > 0) && (
          <div className={styles.specs}>
            {type && <span className={styles.type}>{type}</span>}
            {specs.length > 0 && (
              <span className={styles.specItems}>
                {specs.map((item, i) => (
                  <span key={item} className={styles.specItem}>
                    {(i > 0 || (type && !mobile)) && <span className={styles.dot}>•</span>}
                    {item}
                  </span>
                ))}
              </span>
            )}
          </div>
        )}

        <div className={styles.meta}>
          <span className={styles.location}>{location}</span>
          <span className={styles.time}>{time}</span>
        </div>
      </div>
    </article>
  );
}
