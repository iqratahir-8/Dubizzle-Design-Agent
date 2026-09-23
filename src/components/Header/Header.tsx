import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { cx } from '../../utils/cx';
import { MegaMenu, MEGA_MENUS } from '../MegaMenu';
import type { MegaMenuItem } from '../MegaMenu';
import styles from './Header.module.css';

export interface HeaderUser {
  /** Display name — rendered as given (the live app abbreviates to "Ahmed H."). */
  name: string;
  /** Avatar image URL. Falls back to a red initial circle. */
  picture?: string;
}

export type HeaderVertical = 'none' | 'motors' | 'property';
export type HeaderUserType = 'individual' | 'agency-owner' | 'agency-user';

export interface HeaderProps {
  /** Text shown in the location select. Defaults to "Egypt". */
  location?: string;
  /** Search field placeholder. */
  searchPlaceholder?: string;
  /** Which nav item wears the white tab. "none" = horizontal home (tab under the logo). */
  activeVertical?: HeaderVertical;
  /** Signed-in user. `undefined`/`null` renders the logged-out state. */
  user?: HeaderUser | null;
  /** Account type. Agency accounts get a Pro badge; agency users have no My Ads link. */
  userType?: HeaderUserType;
  /** Badge count on the Favourites icon. */
  favouritesCount?: number;
  /** Agency Portal chrome — pro logo instead of the marketplace vertical links. */
  showAgencyPortalLogo?: boolean;
  /** Fired on Enter or search-button click. */
  onSearch?: (query: string) => void;
  /** Fired when "Post Your Ad" is clicked. */
  onPostAd?: () => void;
  /** Fired when "Login or Signup" is clicked. */
  onLogin?: () => void;
  /**
   * Category strip under the search row, with the mega menu that opens on hover. Defaults to
   * the live menu (`MEGA_MENUS`); pass `false` for the pages that don't show it, or your own
   * items to try a different structure.
   */
  categories?: MegaMenuItem[] | false;
  /** Pins one category menu open — for stories and screenshots; hovering works regardless. */
  openCategory?: string;
  /** Relative path to the assets folder (icons, logos). Defaults to "/assets". */
  assetPath?: string;
  className?: string;
}

function Tab() {
  return (
    <>
      <span aria-hidden="true" className={styles.tabShadow} />
      <span aria-hidden="true" className={styles.tabFill} />
    </>
  );
}

function UserNavLink({
  icon,
  label,
  count,
  assetPath,
}: {
  icon: string;
  label: string;
  count?: number;
  assetPath: string;
}) {
  return (
    <a href="#" title={label} className={styles.userNavLink}>
      <span className={styles.userNavLinkInner}>
        <span className={styles.userNavIconWrap}>
          <img src={`${assetPath}/icons/${icon}.svg`} alt="" />
          {count ? <span className={styles.badgeCount}>{count}</span> : null}
        </span>
        <span className={styles.userNavText}>{label}</span>
      </span>
    </a>
  );
}

/**
 * dubizzle Egypt site header, recreated from the live dubizzle.com.eg markup
 * and the dubizzle-facelift `header/` package.
 *
 * Two rows: a Gray 00 band (logo, Motors/Property links, user center, Post
 * Your Ad) above a white row (location select + search field). The active
 * vertical is drawn as a white tab that bleeds into the white row below.
 */
export function Header({
  location = 'Egypt',
  searchPlaceholder = 'Find Cars, Mobile Phones and more...',
  activeVertical = 'none',
  user = null,
  userType = 'individual',
  favouritesCount,
  showAgencyPortalLogo = false,
  categories = MEGA_MENUS,
  openCategory,
  onSearch,
  onPostAd,
  onLogin,
  assetPath = '/assets',
  className,
}: HeaderProps) {
  const [query, setQuery] = useState('');
  const isPro = userType === 'agency-owner' || userType === 'agency-user';

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') onSearch?.(query);
  }

  function navLink(label: string, icon: string, key: HeaderVertical) {
    return (
      <a key={key} href="#" className={cx(styles.navLink, activeVertical === key && styles.navLinkActive)}>
        {activeVertical === key && <Tab />}
        <div className={styles.navLinkInner}>
          <img src={`${assetPath}/icons/nav-${icon}.svg`} alt="" />
          <span className={styles.navLabel}>{label}</span>
        </div>
      </a>
    );
  }

  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.band}>
        <div className={cx(styles.container, styles.row1)}>
          {showAgencyPortalLogo ? (
            <div className={styles.agencyLogo}>
              <img src={`${assetPath}/logo-pro.svg`} alt="dubizzle pro" />
            </div>
          ) : (
            <div className={styles.brandGroup}>
              <a href="#" className={styles.logoLink}>
                {activeVertical === 'none' && <Tab />}
                <img src={`${assetPath}/logo-en-full.svg`} alt="dubizzle" />
              </a>
              {navLink('Motors', 'motors', 'motors')}
              {navLink('Property', 'property', 'property')}
            </div>
          )}

          <div className={styles.userGroup}>
            {user && (
              <div className={styles.signedInNav}>
                <UserNavLink icon="notification-bell" label="Notifications" assetPath={assetPath} />
                <UserNavLink icon="header-heart" label="Favourites" count={favouritesCount} assetPath={assetPath} />
                <UserNavLink icon="header-chat" label="Chats" assetPath={assetPath} />
                {userType !== 'agency-user' && (
                  <UserNavLink icon="header-my-ads" label="My Ads" assetPath={assetPath} />
                )}
              </div>
            )}

            <a href="#" aria-label="language switch button" className={styles.langSwitch}>
              العربية
            </a>

            {user ? (
              <button type="button" className={styles.userMenu}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatar}>
                    {user.picture ? (
                      <img src={user.picture} alt="" />
                    ) : (
                      (user.name || '?').trim().charAt(0).toUpperCase()
                    )}
                  </div>
                  {isPro && <span className={styles.proBadge}>Pro</span>}
                </div>
                <span className={styles.userName}>{user.name}</span>
                <img src={`${assetPath}/icons/chevron-down.svg`} alt="" className={styles.chevron} />
              </button>
            ) : (
              <button type="button" aria-label="Login" onClick={onLogin} className={styles.loginButton}>
                <span className={styles.loginLabel}>Login or Signup</span>
              </button>
            )}

            <button type="button" aria-label="Post your ad" onClick={onPostAd} className={styles.postAdButton}>
              Post Your Ad
            </button>
          </div>
        </div>
      </div>

      <div className={cx(styles.container, styles.row2)}>
        <div className={styles.locationField}>
          <div aria-label="Location input" className={styles.locationControl}>
            <img
              src={`${assetPath}/icons/location-pin-header.svg`}
              alt=""
              aria-label="Location Icon"
              className={styles.locationIcon}
            />
            <span className={styles.locationText}>{location}</span>
            <img
              src={`${assetPath}/icons/select-location-chevron.svg`}
              alt="Select location"
              className={styles.locationChevron}
            />
          </div>
        </div>

        <div className={styles.searchWrap}>
          <div aria-label="Search input" className={styles.searchRow}>
            <div className={styles.searchField}>
              <input
                type="search"
                spellCheck={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className={styles.searchInput}
              />
            </div>
            <button type="button" aria-label="Search" onClick={() => onSearch?.(query)} className={styles.searchButton}>
              <img src={`${assetPath}/icons/search-white.svg`} alt="" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {categories !== false && categories.length > 0 && (
        <div className={styles.categoryBar}>
          <div className={styles.container}>
            <MegaMenu items={categories} openItem={openCategory} />
          </div>
        </div>
      )}
    </header>
  );
}
