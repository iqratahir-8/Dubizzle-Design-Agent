import { cx } from '../../utils/cx';
import styles from './AdSpecsStrip.module.css';

export interface AdSpec {
  /** File name in the icons folder, without the extension — e.g. "year". */
  icon: string;
  label: string;
  value: string;
}

export interface AdSpecsStripProps {
  specs: AdSpec[];
  assetsPath?: string;
  className?: string;
}

/**
 * The headline specs an ad detail page repeats under the price — year, kilometres,
 * transmission and fuel on a car; beds, baths and area on a property. Anatomy from the live
 * capture (car-dpv.desktop, 2026-09-23), verified by npm run check:live: one 78px --gray-01
 * band on a 1px --gray-02 border at radius 6, split into equal cells of 16 padding, each a
 * 24px icon then 12 then the 14/16.8 label over the 18/27 bold value.
 */
export function AdSpecsStrip({ specs, assetsPath = '/assets', className }: AdSpecsStripProps) {
  return (
    <div className={cx(styles.strip, className)}>
      {specs.map((spec) => (
        <div key={spec.label} className={styles.cell}>
          <img
            className={styles.icon}
            src={`${assetsPath}/live-icons/${spec.icon}.svg`}
            alt=""
            width={24}
            height={24}
          />
          <span className={styles.text}>
            <span className={styles.label}>{spec.label}</span>
            <span className={styles.value}>{spec.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
