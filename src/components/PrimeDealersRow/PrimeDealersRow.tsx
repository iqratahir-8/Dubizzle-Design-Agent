import { cx } from '../../utils/cx';
import { CrownIcon } from '../icons';
import styles from './PrimeDealersRow.module.css';

export interface PrimeDealersRowProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

/** "Prime Dealers First" toggle row above mobile listing results (dubizzle.com.eg). */
export function PrimeDealersRow({ label = 'Prime Dealers First', checked = false, onChange, className }: PrimeDealersRowProps) {
  return (
    <label className={cx(styles.row, className)}>
      <span className={styles.left}>
        <CrownIcon size={32} />
        <span className={styles.label}>{label}</span>
      </span>
      <input type="checkbox" className={styles.input} checked={checked} onChange={(event) => onChange?.(event.target.checked)} />
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
    </label>
  );
}
