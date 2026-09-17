import { cx } from '../../utils/cx';
import styles from './SearchSuggestions.module.css';

export interface SearchSuggestion {
  /** What the user typed, as the row repeats it. */
  query: string;
  /** Category the search would run in, e.g. "Cars for Sale". */
  category?: string;
}

export interface SearchSuggestionsProps {
  suggestions?: SearchSuggestion[];
  /** Row under the pointer / keyboard cursor. */
  activeIndex?: number;
  onSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

/**
 * The suggestions under the header's search field: one row per query-and-category pair, with
 * an arrow at the end. Measured on the live header (docs/LIVE-MEASUREMENTS.md) — rows are 61
 * tall, the active one sits on `--gray-01`, and the panel takes the search field's width.
 */
export function SearchSuggestions({ suggestions = [], activeIndex, onSelect, className }: SearchSuggestionsProps) {
  return (
    <div className={cx(styles.panel, className)} role="listbox">
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.query}-${suggestion.category ?? index}`}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          className={cx(styles.row, index === activeIndex && styles.active)}
          onClick={() => onSelect?.(suggestion)}
        >
          <span className={styles.text}>
            <span className={styles.query}>{suggestion.query}</span>
            {suggestion.category && <span className={styles.category}>{suggestion.category}</span>}
          </span>
          <svg className={styles.arrow} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}
