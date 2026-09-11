import { cx } from '../../utils/cx';
import styles from './Radio.module.css';

export interface RadioProps {
  selected?: boolean;
  onChange?: () => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** Radio button with label. Selected / unselected / disabled states. */
export function Radio({ selected = false, onChange, label, disabled = false, name, className }: RadioProps) {
  return (
    <label className={cx(styles.label, disabled && styles.disabled, className)}>
      <input
        type="radio"
        className={styles.input}
        checked={selected}
        disabled={disabled}
        name={name}
        onChange={() => onChange?.()}
      />
      <span className={cx(styles.outer, selected && styles.selected)} aria-hidden="true">
        {selected && <span className={styles.dot} />}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
