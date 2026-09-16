import { cx } from '../../utils/cx';
import { ChevronRightIcon } from '../icons';
import styles from './MobileFooter.module.css';

export interface MobileFooterProps {
  /** Accordion rows, in order. */
  sections?: string[];
  socialIcons?: string[];
  appBadges?: string[];
  copyright?: string;
  tagline?: string;
  className?: string;
}

const SOCIAL = ['/icons/social/landing-twitter.svg', '/icons/social/landing-linkedin.svg', '/icons/social/landing-facebook.svg', '/icons/social/landing-youtube.svg', '/icons/social/landing-instagram.svg'];
const BADGES = ['/icons/brand/app-store-en.svg', '/icons/brand/google-play-en.svg', '/icons/brand/app-gallery.svg'];

/** Mobile web footer (dubizzle.com.eg): accordion rows, social icons, app badges and the copyright bar. */
export function MobileFooter({
  sections = ['Categories', 'About Us', 'Dubizzle', 'Countries'],
  socialIcons = SOCIAL,
  appBadges = BADGES,
  copyright = '© 2026 Dubizzle',
  tagline = 'Free Classifieds in Egypt.',
  className,
}: MobileFooterProps) {
  return (
    <footer className={cx(styles.footer, className)}>
      {sections.map((section) => (
        <button key={section} type="button" className={styles.row}>
          <span className={styles.rowLabel}>{section}</span>
          <ChevronRightIcon size={15} className={styles.chevron} />
        </button>
      ))}
      <div className={styles.follow}>
        <span className={styles.rowLabel}>Follow us</span>
        <div className={styles.social}>
          {socialIcons.map((icon) => (
            <a key={icon} href="#" className={styles.socialLink}>
              <img src={icon} alt="" />
            </a>
          ))}
        </div>
      </div>
      <div className={styles.badges}>
        {appBadges.map((badge) => (
          <a key={badge} href="#" className={styles.badge}>
            <img src={badge} alt="" />
          </a>
        ))}
      </div>
      <div className={styles.copyright}>
        <span className={styles.tagline}>{tagline}</span> {copyright}
      </div>
    </footer>
  );
}
