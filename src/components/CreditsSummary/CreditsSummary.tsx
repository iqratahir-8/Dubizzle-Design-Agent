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
 * components/creditsSummary.tsx (goldenGradient) + the repo's coin artwork. Anatomy copied
 * from the live capture (portal-ads-credits, 2026-09-22) and verified by npm run check:live:
 * 37.5rem, 16 padding, radius 6, yellow-02 → white, --shadow-raised; 15.96 label over a
 * 24×36 coin + 23.94/700 value; right-aligned "used / total" in gray-05; a 12px bar,
 * radius 20, in three 1px-apart segments (agents brown-01 · owner yellow-05 · left gray-02);
 * disc legend pulled 19px toward its markers, bold numbers 2px apart; 17px clock + expiry.
 */
export function CreditsSummary({ available, used, total, assignedToAgents, assignedUsed, usedByOwner, expiresOn, assetsPath = '/assets', className }: CreditsSummaryProps) {
  const pct = (n: number) => (total > 0 ? `${Math.max(0, Math.min(100, (n / total) * 100))}%` : '0%');
  return (
    <div className={cx(styles.panel, className)}>
      <div className={styles.top}>
        <div className={styles.available}>
          <span className={styles.label}>Available credits</span>
          <span className={styles.value}><img className={styles.coin} src={`${assetsPath}/portal/coin.svg`} alt="" />{fmt(available)}</span>
        </div>
        <img className={styles.coins} src={`${assetsPath}/portal/coins.svg`} alt="" />
      </div>
      <div className={styles.usage}>
        <div className={styles.ratio}><span><b>{fmt(used)}</b> / {fmt(total)}</span></div>
        <div className={styles.bar} role="progressbar" aria-valuenow={used} aria-valuemax={total}>
          <span className={styles.agents} style={{ width: pct(assignedUsed) }} />
          <span className={styles.owner} style={{ width: pct(usedByOwner) }} />
          <span className={styles.left} />
        </div>
      </div>
      <div className={styles.assignments}>
        <ul className={styles.legend}>
          <li><span>Assigned to Agents <b>{fmt(assignedToAgents)}</b> (Used <b>{fmt(assignedUsed)}</b>)</span></li>
          <li><span>Used by Owner <b>{fmt(usedByOwner)}</b></span></li>
        </ul>
      </div>
      {expiresOn && (
        <div className={styles.expires}>
          <img src={`${assetsPath}/live-icons/clock.svg`} alt="" width={17} height={17} />
          <span>Expires on {expiresOn}</span>
        </div>
      )}
    </div>
  );
}
