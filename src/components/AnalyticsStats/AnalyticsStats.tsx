import { cx } from '../../utils/cx';
import styles from './AnalyticsStats.module.css';

export interface AnalyticsStat {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AnalyticsStatsProps {
  stats: AnalyticsStat[];
  className?: string;
}

/**
 * The impressions / views / leads row on an Agency Ads card. Repo: horizontal/agencyPortal/
 * components/analyticsStats.tsx: 32px icon tile (gray-01, radius 4, 24px icon), 16px apart,
 * value and label 8px apart on a 32px line.
 */
export function AnalyticsStats({ stats, className }: AnalyticsStatsProps) {
  return (
    <div className={cx(styles.row, className)}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          {s.icon && <span className={styles.iconWrapper}>{s.icon}</span>}
          <span className={styles.value}>{s.value} {s.label}</span>
        </div>
      ))}
    </div>
  );
}
