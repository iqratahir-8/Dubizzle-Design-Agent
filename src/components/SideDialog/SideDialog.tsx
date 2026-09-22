import { useEffect } from 'react';
import { cx } from '../../utils/cx';
import { CloseIcon } from '../icons';
import styles from './SideDialog.module.css';

export interface SideDialogProps {
  open: boolean;
  onClose?: () => void;
  /** Heading in the top row; the close button sits in the corner either way. */
  title?: React.ReactNode;
  /** default — 37rem (Assign Agent, Apply product). large — 65rem, the ad details drawer. */
  size?: 'default' | 'large';
  /** Render inside its parent instead of over the page (stories, docs). */
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Right-hand side panel of the agency portal. Repo: horizontal/agencyPortal/components/
 * sideDialog.tsx. The ad details drawer is its "large" size: clicking an Agency Ads card
 * opens it (live, 2026-09-21: 650px wide, full height, list dimmed behind).
 * Overlay rgba(agency-portal-overlay-color, .7); closes on overlay click and Escape.
 */
export function SideDialog({ open, onClose, title, size = 'default', inline = false, children, className }: SideDialogProps) {
  useEffect(() => {
    if (!open || !onClose) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={cx(styles.overlay, inline && styles.inline)} onClick={onClose}>
      <aside className={cx(styles.panel, size === 'large' && styles.large, className)} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {title && <div className={styles.title}>{title}</div>}
          {onClose && (
            <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
              <CloseIcon size={24} />
            </button>
          )}
        </div>
        {children}
      </aside>
    </div>
  );
}
