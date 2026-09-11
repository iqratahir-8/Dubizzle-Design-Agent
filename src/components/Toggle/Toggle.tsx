import { cx } from '../../utils/cx';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Toggle switch. Blue track when on, gray when off. */
export function Toggle({ checked = false, onChange, label, disabled = false, className }: ToggleProps) {
  return (
    <label className={cx(styles.label, disabled && styles.disabled, className)}>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={cx(styles.track, checked && styles.checked)} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
