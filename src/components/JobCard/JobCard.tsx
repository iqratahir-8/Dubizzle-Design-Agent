import { cx } from '../../utils/cx';
import styles from './JobCard.module.css';

export interface JobCardProps {
  title: string;
  location: string;
  /** e.g. "Hybrid", "On Site" — after a "·" on the location line */
  workplace?: string;
  expires: string;
  candidates: number;
  newCandidates?: number;
  /** "Disabled" / "Active" pill — live shows Disabled on expired jobs */
  state?: string;
  selected?: boolean;
  onSelect?: () => void;
  assetsPath?: string;
  className?: string;
}

/**
 * The job selector card at the top of Candidates. Repo: horizontal/agencyPortal/components/
 * agencyJobCard.tsx. Live (portal-candidates): 16 padding, radius 8, white; resting 1px
 * gray-03, selected 2px red-04; state pill 24 tall (gray-02 bg, gray-04 12/700); title
 * 16/700; 12×16 pin + location · workplace; 16px calendar + expiry; 14/700 blue count.
 */
export function JobCard({ title, location, workplace, expires, candidates, newCandidates, state = 'Disabled', selected = false, onSelect, assetsPath = '/assets', className }: JobCardProps) {
  return (
    <button type="button" className={cx(styles.card, selected && styles.selected, className)} aria-pressed={selected} onClick={onSelect}>
      <div className={styles.stateRow}><span className={styles.state}>{state}</span></div>
      <div className={styles.body}>
        <span className={styles.title}>{title}</span>
        <div className={styles.lines}>
          <div className={styles.line}>
            <img className={styles.pin} src={`${assetsPath}/live-icons/pin-job-16.svg`} alt="" width={16} height={16} />
            <span className={styles.text}>{location}{workplace && <><span className={styles.dot}>·</span>{workplace}</>}</span>
          </div>
          <div className={styles.line}>
            <img src={`${assetsPath}/live-icons/calendar-job.svg`} alt="" width={16} height={16} />
            <span className={styles.text}>Expires in {expires}</span>
          </div>
        </div>
      </div>
      <span className={styles.count}>{candidates} Candidates{newCandidates !== undefined ? ` (${newCandidates} new)` : ''}</span>
    </button>
  );
}
