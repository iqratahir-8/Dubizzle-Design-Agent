import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Checkbox with label. Checked / unchecked / disabled states. */
export function Checkbox({ checked = false, onChange, label, disabled = false, className }: CheckboxProps) {
  return (
    <label className={cx(styles.label, disabled && styles.disabled, className)}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={cx(styles.box, checked && styles.checked)} aria-hidden="true">
        {checked && (
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 4" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
