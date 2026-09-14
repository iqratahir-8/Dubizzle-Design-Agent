import { cx } from '../../utils/cx';
import { AppBannerIcon, CloseIcon, DownloadIcon, StarIcon } from '../icons';
import styles from './AppBanner.module.css';

export interface AppBannerProps {
  title?: string;
  rating?: string;
  downloads?: string;
  cta?: string;
  onClose?: () => void;
  onGetApp?: () => void;
  className?: string;
}

/** "Buy and sell faster in app" smart banner pinned above the mobile home header (dubizzle.com.eg). */
export function AppBanner({ title = 'Buy and sell faster in app', rating = '4.5', downloads = '10M+', cta = 'Get App', onClose, onGetApp, className }: AppBannerProps) {
  return (
    <div className={cx(styles.banner, className)}>
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <CloseIcon size={15} />
      </button>
      <span className={styles.appIcon}>
        <AppBannerIcon size={37} />
      </span>
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        <div className={styles.badges}>
          <span className={styles.badge}>
            <StarIcon size={12} />
            {rating}
          </span>
          <span className={styles.badge}>
            <DownloadIcon size={12} />
            {downloads}
          </span>
        </div>
      </div>
      <button type="button" className={styles.cta} onClick={onGetApp}>
        {cta}
      </button>
    </div>
  );
}
