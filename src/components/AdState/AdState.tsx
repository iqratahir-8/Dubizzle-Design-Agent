import { cx } from '../../utils/cx';
import styles from './AdState.module.css';

export type AdStateVariant = 'active' | 'expired' | 'pending' | 'notPosted' | 'rejected' | 'sold' | 'disabled';

export interface AdStateProps {
  state: AdStateVariant;
  /** Text; defaults to the state name as live prints it. */
  children?: React.ReactNode;
  /** The larger pill that carries dates ("Active from 21 Sept to 21 Oct"). */
  showDates?: boolean;
  className?: string;
}

const LABEL: Record<AdStateVariant, string> = {
  active: 'Active', expired: 'Expired', pending: 'Pending', notPosted: 'Not posted',
  rejected: 'Rejected', sold: 'Sold', disabled: 'Disabled',
};

/**
 * Ad status badge of the agency portal. Repo: horizontal/agencyPortal/components/adState.tsx.
 * Live (Agency Ads card, ad details drawer): 24 tall, 4/8 padding, radius 4, 12/700;
 * the dated variant 30 tall, 14/700.
 */
export function AdState({ state, children, showDates = false, className }: AdStateProps) {
  return <span className={cx(styles.state, styles[state], showDates && styles.dates, className)}>{children ?? LABEL[state]}</span>;
}
