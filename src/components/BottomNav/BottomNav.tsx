import { cx } from '../../utils/cx';
import { NavAccountIcon, NavChatIcon, NavHomeIcon, NavMyAdsIcon, NavSellIcon } from '../icons';
import styles from './BottomNav.module.css';

export type BottomNavItem = 'home' | 'chat' | 'myAds' | 'account';

export interface BottomNavProps {
  active?: BottomNavItem;
  /** Pin to the bottom of the viewport (the live behaviour). Off in stories and side-by-side mocks. */
  fixed?: boolean;
  onSell?: () => void;
  className?: string;
}

const ITEMS = [
  { id: 'home', label: 'Home', Icon: NavHomeIcon },
  { id: 'chat', label: 'Chat', Icon: NavChatIcon },
  null, // Sell
  { id: 'myAds', label: 'My Ads', Icon: NavMyAdsIcon },
  { id: 'account', label: 'Account', Icon: NavAccountIcon },
] as const;

/** Mobile web bottom navigation — Home, Chat, Sell, My Ads, Account (dubizzle.com.eg home and landing pages). */
export function BottomNav({ active = 'home', fixed = false, onSell, className }: BottomNavProps) {
  return (
    <nav className={cx(styles.nav, fixed && styles.fixed, className)} aria-label="Primary">
      {ITEMS.map((item) =>
        item ? (
          <a key={item.id} href="#" className={cx(styles.item, active === item.id && styles.active)} aria-current={active === item.id ? 'page' : undefined}>
            <item.Icon size={24} />
            <span className={styles.label}>{item.label}</span>
          </a>
        ) : (
          <button key="sell" type="button" className={styles.sell} onClick={onSell}>
            <NavSellIcon size={44} />
            Sell
          </button>
        ),
      )}
    </nav>
  );
}
