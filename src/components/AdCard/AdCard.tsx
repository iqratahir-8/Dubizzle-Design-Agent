import type { MouseEventHandler } from 'react';
import { cx } from '../../utils/cx';
import styles from './AdCard.module.css';
import { HeartIcon, LocationPinIcon, PhotoStackIcon, PlaceholderIcon } from './icons';

export interface AdCardProps {
  title: string;
  price: string;
  location: string;
  time: string;
  imageUrl?: string;
  beds?: number | string;
  baths?: number | string;
  area?: string;
  featured?: boolean;
  elite?: boolean;
  photoCount?: number;
  /** Compact/list layout instead of the default grid card. */
  compact?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

/** Listing card with grid and compact variants. Featured/Elite gradient badges, heart overlay, photo count. */
export function AdCard({
  title,
  price,
  location,
  time,
  imageUrl,
  beds,
  baths,
  area,
  featured,
  elite,
  photoCount = 5,
  compact = false,
  onClick,
  className,
}: AdCardProps) {
  const isProperty = Boolean(beds || baths || area);

  if (compact) {
    return (
      <div className={cx(styles.compact, className)} onClick={onClick}>
        <div className={styles.compactMedia}>
          {imageUrl ? <img src={imageUrl} alt={title} /> : <PlaceholderIcon size={28} />}
          {featured && <span className={cx(styles.compactBadge, styles.featured)}>Featured</span>}
          <span className={styles.compactFavorite}>
            <HeartIcon size={14} />
          </span>
        </div>
        <div className={styles.compactContent}>
          <div>
            <div className={styles.compactPrice}>{price}</div>
            <div className={styles.compactTitle}>{title}</div>
            {isProperty && (
              <div className={styles.compactMeta}>
                {beds && <span>{beds} Beds</span>}
                {baths && <span>{baths} Baths</span>}
                {area && <span>{area}</span>}
              </div>
            )}
          </div>
          <div className={styles.compactFooter}>
            <span className={styles.compactLocation}>
              <LocationPinIcon size={10} />
              {location}
            </span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.card, className)} onClick={onClick}>
      <div className={styles.media}>
        {imageUrl ? <img src={imageUrl} alt={title} /> : <PlaceholderIcon />}
        {featured && <span className={cx(styles.badge, styles.featured)}>Featured</span>}
        {elite && <span className={cx(styles.badge, styles.elite)}>Elite</span>}
        <span className={styles.favorite}>
          <HeartIcon />
        </span>
        <span className={styles.photoCount}>
          <PhotoStackIcon />
          {photoCount}
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.price}>{price}</div>
        <div className={styles.title}>{title}</div>
        {isProperty && (
          <div className={styles.meta}>
            {beds && <span>{beds} Beds</span>}
            <span className={styles.metaDot}>●</span>
            {baths && <span>{baths} Baths</span>}
            <span className={styles.metaDot}>●</span>
            {area && <span>{area}</span>}
          </div>
        )}
        <div className={styles.location}>
          <LocationPinIcon />
          <span>{location}</span>
        </div>
        <div className={styles.time}>{time}</div>
      </div>
    </div>
  );
}
