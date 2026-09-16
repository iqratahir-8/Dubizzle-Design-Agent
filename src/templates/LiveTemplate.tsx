import { useEffect, useRef, useState } from 'react';
import styles from './LiveTemplate.module.css';

/**
 * Shows a page template from `design-kit/templates/` inside Storybook.
 *
 * Storybook and the design kit must show the same page, so this renders the very same file
 * the kit serves (`design-kit/templates/<device>/<name>.html`, mapped to `/templates/` by
 * `.storybook/main.ts`) in an iframe at the real viewport width, scaled to fit the canvas.
 * Hand-rebuilding these pages in React is what made them drift out of date.
 */
export type TemplateDevice = 'desktop' | 'mobile';

export interface LiveTemplateProps {
  /** File name without extension, e.g. `search-property`. */
  name: string;
  /** Human label, e.g. "Search results — property". */
  label?: string;
  device?: TemplateDevice;
  /** Devices this template exists for. */
  layouts?: TemplateDevice[];
  /** Frozen capture of a real page (false = hand-built approximation). */
  live?: boolean;
  /** Built from a logged-in capture, so it only exists on the machine that captured it. */
  local?: boolean;
  /** Capture date, from the template's `live-template` meta stamp. */
  captured?: string;
  /** Live URL the capture came from. */
  origin?: string;
}

const SIZES: Record<TemplateDevice, { width: number; height: number }> = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

export function LiveTemplate({
  name,
  label,
  device = 'desktop',
  layouts = ['desktop', 'mobile'],
  live = true,
  local = false,
  captured,
  origin,
}: LiveTemplateProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState<'checking' | 'ok' | 'missing'>('checking');

  const { width, height } = SIZES[device];
  const exists = layouts.includes(device);
  const url = `/templates/${device}/${name}.html`;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => setScale(Math.min(1, host.clientWidth / width));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    if (!exists) return;
    let cancelled = false;
    setStatus('checking');
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? 'ok' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [url, exists]);

  return (
    <div className={styles.root} ref={hostRef}>
      <div className={styles.bar}>
        <strong className={styles.title}>{label ?? name}</strong>
        <span className={styles.badge} data-live={live || undefined}>
          {live ? 'Live capture' : 'Hand-built'}
        </span>
        <code className={styles.path}>
          design-kit/templates/{device}/{name}.html
        </code>
        <span className={styles.spacer} />
        {captured && <span className={styles.meta}>captured {captured}</span>}
        {exists && (
          <a className={styles.link} href={url} target="_blank" rel="noreferrer">
            Open full page ↗
          </a>
        )}
        {origin && (
          <a className={styles.link} href={origin} target="_blank" rel="noreferrer">
            Live page ↗
          </a>
        )}
      </div>

      {!exists ? (
        <p className={styles.note}>
          No {device} template for <code>{name}</code> yet — switch the device control, or capture it (see the{' '}
          <code>live-capture</code> skill).
        </p>
      ) : status === 'missing' ? (
        <p className={styles.note}>
          {local
            ? 'This template is built from a redacted logged-in capture, so it stays on the machine that captured it and is not in the repository. Run the account captures, then npm run build:templates.'
            : `${url} is not being served. Restart Storybook so it picks up design-kit/templates, or run npm run build:templates.`}
        </p>
      ) : (
        <div className={styles.viewport} style={{ width: width * scale, height: height * scale }}>
          <iframe
            className={styles.frame}
            title={`${label ?? name} — ${device}`}
            src={url}
            width={width}
            height={height}
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      )}
    </div>
  );
}
