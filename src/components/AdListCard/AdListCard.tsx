import type { MouseEventHandler } from 'react';
import { cx } from '../../utils/cx';
import { ContactButton } from '../ContactButton';
import { AreaIcon, BathsIcon, BedsIcon, EliteIcon, HeartIcon, ImagePlaceholderIcon, LocationOutlineIcon, PhotoCountIcon } from '../icons';
import type { Device, Listing } from '../AdCard/listing';
import styles from './AdListCard.module.css';

export interface AdListCardProps extends Listing {
  device?: Device;
  /** The top "Car of the Week / Property of the Week" slot — outlined in red. */
  highlighted?: boolean;
  /** Agency / dealer logo shown with the location. */
  agencyLogoUrl?: string;
  favourite?: boolean;
  onFavourite?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
}

const SPEC_ICONS = [BedsIcon, BathsIcon, AreaIcon];

/**
 * List ad card — search results (listing pages). Matches dubizzle.com.eg
 * (docs/LIVE-MEASUREMENTS.md): desktop is a 312px image beside the details, mobile stacks the
 * image on top. Price is charcoal here (the grid card's is red). Property cards lead with the
 * type and icon specs; car cards with "brand • model" and stacked attribute chips.
 */
export function AdListCard({
  device = 'desktop',
  highlighted = false,
  agencyLogoUrl,
  favourite = false,
  onFavourite,
  onCall,
  onWhatsApp,
  onClick,
  className,
  ...listing
}: AdListCardProps) {
  const { price, downPayment, priceNote, title, type, brand, model, beds, baths, area, attributes, location, time, imageUrl, featured, elite, photoCount } = listing;
  const mobile = device === 'mobile';
  const isProperty = Boolean(type || beds != null || baths != null || area);
  const propertySpecs = [beds != null ? `${beds} beds` : null, baths != null ? `${baths} baths` : null, area ?? null];
  // Car attributes stack label over value everywhere; property ones only on mobile.
  const stackAttributes = mobile || !isProperty;

  const favouriteButton = (
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
  );

  return (
    <article className={cx(styles.card, mobile && styles.mobile, highlighted && styles.highlighted, className)} onClick={onClick}>
      <div className={styles.media}>
        {imageUrl ? <img src={imageUrl} alt="" /> : <ImagePlaceholderIcon size={40} className={styles.placeholder} />}
        {(photoCount ?? 0) > 1 && (
          <div className={styles.dots} aria-hidden="true">
            {Array.from({ length: Math.min(photoCount ?? 0, 6) }, (_, i) => (
              <span key={i} className={cx(styles.dot, i === 0 && styles.dotActive)} />
            ))}
          </div>
        )}
        {!mobile && photoCount != null && (
          <span className={styles.photoCount}>
            <PhotoCountIcon size={14} />
            {photoCount}
          </span>
        )}
        {(elite || featured) && (
          <span className={cx(styles.badge, elite ? styles.elite : styles.featured)}>
            {elite && <EliteIcon size={14} />}
            {elite ? 'Elite' : 'Featured'}
          </span>
        )}
        {mobile && favouriteButton}
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
          {mobile && <span className={styles.timeCorner}>{time}</span>}
        </div>

        {isProperty ? (
          <div className={styles.typeRow}>
            {type && <span className={styles.type}>{type}</span>}
            {type && !mobile && <span className={styles.divider}>|</span>}
            <span className={styles.specs}>
              {propertySpecs.map((item, i) => {
                if (!item) return null;
                const Icon = SPEC_ICONS[i];
                return (
                  <span key={item} className={styles.spec}>
                    <Icon size={16} />
                    {item}
                  </span>
                );
              })}
            </span>
          </div>
        ) : (
          (brand || model) && (
            <div className={styles.brandLine}>
              {brand && <span>{brand}</span>}
              {brand && model && <span className={styles.bullet}>•</span>}
              {model && <span>{model}</span>}
            </div>
          )
        )}

        {!(mobile && isProperty) && <h2 className={styles.title}>{title}</h2>}

        {!mobile && favouriteButton}

        {attributes && attributes.length > 0 && (
          <div className={cx(styles.attributes, stackAttributes && styles.attributesStacked)}>
            {attributes.map((attribute) => (
              <span key={attribute.label} className={styles.attribute}>
                <span className={styles.attributeLabel}>{attribute.label}</span>
                <span className={styles.attributeValue}>{attribute.value}</span>
              </span>
            ))}
          </div>
        )}

        <div className={styles.meta}>
          <span className={styles.location}>
            <LocationOutlineIcon size={mobile ? 14 : 16} />
            <span className={styles.locationText}>{location}</span>
          </span>
          {!mobile && (
            <>
              <span className={styles.bullet}>•</span>
              <span className={styles.time}>{time}</span>
            </>
          )}
          {mobile && agencyLogoUrl && <img className={styles.logo} src={agencyLogoUrl} alt="" />}
        </div>

        {!mobile && agencyLogoUrl && <img className={cx(styles.logo, styles.logoCorner)} src={agencyLogoUrl} alt="" />}
      </div>

      <div className={styles.actions}>
        <ContactButton variant="call" onClick={onCall} className={styles.action} />
        <ContactButton variant="whatsapp" onClick={onWhatsApp} className={styles.action} />
      </div>
    </article>
  );
}
