import { cx } from '../../utils/cx';
import styles from './CreditsSummary.module.css';

export interface CreditsSummaryProps {
  available: number;
  used: number;
  total: number;
  assignedToAgents: number;
  assignedUsed: number;
  usedByOwner: number;
  /** e.g. "10 October 2026 at 11:39" */
  expiresOn?: string;
  assetsPath?: string;
  className?: string;
}

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * The panel under "Available credits" in the portal header. Repo: horizontal/agencyPortal/
 * components/creditsSummary.tsx (goldenGradient variant) + the repo's coin artwork. Live
 * (portal-ads-credits, 2026-09-22): 37.5rem, 16px padding, radius 6, yellow-02 → white
 * gradient, --shadow-raised; label 15.96, value 23.94/700 beside a 24px coin; usage bar;
 * legend with brown-01 / yellow-05 markers; expiry 12.04.
 */
export function CreditsSummary({ available, used, total, assignedToAgents, assignedUsed, usedByOwner, expiresOn, assetsPath = '/assets', className }: CreditsSummaryProps) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div className={cx(styles.panel, className)}>
      <img className={styles.coins} src={`${assetsPath}/portal/coins.svg`} alt="" />
      <div className={styles.available}>
        <span className={styles.label}>Available credits</span>
        <span className={styles.value}><img className={styles.coin} src={`${assetsPath}/portal/coin.svg`} alt="" />{fmt(available)}</span>
      </div>
      <div className={styles.usage}>
        <span className={styles.ratio}><b>{fmt(used)}</b> / {fmt(total)}</span>
        <span className={styles.bar} role="progressbar" aria-valuenow={used} aria-valuemax={total}><span className={styles.fill} style={{ width: `${pct}%` }} /></span>
      </div>
      <ul className={styles.legend}>
        <li>Assigned to Agents <b>{fmt(assignedToAgents)}</b> (Used <b>{fmt(assignedUsed)}</b>)</li>
        <li>Used by Owner <b>{fmt(usedByOwner)}</b></li>
      </ul>
      {expiresOn && <span className={styles.expires}>Expires on {expiresOn}</span>}
    </div>
  );
}
