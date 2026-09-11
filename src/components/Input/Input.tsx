import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { cx } from '../../utils/cx';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  className?: string;
}

/** Text input with label, placeholder, error state, and icon slot. */
export function Input({
  label,
  value,
  onChange,
  error,
  disabled = false,
  type = 'text',
  icon,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cx(styles.wrapper, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={cx(styles.field, disabled && styles.disabled, error && styles.error)}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={styles.input}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
