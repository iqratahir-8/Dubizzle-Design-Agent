import { useEffect } from 'react';
import { cx } from '../../utils/cx';
import { CloseIcon } from '../icons';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  /** Panel width; the login dialog is 44rem. */
  width?: string;
  /** Render inside its parent instead of over the page (stories, docs). */
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Centred modal dialog. Repo: strat/components/dialog.tsx (BaseDialog), as dubizzle-facelift
 * uses it. Live (login dialog, 2026-09-22): overlay rgba(34,34,34,.9), white panel, radius 4,
 * 16/24 padding, 20px close in the top-right corner. Closes on overlay click and Escape.
 */
export function Dialog({ open, onClose, width = '44rem', inline = false, children, className }: DialogProps) {
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
            <CloseIcon size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
