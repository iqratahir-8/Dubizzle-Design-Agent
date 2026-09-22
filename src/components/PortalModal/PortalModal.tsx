import { useEffect } from 'react';
import { cx } from '../../utils/cx';
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
  assetsPath?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Centred confirm modal of the agency portal (Export Leads, Purchase Lead, Request to add
 * Brand/Model). Repo: horizontal/agencyPortal/dialogs + components/popupContent.tsx.
 * Overlay rgba(0,0,0,.5). Confirming buttons belong to the caller — the system never
 * wires a confirm to anything.
 */
export function PortalModal({ open, onClose, title, subtitle, size = 'md', footer, inline = false, assetsPath = '/assets', children, className }: PortalModalProps) {
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
        {onClose && <button type="button" className={styles.close} aria-label="Close" onClick={onClose}><img src={`${assetsPath}/live-icons/close-portal.svg`} alt="" width={25} height={25} /></button>}
        <div className={styles.title}>{title}</div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export interface InfoBannerProps { children: React.ReactNode; assetsPath?: string }
/** The blue note in Export Leads (live: #e3f2fd, 16 padding, radius 4, 20px info icon, 14/22.4 grey). */
export function InfoBanner({ children, assetsPath = '/assets' }: InfoBannerProps) {
  return <div className={styles.banner} role="note"><img src={`${assetsPath}/live-icons/info.svg`} alt="" width={20} height={20} /><span>{children}</span></div>;
}

export interface ModalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' }
/** Footer buttons as live draws them in portal modals: 40 tall, 15.96/700, radius 6. */
export function ModalButton({ variant = 'primary', className, ...rest }: ModalButtonProps) {
  return <button type="button" className={cx(styles.button, styles[variant], className)} {...rest} />;
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
