import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './ContactButton.module.css';

export type ContactButtonVariant = 'chat' | 'call' | 'whatsapp';

const ICON_FILL: Record<ContactButtonVariant, string> = {
  chat: 'var(--red-05, #E00000)',
  call: 'var(--blue-05, #3A88EF)',
  whatsapp: '#43BB3F',
};

const DEFAULT_LABEL: Record<ContactButtonVariant, string> = {
  chat: 'Chat',
  call: 'Call',
  whatsapp: 'WhatsApp',
};

/* Path data lifted verbatim from the brand icon set — 20×20, filled. */
const ICON_PATH: Record<ContactButtonVariant, string> = {
  chat: 'M10 2c4.591 0 8.5 3.173 8.5 7.296 0 1.73-.7 3.307-1.848 4.544L16.74 19l-5.625-2.47a9.98 9.98 0 0 1-1.114.062c-4.591 0-8.5-3.173-8.5-7.296S5.409 2 10 2zm0 1.565c-3.902 0-6.88 2.66-6.88 5.73 0 3.073 2.977 5.732 6.88 5.732.384 0 .76-.027 1.126-.077l.234-.032 3.717 1.633-.056-3.328.237-.234c1.023-1.009 1.622-2.3 1.622-3.693 0-3.072-2.977-5.73-6.88-5.73zm.63 6.745a.803.803 0 1 1 0 1.606H7.03a.804.804 0 1 1 0-1.606h3.599zm2.576-3.493a.804.804 0 0 1 0 1.608H7.031a.804.804 0 0 1 0-1.608h6.175z',
  call: 'M16.06 10.827c-.176 0-.362-.056-.539-.096a7.6 7.6 0 0 1-1.055-.314 1.61 1.61 0 0 0-1.997.805l-.178.362a9.812 9.812 0 0 1-2.142-1.61A9.81 9.81 0 0 1 8.54 7.83l.338-.225a1.61 1.61 0 0 0 .805-1.998 8.32 8.32 0 0 1-.314-1.055 5.978 5.978 0 0 1-.097-.547A2.416 2.416 0 0 0 6.855 2H4.439a2.416 2.416 0 0 0-2.416 2.747 15.303 15.303 0 0 0 13.305 13.256h.306a2.416 2.416 0 0 0 2.208-1.431c.139-.313.21-.651.208-.993v-2.416a2.416 2.416 0 0 0-1.99-2.336zm.403 4.833a.806.806 0 0 1-.582.775.845.845 0 0 1-.352.03A13.692 13.692 0 0 1 3.682 4.561a.878.878 0 0 1 .201-.66.805.805 0 0 1 .604-.274h2.416a.805.805 0 0 1 .806.636 8.956 8.956 0 0 0 .491 1.9l-1.128.525a.805.805 0 0 0-.394 1.07 11.67 11.67 0 0 0 5.638 5.638c.196.081.416.081.612 0a.805.805 0 0 0 .459-.418l.5-1.128c.415.15.84.273 1.272.37.214.049.432.09.652.121a.805.805 0 0 1 .636.806l.016 2.513z',
  whatsapp: 'M10.038.95c1.373.001 2.728.313 3.961.914a9.008 9.008 0 0 1 3.154 2.553 8.929 8.929 0 0 1-.248 11.312 9.013 9.013 0 0 1-3.263 2.413 9.056 9.056 0 0 1-7.898-.331l-4.731 1.238-.084.021.023-.084 1.26-4.606a8.94 8.94 0 0 1 .021-8.946 9 9 0 0 1 3.3-3.28A9.057 9.057 0 0 1 10.037.95h.001zm.009 1.603A7.437 7.437 0 0 0 6.282 3.57a7.385 7.385 0 0 0-2.721 2.78 7.337 7.337 0 0 0 .205 7.483l.18.288.012.019-.006.021-.728 2.652 2.739-.715.02-.005.017.01.271.153h.001a7.308 7.308 0 0 0 3.765 1.028h.001a7.425 7.425 0 0 0 5.236-2.154 7.348 7.348 0 0 0 2.172-5.207 7.347 7.347 0 0 0-2.165-5.21 7.424 7.424 0 0 0-5.234-2.161zM6.862 5.747c.078 0 .154.003.225.005.071.002.138.004.2.004h.004a1.106 1.106 0 0 1 .112.003.37.37 0 0 1 .142.033c.1.048.198.156.295.38.095.222.256.612.4.958.071.173.139.336.192.46.052.124.088.209.101.233a.463.463 0 0 1 .02.435 1.36 1.36 0 0 1-.233.38c-.1.142-.213.275-.337.398l-.006.007-.001-.001a.291.291 0 0 0-.084.384l.13.21c.31.488.683.933 1.109 1.326H9.13c.463.409.986.744 1.55.995l.245.103.004.002a.42.42 0 0 0 .244.057c.061-.009.116-.043.175-.11.127-.144.559-.645.7-.866l.004-.004c.09-.114.18-.17.277-.181a.651.651 0 0 1 .286.057c.103.037.431.192.759.351.329.16.663.326.777.39h0c.11.048.203.087.277.125a.566.566 0 0 1 .14.095l.034.039.006.008.002.012c.061.37.013.748-.14 1.09l-.001.006-.044-.026.043.026a2.345 2.345 0 0 1-1.543 1.085h-.002c-.479.08-.97.049-1.435-.091a9.854 9.854 0 0 1-1.281-.48h-.002a10.091 10.091 0 0 1-3.862-3.372 4.501 4.501 0 0 1-.914-2.33l-.001-.004A2.595 2.595 0 0 1 6.23 6.04a.878.878 0 0 1 .63-.293h.002z',
};

export interface ContactButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: ContactButtonVariant;
  label?: string;
  showLabel?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Seller contact CTA — Chat (red tint), Call (blue tint), WhatsApp (green tint).
 * Used on search result cards and ad detail pages.
 */
export function ContactButton({
  variant = 'chat',
  label,
  showLabel = true,
  fullWidth = false,
  onClick,
  className,
  type = 'button',
  ...props
}: ContactButtonProps) {
  const text = label ?? DEFAULT_LABEL[variant];
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], className)}
      data-full-width={fullWidth}
      data-show-label={showLabel}
      onClick={onClick}
      aria-label={text}
      {...props}
    >
      <svg className={styles.icon} width={20} height={20} viewBox="0 0 20 20" fill={ICON_FILL[variant]} stroke="none">
        <path d={ICON_PATH[variant]} />
      </svg>
      {showLabel && text}
    </button>
  );
}
