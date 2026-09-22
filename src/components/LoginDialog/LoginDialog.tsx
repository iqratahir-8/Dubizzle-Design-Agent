import { Dialog } from '../Dialog';
import styles from './LoginDialog.module.css';

export type LoginProvider = 'phone' | 'email' | 'google' | 'facebook';

export interface LoginDialogProps {
  open: boolean;
  onClose?: () => void;
  onProvider?: (p: LoginProvider) => void;
  onCreateAccount?: () => void;
  inline?: boolean;
  /** Where the logo and provider icons live (src/assets). */
  assetsPath?: string;
  className?: string;
}

const PROVIDERS: [LoginProvider, string][] = [['phone', 'Login with Phone'], ['email', 'Login with Email'], ['google', 'Login with Google'], ['facebook', 'Login with Facebook']];

/**
 * The login dialog. Repo: dubizzle-facelift/user (loginButton → login dialog). Live (captured
 * login-dialog, 2026-09-22): 44rem panel; logo; title 24/700/36; four 40px provider buttons,
 * 1px red-04, radius 6, label 15.96/700 with a 24px icon, 8px apart, "OR" after the second;
 * "New to Dubizzle? Create an account" 16/700 red. Provider icons are the live ones.
 */
export function LoginDialog({ open, onClose, onProvider, onCreateAccount, inline, assetsPath = '/assets', className }: LoginDialogProps) {
  const button = ([p, label]: [LoginProvider, string]) => (
    <button key={p} type="button" className={styles.provider} onClick={() => onProvider?.(p)}>
      <img className={styles.icon} src={`${assetsPath}/login/${p}.svg`} alt="" width={24} height={24} />
      <span>{label}</span>
    </button>
  );
  return (
    <Dialog open={open} onClose={onClose} inline={inline} className={className}>
      <div className={styles.head}>
        <img className={styles.logo} src={`${assetsPath}/logo-en-full.svg`} alt="dubizzle" />
        <span className={styles.title}>Login into your Dubizzle account</span>
      </div>
      <div className={styles.providers}>
        {PROVIDERS.slice(0, 2).map(button)}
        <span className={styles.or}>OR</span>
        {PROVIDERS.slice(2).map(button)}
      </div>
      <button type="button" className={styles.create} onClick={onCreateAccount}>New to Dubizzle? Create an account</button>
    </Dialog>
  );
}
