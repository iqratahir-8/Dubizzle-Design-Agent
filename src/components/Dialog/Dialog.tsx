import { useEffect } from 'react';
import { cx } from '../../utils/cx';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  /** Panel width; the login dialog is 44rem. */
  width?: string;
  /** Render inside its parent instead of over the page (stories, docs). */
  inline?: boolean;
  /** Content padding under the 4rem header row. Login 1.6rem 2.4rem (default), report 0 3.2rem 3.2rem. */
  padding?: string;
  assetsPath?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Centred modal dialog. Repo: strat/components/dialog.tsx (BaseDialog), as dubizzle-facelift
 * uses it. Live (login dialog, 2026-09-22): overlay rgba(34,34,34,.9), white panel, radius 4,
 * 16/24 padding, 20px close in the top-right corner. Closes on overlay click and Escape.
 */
export function Dialog({ open, onClose, width = '44rem', inline = false, padding = '1.6rem 2.4rem', assetsPath = '/assets', children, className }: DialogProps) {
  useEffect(() => {
    if (!open || !onClose) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={cx(styles.overlay, inline && styles.inline)} onClick={onClose}>
      <div className={cx(styles.panel, className)} style={{ width }} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <img src={`${assetsPath}/live-icons/close-dialog.svg`} alt="" width={20} height={20} />
          </button>
        )}
        <div className={styles.body} style={{ padding }}>{children}</div>
      </div>
    </div>
  );
}
