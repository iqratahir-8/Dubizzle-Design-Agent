import { cx } from '../../utils/cx';
import styles from './MobileSearchPage.module.css';

export interface MobileSearchSuggestion {
  /** The part that matches what was typed — live prints it bold. */
  query: string;
  category?: string;
}

export interface MobileSearchPageProps {
  value?: string;
  placeholder?: string;
  suggestions?: MobileSearchSuggestion[];
  /** Row under the finger / keyboard cursor. */
  activeIndex?: number;
  onBack?: () => void;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: MobileSearchSuggestion) => void;
  className?: string;
}

/**
 * Search on mobile is a page, not a dropdown: tapping the header's search field opens this
 * over the page — a back chevron, the field, and the suggestions underneath.
 * Measured on the live mobile home (docs/LIVE-MEASUREMENTS.md).
 */
export function MobileSearchPage({
  value = '',
  placeholder = 'Start searching for great finds',
  suggestions = [],
  activeIndex,
  onBack,
  onChange,
  onSelect,
  className,
}: MobileSearchPageProps) {
  return (
    <div className={cx(styles.page, className)}>
      <div className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          <svg width={15} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.field}>
          <svg className={styles.fieldIcon} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.input}
            type="search"
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange?.(event.target.value)}
          />
        </div>
      </div>

      <ul className={styles.list}>
        {suggestions.map((suggestion, index) => (
          <li key={`${suggestion.query}-${suggestion.category ?? index}`} className={cx(styles.row, index === activeIndex && styles.active)}>
            <button type="button" className={styles.rowButton} onClick={() => onSelect?.(suggestion)}>
              <span className={styles.text}>
                <em className={styles.query}>{suggestion.query}</em>
                {suggestion.category && <span className={styles.category}>{suggestion.category}</span>}
              </span>
              <svg className={styles.arrow} width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
