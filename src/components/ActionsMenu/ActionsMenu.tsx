import { cx } from '../../utils/cx';
import styles from './ActionsMenu.module.css';

export interface ActionsMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  /** Destructive rows read the same on live (no red); flag kept for a11y/tests. */
  destructive?: boolean;
}

export interface ActionsMenuProps {
  items: ActionsMenuItem[];
  /**
   * ad    — the ⋯ menu on an Agency Ads card: 18rem, 48px rows, 14/21, --shadow-overlay
   * agent — the ⋮ menu on an agent row: 16/24 rows 16px apart, shadow 0 4 10 .24
   * Both measured on live (portal-ads-actions, portal-agents-actions, 2026-09-22).
   */
  variant?: 'ad' | 'agent';
  className?: string;
}

/**
 * Row / card actions dropdown of the agency portal. Repo: horizontal/agencyPortal/components/
 * generalActionsDropdown.tsx (+ agentActions.tsx). The two live menus differ in type and
 * rhythm, so both are kept rather than averaged.
 */
export function ActionsMenu({ items, variant = 'ad', className }: ActionsMenuProps) {
  return (
    <div className={cx(styles.menu, styles[variant], className)} role="menu">
      {items.map((i) => (
        <button key={i.label} type="button" role="menuitem" className={styles.item} onClick={i.onClick}>
          {i.icon && <span className={styles.icon} aria-hidden="true">{i.icon}</span>}
          <span>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The actions live offers on an active Agency Ads card. */
export const AD_ACTIONS = ['Edit Now', 'Mark as sold', 'Deactivate Ad', 'Assign Agent'];
/** The actions live offers on an agent row. */
export const AGENT_ACTIONS = ['Change Ads Ownership', 'Update Credits', 'Remove Agent', 'Unassign Agent Ads'];
