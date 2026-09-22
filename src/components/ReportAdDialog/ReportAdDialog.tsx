import { useState } from 'react';
import { cx } from '../../utils/cx';
import { Dialog } from '../Dialog';
import styles from './ReportAdDialog.module.css';

/** The reasons live offers (dpv-report-form, 2026-09-22). */
export const REPORT_REASONS = ['Offensive content', 'Fraud', 'Duplicate ad', 'Product already sold', 'Wrong category', 'Product unavailable', 'Fake product', 'Indecent', 'Other'];

export interface ReportAdDialogProps {
  open: boolean;
  onClose?: () => void;
  onSubmit?: (reason: string, comment: string) => void;
  inline?: boolean;
  className?: string;
}

/**
 * "Report this ad" (signed in). Repo: dubizzle-facelift/adDetails/components/reportAd.tsx.
 * Live: title 23.94/700; radio rows 21 tall + 8 apart, a 20px ring 20px in, label 15px
 * after it; "Comment" area 84 tall on white; 0/500 counter 12.04 in gray; full-width
 * red 40px "Send complaint".
 */
export function ReportAdDialog({ open, onClose, onSubmit, inline, className }: ReportAdDialogProps) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  return (
    <Dialog open={open} onClose={onClose} inline={inline} className={className}>
      <div className={styles.body}>
        <h2 className={styles.title}>Item report</h2>
        <div role="radiogroup" className={styles.reasons}>
          {REPORT_REASONS.map((r) => (
            <label key={r} className={styles.reason}>
              <input type="radio" name="report-reason" className={styles.input} checked={reason === r} onChange={() => setReason(r)} />
              <span className={cx(styles.ring, reason === r && styles.ringOn)} aria-hidden="true" />
              <span>{r}</span>
            </label>
          ))}
        </div>
        <textarea className={styles.comment} placeholder="Comment" maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
        <span className={styles.count}>{comment.length}/500</span>
        <button type="button" className={styles.send} disabled={!reason} onClick={() => onSubmit?.(reason, comment)}>Send complaint</button>
      </div>
    </Dialog>
  );
}
