import { Fragment } from 'react';
import { cx } from '../../utils/cx';
import styles from './VipLeadCard.module.css';

export interface VipLeadCardProps {
  title: string;
  price: string;
  /** Spec chips separated by grey dots, e.g. ["2022", "Used", "130000", "Volkswagen"]. */
  specs: string[];
  location: string;
  date: string;
  imageSrc?: string;
  cost?: number;
  onPurchase?: () => void;
  assetsPath?: string;
  className?: string;
}

/**
 * A VIP lead on VIP Leads. Repo: horizontal/agencyPortal/vipLeads/vipLeadCard.tsx. Live
 * (portal-vip, 2026-09-22): 16 padding, 1px gray-02, radius 8, shadow 0 2 4 .2; 226×164
 * photo (radius 4); title + price 20/700/30; 14/700 black specs split by 6px gray-03 dots;
 * the buyer's contact is locked — three gray-02 bars with a 20px lock; location (16px pin,
 * 16/20) · date; red "Purchase ◎ 50" button, 40 tall, radius 8, 16/700.
 * Purchasing spends credits — captures never press it.
 */
export function VipLeadCard({ title, price, specs, location, date, imageSrc, cost = 50, onPurchase, assetsPath = '/assets', className }: VipLeadCardProps) {
  return (
    <article className={cx(styles.card, className)}>
      <div className={styles.media}>{imageSrc ? <img src={imageSrc} alt="" /> : <span className={styles.placeholder} />}</div>
      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.title}>{title}</div>
          <div className={styles.price}>{price}</div>
        </div>
        <div className={styles.mid}>
          <div className={styles.specs}>
            {specs.map((s, i) => <Fragment key={s + i}>{i > 0 && <span className={styles.dot} />}<span className={styles.spec}>{s}</span></Fragment>)}
          </div>
          <div className={styles.locked} aria-label="Contact details are locked until purchased">
            <span className={styles.bar} style={{ width: '15.5rem' }} />
            <span className={styles.bar} style={{ width: '13rem' }} />
            <span className={styles.bar} style={{ width: '14.3rem' }} />
            <img className={styles.lock} src={`${assetsPath}/live-icons/lock-20.svg`} alt="" width={20} height={20} />
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.where}>
            <span className={styles.loc}><img src={`${assetsPath}/live-icons/pin-16.svg`} alt="" width={16} height={16} /><span>{location}</span></span>
            <span className={styles.sep} />
            <span>{date}</span>
          </div>
          <button type="button" className={styles.purchase} onClick={onPurchase}>
            <span>Purchase</span>
            <span className={styles.cost}><img src={`${assetsPath}/portal/coin.svg`} alt="" width={16} height={16} /><span>{cost}</span></span>
          </button>
        </div>
      </div>
    </article>
  );
}
