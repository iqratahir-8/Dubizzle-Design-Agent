import { cx } from '../../utils/cx';
import styles from './Footer.module.css';

const COLUMNS = [
  { title: 'About Us', items: ['About Dubizzle Group', 'Careers', 'Contact Us', 'Dubizzle for Businesses'] },
  { title: 'Dubizzle', items: ['Blog', 'Help', 'Sitemap', 'Terms of use', 'Privacy Policy'] },
  { title: 'Countries', items: ['Bahrain', 'Jordan', 'Kuwait', 'Oman', 'Qatar', 'Saudi Arabia', 'UAE'] },
] as const;

const SOCIALS = ['twitter', 'linkedin', 'facebook', 'youtube', 'instagram'] as const;
const STORES = [
  ['app-store', 'App Store'],
  ['google-play', 'Google Play'],
  ['app-gallery', 'App Gallery'],
] as const;

export interface FooterProps {
  /** Relative path to the assets folder (social + store icons). Defaults to "/assets". */
  assetPath?: string;
  className?: string;
}

/**
 * dubizzle Egypt site footer, recreated from the live dubizzle.com.eg markup.
 * Four columns — About Us, Dubizzle, Countries, Follow us — over a Gray 02 legal bar.
 */
export function Footer({ assetPath = '/assets', className }: FooterProps) {
  return (
    <footer className={cx(styles.footer, className)}>
      <div className={styles.main}>
        <div className={styles.container}>
          {COLUMNS.map((col) => (
            <section key={col.title} className={styles.column}>
              <span className={styles.heading}>{col.title}</span>
              <ul className={styles.linkList}>
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#" className={styles.link}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className={styles.followColumn}>
            <span className={styles.heading}>Follow us</span>
            <div className={styles.socialRow}>
              {SOCIALS.map((s) => (
                <a key={s} href="#" className={styles.socialLink}>
                  <img src={`${assetPath}/social/${s}.svg`} alt={s} className={styles.socialIcon} />
                </a>
              ))}
            </div>
            <div className={styles.storeRow}>
              {STORES.map(([slug, alt]) => (
                <a key={slug} href="#" className={styles.socialLink}>
                  <img src={`${assetPath}/social/${slug}.svg`} alt={alt} className={styles.storeIcon} />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className={styles.legalBar}>
        <div className={styles.container} style={{ justifyContent: 'flex-end' }}>
          <div className={styles.legalText}>
            <span className={styles.legalBold}>Free Classifieds in Egypt.</span>
            &copy; 2026 Dubizzle
          </div>
        </div>
      </div>
    </footer>
  );
}
