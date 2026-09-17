import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import {
  BlogIcon, BoughtPackagesIcon, EditProfileIcon, HelpIcon, LogoutIcon, MyJobsIcon,
  PartnerIcon, PublicProfileIcon, SettingsIcon, WalletIcon,
} from '../icons';
import styles from './UserMenu.module.css';

export interface UserMenuItem {
  label: string;
  href?: string;
  /** 20px icon at the start of the row. */
  icon?: ReactNode;
}

export interface UserMenuPromo {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export interface UserMenuProps {
  name: string;
  /** Avatar image; falls back to the initial on a red disc, like the header. */
  picture?: string;
  verifyLabel?: string | null;
  /** The highlighted row under the name — "Buy Discounted Packages" on live. */
  promo?: UserMenuPromo | null;
  /** Rows, in groups: live separates them with a 4px gap of the panel's grey. */
  groups?: UserMenuItem[][];
  onSelect?: (label: string) => void;
  className?: string;
}

/** The menu live shows a signed-in individual account, with the icons the live rows carry. */
export const USER_MENU_GROUPS: UserMenuItem[][] = [
  [
    { label: 'Edit Profile', icon: <EditProfileIcon size={20} /> },
    { label: 'Public Profile', icon: <PublicProfileIcon size={20} /> },
    { label: 'My Jobs', icon: <MyJobsIcon size={20} /> },
    { label: 'Bought Packages & Billing', icon: <BoughtPackagesIcon size={20} /> },
    { label: 'Dubizzle Wallet', icon: <WalletIcon size={20} /> },
  ],
  [{ label: 'Partner with dubizzle', icon: <PartnerIcon size={20} /> }],
  [
    { label: 'Settings', icon: <SettingsIcon size={20} /> },
    { label: 'Blog', icon: <BlogIcon size={20} /> },
    { label: 'Help & Support', icon: <HelpIcon size={20} /> },
    { label: 'Logout', icon: <LogoutIcon size={20} /> },
  ],
];

/**
 * The account menu under the header's avatar chip. Measured on the live signed-in header
 * (docs/LIVE-MEASUREMENTS.md): 340 wide, 12px radius, white groups separated by 4px of the
 * panel's own grey.
 */
export function UserMenu({
  name,
  picture,
  verifyLabel = 'Get Verified Now',
  promo = { title: 'Buy Discounted Packages', subtitle: 'Save big on exclusive packages' },
  groups = USER_MENU_GROUPS,
  onSelect,
  className,
}: UserMenuProps) {
  return (
    <div className={cx(styles.panel, className)}>
      <div className={styles.group}>
        <div className={styles.header}>
          <span className={styles.avatar}>
            {picture ? <img src={picture} alt="" /> : (name || '?').trim().charAt(0).toUpperCase()}
          </span>
          <span className={styles.identity}>
            <span className={styles.name}>{name}</span>
            {verifyLabel && (
              <a className={styles.verify} href="#">
                {verifyLabel}
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </span>
        </div>

        {promo && (
          <button type="button" className={styles.promo} onClick={() => onSelect?.(promo.title)}>
            {promo.icon && <span className={styles.promoIcon}>{promo.icon}</span>}
            <span className={styles.promoText}>
              <span className={styles.promoTitle}>{promo.title}</span>
              {promo.subtitle && <span className={styles.promoSubtitle}>{promo.subtitle}</span>}
            </span>
            <svg className={styles.chevron} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {groups.map((group, index) => (
        <div key={index} className={styles.group}>
          {group.map((item) => (
            <a key={item.label} className={styles.row} href={item.href ?? '#'} onClick={() => onSelect?.(item.label)}>
              {item.icon && <span className={styles.rowIcon}>{item.icon}</span>}
              <span className={styles.rowLabel}>{item.label}</span>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
