import { cx } from '../../utils/cx';
import { ContactButton } from '../ContactButton';
import type { ContactButtonVariant } from '../ContactButton';
import styles from './ContactBar.module.css';

export interface ContactBarProps {
  /** Which CTAs to show, in order. Live cars show Call + WhatsApp. */
  actions?: ContactButtonVariant[];
  /** Pinned to the bottom of the viewport, as on live. Off for previews and stories. */
  fixed?: boolean;
  onAction?: (variant: ContactButtonVariant) => void;
  className?: string;
}

/**
 * Sticky contact bar at the bottom of the mobile ad detail page — white, 1px top border,
 * buttons growing to fill the row (live: Call 152px, WhatsApp 198px at 390px wide).
 * Measured on the live mobile ad detail page (docs/LIVE-MEASUREMENTS.md).
 */
export function ContactBar({ actions = ['call', 'whatsapp'], fixed = false, onAction, className }: ContactBarProps) {
  return (
    <div className={cx(styles.bar, fixed && styles.fixed, className)}>
      <div className={styles.row}>
        {actions.map((variant) => (
          <ContactButton key={variant} variant={variant} grow onClick={() => onAction?.(variant)} />
        ))}
      </div>
    </div>
  );
}
