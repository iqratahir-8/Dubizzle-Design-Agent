import { cx } from '../../utils/cx';
import { WeekRibbon } from '../WeekRibbon';
import styles from './AdGallery.module.css';

export interface AdGalleryProps {
  /** Photo URLs. Only the active one is rendered — the rest are the slider's track on live. */
  images?: string[];
  /** Index of the photo on screen. */
  index?: number;
  /** Total photo count, when `images` holds only the visible one. */
  total?: number;
  /** "Car of the Week" ribbon, bottom-left over the photo. */
  ribbon?: string;
  /** Back chevron, top-left (mobile ad detail always has it). */
  onBack?: () => void;
  onNext?: () => void;
  alt?: string;
  className?: string;
}

/** Live pager: the active dot is 8px, its neighbours 6px, everything further out 4px. */
function dotSize(distance: number) {
  if (distance === 0) return 'active';
  if (distance === 1) return 'near';
  return 'far';
}

/**
 * Mobile ad detail gallery — the photo, back and next controls, the photo counter and the
 * slider dots. Measured on the live mobile ad detail page (docs/LIVE-MEASUREMENTS.md):
 * 390×294 photo, 32px back disc, 48px next disc, counter pill bottom-right, dots bottom-centre.
 */
export function AdGallery({
  images = [],
  index = 0,
  total,
  ribbon,
  onBack,
  onNext,
  alt = '',
  className,
}: AdGalleryProps) {
  const count = total ?? images.length;
  const src = images[index] ?? images[0];

  return (
    <div className={cx(styles.gallery, className)}>
      {src ? <img className={styles.photo} src={src} alt={alt} /> : <div className={styles.placeholder} />}

      {onBack && (
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {onNext && (
        <button type="button" className={styles.next} onClick={onNext} aria-label="Next photo">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth={2} aria-hidden="true">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {ribbon && <WeekRibbon className={styles.ribbon} label={ribbon} />}

      {count > 1 && (
        <>
          <div className={styles.dots} aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className={cx(styles.dot, styles[dotSize(Math.abs(i - index))])} />
            ))}
          </div>
          <span className={styles.counter}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 3l-1.5 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5L15 3H9zm3 5.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
            </svg>
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}
