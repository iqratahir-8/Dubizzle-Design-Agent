import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { BoughtPackagesIcon, MyJobsIcon, PartnerIcon, PublicProfileIcon, WalletIcon } from '../icons';
import styles from './AccountMenu.module.css';

export interface AccountMenuRow {
  title: string;
  subtitle?: string;
  href?: string;
  icon?: ReactNode;
}

export interface AccountMenuProps {
  name: string;
  picture?: string;
  verifyLabel?: string | null;
  /** The card above the menu — "Favorites" on live. */
  shortcutLabel?: string | null;
  promo?: { title: string; subtitle?: string } | null;
  /** Rows in groups; live separates the groups with a grey band. */
  groups?: AccountMenuRow[][];
  onSelect?: (title: string) => void;
  className?: string;
}

/** The rows live shows on the mobile account page. */
export const ACCOUNT_MENU_GROUPS: AccountMenuRow[][] = [
  [
    { title: 'Public Profile', subtitle: 'See how others view your profile', icon: <PublicProfileIcon size={24} /> },
    { title: 'My Jobs', subtitle: "Jobs you've applied for", icon: <MyJobsIcon size={24} /> },
    { title: 'Bought Packages & Billing', subtitle: 'See your payment history', icon: <BoughtPackagesIcon size={24} /> },
    { title: 'Dubizzle Wallet', subtitle: 'Balance: EGP 0', icon: <WalletIcon size={24} /> },
  ],
  [{ title: 'Partner with dubizzle', subtitle: 'Get exclusive offers', icon: <PartnerIcon size={24} /> }],
];

/**
 * The account page behind the bottom nav's Account tab — the mobile counterpart of the
 * header's `UserMenu`, but a page: avatar, verify link, the Favorites card, the packages
 * banner, then title-and-subtitle rows. Measured on the live mobile account page (redacted
 * capture), see docs/LIVE-MEASUREMENTS.md.
 */
export function AccountMenu({
  name,
  picture,
  verifyLabel = 'Get Verified Now',
  shortcutLabel = 'Favorites',
  promo = { title: 'Buy Discounted Packages', subtitle: 'Save big on exclusive packages' },
  groups = ACCOUNT_MENU_GROUPS,
  onSelect,
  className,
}: AccountMenuProps) {
  return (
    <div className={cx(styles.page, className)}>
      <div className={styles.head}>
        <span className={styles.avatar}>
          {picture ? <img src={picture} alt="" /> : (name || '?').trim().charAt(0).toUpperCase()}
        </span>
        <span className={styles.name}>{name}</span>
      </div>

      {verifyLabel && (
        <button type="button" className={styles.verify} onClick={() => onSelect?.(verifyLabel)}>
          <svg className={styles.verifyIcon} width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.4 2.1 3.2-.3.9 3.1 2.7 1.7-1.4 2.9 1.4 2.9-2.7 1.7-.9 3.1-3.2-.3L12 21l-2.4-2.1-3.2.3-.9-3.1L2.8 14.4 4.2 11.5 2.8 8.6l2.7-1.7.9-3.1 3.2.3L12 2zm-1 12.6l5-5-1.4-1.4-3.6 3.6-1.6-1.6L8 11.6l3 3z" />
          </svg>
          <span className={styles.verifyLabel}>{verifyLabel}</span>
          <svg className={styles.chevron} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {shortcutLabel && (
        <button type="button" className={styles.shortcut} onClick={() => onSelect?.(shortcutLabel)}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--red-05)" strokeWidth={2} aria-hidden="true">
            <path d="M12 20s-7-4.6-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7-1.2C19 15.4 12 20 12 20z" strokeLinejoin="round" />
          </svg>
          <span className={styles.shortcutLabel}>{shortcutLabel}</span>
        </button>
      )}

      {promo && (
        <button type="button" className={styles.promo} onClick={() => onSelect?.(promo.title)}>
          <span className={styles.promoText}>
            <span className={styles.promoTitle}>{promo.title}</span>
            {promo.subtitle && <span className={styles.promoSubtitle}>{promo.subtitle}</span>}
          </span>
          <svg className={styles.chevron} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {groups.map((group, index) => (
        <div key={index} className={styles.group}>
          {group.map((row) => (
            <a key={row.title} className={styles.row} href={row.href ?? '#'} onClick={() => onSelect?.(row.title)}>
              {row.icon && <span className={styles.rowIcon}>{row.icon}</span>}
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{row.title}</span>
                {row.subtitle && <span className={styles.rowSubtitle}>{row.subtitle}</span>}
              </span>
              <svg className={styles.chevron} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
