import { useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import styles from './Select.module.css';

export interface SelectProps {
  label?: string;
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

/** Dropdown select with an options list, placeholder, and error state. */
export function Select({
  label,
  value,
  options = [],
  onChange,
  placeholder,
  disabled = false,
  error,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div className={cx(styles.wrapper, className)} ref={rootRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        className={cx(
          styles.control,
          value && styles.hasValue,
          error && styles.error,
          disabled && styles.disabled,
          open && styles.open,
        )}
        onClick={() => !disabled && setOpen((o) => !o)}
        role="combobox"
        aria-expanded={open}
        aria-disabled={disabled}
      >
        {value || placeholder || 'Select…'}
        <svg className={styles.chevron} width={16} height={16} viewBox="0 0 16 16">
          <path d="M4 6l4 4 4-4" stroke="#919395" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </svg>
      </div>
      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={cx(styles.option, opt === value && styles.selected)}
              onClick={() => {
                onChange?.(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
