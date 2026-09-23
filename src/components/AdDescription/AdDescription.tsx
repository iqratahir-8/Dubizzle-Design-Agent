import { cx } from '../../utils/cx';
import styles from './AdDescription.module.css';

export interface AdDescriptionProps {
  heading?: string;
  /** The seller's own text. Line breaks are kept exactly as they typed them. */
  children: string;
  className?: string;
}

/**
 * The seller's description on an ad detail page. Anatomy from the live capture
 * (car-dpv.desktop, 2026-09-23), verified by npm run check:live: a 23.94/36 heading, 16 of
 * space, then 15.96/23.94 body text that keeps the seller's line breaks.
 */
export function AdDescription({ heading = 'Description', children, className }: AdDescriptionProps) {
  return (
    <section className={cx(styles.section, className)}>
      <h3 className={styles.heading}>{heading}</h3>
      <p className={styles.body}>{children}</p>
    </section>
  );
}
