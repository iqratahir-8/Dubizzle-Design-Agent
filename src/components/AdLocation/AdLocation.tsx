import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { LocationPinIcon } from '../icons';
import styles from './AdLocation.module.css';

export interface AdLocationProps {
  heading?: string;
  /** The neighbourhood — "Maadi". The loudest line of the pair. */
  area: string;
  /** The governorate under it — "Cairo". */
  city: string;
  /** A real map. The design system ships none, so with nothing here the slot stays neutral. */
  map?: ReactNode;
  onSeeLocation?: () => void;
  className?: string;
}

/**
 * Where the ad is. Anatomy from the live capture (car-dpv.desktop, 2026-09-24), verified by
 * npm run check:live: the 23.94/36 section heading, a 51px row with a 48px --gray-01 disc
 * holding a 25px pin beside the area at 18/27/700 over the city at 16/24 in --gray-05, then a
 * 267px map at radius 8 with "See location" centred on it — 40 tall, 1px --red-04, radius 6,
 * a red 18px pin and the label at 15.96/700.
 */
export function AdLocation({ heading = 'Location', area, city, map, onSeeLocation, className }: AdLocationProps) {
  return (
    <section className={cx(styles.section, className)}>
      <h3 className={styles.heading}>{heading}</h3>
      <div className={styles.place}>
        <span className={styles.pin} aria-hidden="true">
          <LocationPinIcon size={25} />
        </span>
        <span>
          <span className={styles.area}>{area}</span>
          <span className={styles.city}>{city}</span>
        </span>
      </div>
      <div className={styles.map}>
        {map}
        <button type="button" className={styles.seeLocation} onClick={onSeeLocation}>
          <LocationPinIcon size={18} className={styles.seeLocationIcon} />
          See location
        </button>
      </div>
    </section>
  );
}
