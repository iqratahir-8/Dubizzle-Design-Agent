import { cx } from '../../utils/cx';
import { CloseIcon } from '../icons';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  /** Second bold line; makes the toast 7.8rem tall with a larger icon. */
  secondaryMessage?: string;
  type?: 'success' | 'error';
  visible?: boolean;
  onDismiss?: () => void;
  /** Render in place instead of fixed to the top-right (stories, docs). */
  inline?: boolean;
  /** Where the repo's two toast icons live (src/assets/toast). */
  assetsPath?: string;
  className?: string;
}

/**
 * Toast notification. Repo: dubizzle-facelift/components/toast.tsx — fixed top-right,
 * 35rem × 5.6rem, radius 8, green-02 (success) or red-02 (error), slides in from the
 * right over 150ms, dismisses itself after 3s in the product. Icons are the repo's own
 * (iconBadgeGood_2.svg, loginErrorIcon.svg).
 *
 * Provenance: repo values only. The live favourite toast was captured (toast-favourite)
 * but had already slid out of frame, so this is NOT yet verified against live.
 */
export function Toast({ message, secondaryMessage, type = 'success', visible = true, onDismiss, inline = false, assetsPath = '/assets', className }: ToastProps) {
  if (!visible) return null;
  const two = Boolean(secondaryMessage);
  return (
    <div role="status" className={cx(styles.toast, styles[type], two && styles.tall, inline && styles.inline, className)}>
      <div className={styles.message}>
        <img className={cx(styles.icon, two && styles.iconLarge)} src={`${assetsPath}/toast/${type}.svg`} alt="" />
        <div className={two ? styles.lines : undefined}>
          <span className={cx(styles.main, two && styles.mainLarge)}>{message}</span>
          {two && <span className={styles.main}>{secondaryMessage}</span>}
        </div>
      </div>
      {onDismiss && (
        <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={onDismiss}>
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}
