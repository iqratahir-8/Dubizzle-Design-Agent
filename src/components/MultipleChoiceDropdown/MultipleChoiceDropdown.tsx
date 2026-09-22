import { useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import styles from './MultipleChoiceDropdown.module.css';

export interface MultipleChoiceDropdownProps {
  /** Resting text of the field, e.g. "Experience Level". */
  label: string;
  options: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  /** "multiple" = checklist that stays open (live); "single" = pick one and close. */
  mode?: 'multiple' | 'single';
  /** Force the menu open (screenshots, stories). Uncontrolled otherwise. */
  open?: boolean;
  disabled?: boolean;
  /** Field width; live fields fill their grid cell. */
  width?: string;
  /** Menu width; live checklists are 24rem, the category list 35.2rem. */
  menuWidth?: string;
  /** Where the live chevron glyph lives (src/assets/live-icons). */
  assetsPath?: string;
  className?: string;
}

/**
 * Filter dropdown of the agency portal — the field and the checklist it opens. Repo:
 * horizontal/agencyPortal/components/multipleChoiceDropdown.tsx. Option lists live offers
 * are in design-kit/content/portal-filters.json (read off live).
 *
 * Live (2026-09-21): field 48 tall, 1px gray-02, radius 6, label 15.96px at 12px inset,
 * 24px chevron 16px from the edge. Menu 15px below, 24rem, radius 6,
 * shadow 0 4 10 rgba(0,0,0,.16), 16px top padding; rows 44 tall, 10/16 padding, 14/24.
 */
export function MultipleChoiceDropdown({
  label, options, value = [], onChange, mode = 'multiple', open, disabled = false, width, menuWidth, assetsPath = '/assets', className,
}: MultipleChoiceDropdownProps) {
  const [isOpen, setOpen] = useState(false);
  const shown = open ?? isOpen;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [isOpen]);

  const toggle = (o: string) => {
    if (mode === 'single') { onChange?.(value[0] === o ? [] : [o]); setOpen(false); return; }
    onChange?.(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  };
  const title = value.length === 0 ? label : value.length === 1 ? value[0] : `${value[0]} +${value.length - 1}`;

  return (
    <div ref={ref} className={cx(styles.root, className)} style={width ? { width } : undefined}>
      <button
        type="button"
        className={cx(styles.field, disabled && styles.disabled)}
        aria-haspopup="listbox"
        aria-expanded={shown}
        disabled={disabled}
        onClick={() => setOpen(!shown)}
      >
        <span className={cx(styles.title, value.length > 0 && styles.picked)}>{title}</span>
        <img src={`${assetsPath}/live-icons/chevron-down-thin.svg`} alt="" width={20} height={20} className={cx(styles.chevron, shown && styles.chevronOpen)} />
      </button>
      {shown && (
        <div className={styles.menu} role="listbox" aria-multiselectable={mode === 'multiple'} style={menuWidth ? { width: menuWidth } : undefined}>
          {options.map((o) => {
            const on = value.includes(o);
            return (
              <div key={o} role="option" aria-selected={on} className={cx(styles.entry, mode === 'single' && on && styles.entryOn)} onClick={() => toggle(o)}>
                {mode === 'multiple' && (
                  <span className={cx(styles.box, on && styles.boxOn)} aria-hidden="true">
                    {on && (
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                )}
                <span>{o}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
