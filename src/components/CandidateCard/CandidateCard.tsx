import { cx } from '../../utils/cx';
import styles from './CandidateCard.module.css';

export interface CandidateCardProps {
  name: string;
  location: string;
  /** Shown as bordered tags, e.g. "Current Job: Project engineer", "Experience: 5-10 Years". */
  tags: string[];
  appliedOn: string;
  isNew?: boolean;
  assetsPath?: string;
  className?: string;
}

/**
 * Applicant card on Candidates. Repo: horizontal/agencyPortal/jobApplications. Anatomy from
 * the live capture (portal-candidates, 2026-09-22), verified by npm run check:live:
 * 16px padding, 1px gray-02, radius 8, rows 16 apart; 40px neutral avatar + 19.88/700 name,
 * pale-blue "New" pill (radius 20) on the right; 24px pin + 14/21 location; 28px tags
 * (1px gray-02, radius 4, 4/8, 16/24) 8 apart, and a 16px calendar + "Applied on" right.
 * Names in stories are fixtures — applicants are real people.
 */
export function CandidateCard({ name, location, tags, appliedOn, isNew = false, assetsPath = '/assets', className }: CandidateCardProps) {
  return (
    <article className={cx(styles.card, className)}>
      <div className={styles.head}>
        <img className={styles.avatar} src={`${assetsPath}/portal/avatar-neutral.svg`} alt="" width={40} height={40} />
        <span className={styles.name}>{name}</span>
        {isNew && <span className={styles.new}>New</span>}
      </div>
      <div className={styles.row}>
        <img src={`${assetsPath}/live-icons/pin-24.svg`} alt="" width={24} height={24} />
        <span className={styles.meta}>{location}</span>
      </div>
      <div className={styles.foot}>
        <div className={styles.tags}>{tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}</div>
        <div className={styles.applied}>
          <img src={`${assetsPath}/live-icons/calendar-16.svg`} alt="" width={16} height={16} />
          <span className={styles.meta}>Applied on {appliedOn}</span>
        </div>
      </div>
    </article>
  );
}
