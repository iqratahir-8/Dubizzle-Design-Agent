import { cx } from '../../utils/cx';
import styles from './PortalSideMenu.module.css';

export interface PortalMenuItem { key: string; label: string; href?: string }

/** The eight sections of dubizzle Pro, in live's order. */
export const PORTAL_MENU: PortalMenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'agency-ads', label: 'Agency Ads' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'leads', label: 'Leads' },
  { key: 'vip-leads', label: 'VIP Leads' },
  { key: 'agency-management', label: 'Agency Management' },
  { key: 'insights', label: 'Insights' },
  { key: 'credit-info', label: 'Credit Info' },
];

export interface PortalSideMenuProps {
  active: string;
  /** Collapsed = the 80px icon rail; expanded = the 250px drawer with titles. */
  expanded?: boolean;
  onToggle?: () => void;
  items?: PortalMenuItem[];
  assetsPath?: string;
  className?: string;
}

/**
 * The agency portal's sidebar. Repo: horizontal/agencyPortal/sideMenu. Live (every portal
 * capture, 2026-09-22): gray-01 rail, 16/12/24 padding; the burger row + "dubizzle Pro"
 * wordmark; 56px items (16 padding, radius 10, 4px apart), icon 24; active = red-05 with a
 * white icon and title. Expanded it is 25rem wide with a 0 8 20 .2 shadow, width easing
 * over .3s and titles 15.96/700 gray-05 16px after the icon. Icons are live's own glyphs.
 */
export function PortalSideMenu({ active, expanded = false, onToggle, items = PORTAL_MENU, assetsPath = '/assets', className }: PortalSideMenuProps) {
  const icon = (k: string) => ({ ['--i' as string]: `url(${assetsPath}/live-icons/nav-${k}.svg)` }) as React.CSSProperties;
  return (
    <nav className={cx(styles.menu, expanded && styles.expanded, className)} aria-label="Agency portal">
      <button type="button" className={styles.header} aria-label="Burger menu" aria-expanded={expanded} onClick={onToggle}>
        <span className={styles.icon} style={icon('menu')} aria-hidden="true" />
        <span className={styles.brand}>dubizzle Pro</span>
      </button>
      {items.map((it) => (
        <a key={it.key} href={it.href ?? '#'} className={cx(styles.item, it.key === active && styles.active)} aria-current={it.key === active ? 'page' : undefined}>
          <span className={styles.icon} style={icon(it.key)} aria-hidden="true" />
          <span className={styles.title}>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
