import { cx } from '../../utils/cx';
import { CheckIcon } from '../icons';
import styles from './AppPromoCard.module.css';

export interface AppPromoCardProps {
  title?: string;
  points?: string[];
  cta?: string;
  imageUrl?: string;
  onGetApp?: () => void;
  className?: string;
}

/**
 * "Get more in the app" promo band on mobile home and landing pages (dubizzle.com.eg):
 * peach gradient, phone image, tick bullets and a full-width red CTA.
 */
export function AppPromoCard({
  title = 'Get more in the app',
  points = ['Everything in one place', 'Instant notifications', 'Quick & Easy Chat'],
  cta = 'Get App',
  imageUrl,
  onGetApp,
  className,
}: AppPromoCardProps) {
  return (
    <section className={cx(styles.card, className)}>
      <div className={styles.row}>
        {imageUrl ? <img className={styles.image} src={imageUrl} alt="" /> : <span className={cx(styles.image, styles.placeholder)} />}
        <div className={styles.text}>
          <h3 className={styles.title}>{title}</h3>
          <ul className={styles.points}>
            {points.map((point) => (
              <li key={point} className={styles.point}>
                <span className={styles.tick}>
                  <CheckIcon size={8} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button type="button" className={styles.cta} onClick={onGetApp}>
        {cta}
      </button>
    </section>
  );
}
