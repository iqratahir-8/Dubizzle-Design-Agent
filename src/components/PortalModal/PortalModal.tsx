import { useEffect } from 'react';
import { cx } from '../../utils/cx';
import { CloseIcon } from '../icons';
import styles from './PortalModal.module.css';

export interface PortalModalProps {
  open: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /**
   * md — 60rem, radius 8, 24px padding, title left (Export Leads).
   * sm — 46.6rem, radius 12, centred title, --shadow-modal (Purchase Lead).
   * Both live (2026-09-22).
   */
  size?: 'md' | 'sm';
  footer?: React.ReactNode;
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Centred confirm modal of the agency portal (Export Leads, Purchase Lead, Request to add
 * Brand/Model). Repo: horizontal/agencyPortal/dialogs + components/popupContent.tsx.
 * Overlay rgba(0,0,0,.5). Confirming buttons belong to the caller — the system never
 * wires a confirm to anything.
 */
export function PortalModal({ open, onClose, title, subtitle, size = 'md', footer, inline = false, children, className }: PortalModalProps) {
  useEffect(() => {
    if (!open || !onClose) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={cx(styles.overlay, inline && styles.inline)} onClick={onClose}>
      <div className={cx(styles.panel, styles[size], className)} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {onClose && <button type="button" className={styles.close} aria-label="Close" onClick={onClose}><CloseIcon size={24} /></button>}
        <div className={styles.title}>{title}</div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export interface DetailsTableProps { rows: [string, React.ReactNode][] }
/** The key/value table inside Export Leads (live: 16/24 cells, 12/16 padding, grey keys). */
export function DetailsTable({ rows }: DetailsTableProps) {
  return (
    <table className={styles.table}>
      <tbody>{rows.map(([k, v]) => <tr key={k}><td className={styles.key}>{k}</td><td className={styles.val}>{v}</td></tr>)}</tbody>
    </table>
  );
}
