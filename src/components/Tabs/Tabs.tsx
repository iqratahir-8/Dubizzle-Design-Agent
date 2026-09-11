import { cx } from '../../utils/cx';
import styles from './Tabs.module.css';

export type TabsVariant = 'segmented' | 'line';

export interface TabsProps {
  items?: string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
  variant?: TabsVariant;
  className?: string;
}

/** Tab navigation — segmented chips and line/underline variants. */
export function Tabs({ items = [], activeIndex = 0, onChange, variant = 'segmented', className }: TabsProps) {
  if (variant === 'line') {
    return (
      <div className={cx(styles.line, className)} role="tablist">
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={cx(styles.lineTab, i === activeIndex && styles.active)}
            onClick={() => onChange?.(i)}
          >
            {item}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cx(styles.segmented, className)} role="tablist">
      {items.map((item, i) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          className={cx(styles.segmentedTab, i === activeIndex && styles.active)}
          onClick={() => onChange?.(i)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
