import { cx } from '../../utils/cx';
import styles from './AgencyPageHeading.module.css';

export interface AgencyPageHeadingProps {
  title: string;
  /** Grey line under the title, e.g. "(Previously Known as Agents)". */
  subtitle?: string;
  className?: string;
}

/**
 * Page title of every agency-portal screen. Repo: horizontal/agencyPortal/components/
 * agencyPageHeading.tsx. Live (2026-09-21): 32/700, line-height 1.1, letter-spacing -1px —
 * live tightens the tracking, which the repo stylesheet does not show.
 */
export function AgencyPageHeading({ title, subtitle, className }: AgencyPageHeadingProps) {
  return (
    <div className={cx(styles.heading, className)}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
