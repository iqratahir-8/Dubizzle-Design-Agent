import { cx } from '../../utils/cx';
import styles from './ChatThread.module.css';

export interface ChatMessage {
  id: string;
  /** The message text. Omit when the message is an image. */
  text?: string;
  imageUrl?: string;
  time: string;
  /** True for the account holder's own messages — they sit right, on --blue-02. */
  own?: boolean;
  /** A date pill ("TODAY") is shown above this message. */
  day?: string;
}

export interface ChatThreadHeaderProps {
  name: string;
  lastActive: string;
  onReport?: () => void;
  onCall?: () => void;
  onSms?: () => void;
  onMore?: () => void;
  onClose?: () => void;
  assetsPath?: string;
  className?: string;
}

/**
 * Header of an open conversation: who it is with, when they were last seen, and the actions.
 * Anatomy from the live capture (chat-thread.desktop, 2026-09-23): 64 tall, a 40px --red-01
 * avatar, the name at 15.96/23.94/700 over "Last active …" at 14/21, and five 56×47 action
 * buttons in live's order: report, call, SMS, more, close.
 */
export function ChatThreadHeader({ name, lastActive, onReport, onCall, onSms, onMore, onClose, assetsPath = '/assets', className }: ChatThreadHeaderProps) {
  return (
    <header className={cx(styles.header, className)}>
      <span className={styles.avatar} aria-hidden="true">{[...name][0]}</span>
      <div className={styles.who}>
        <p className={styles.name}>{name}</p>
        <p className={styles.lastActive}>{lastActive}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.action} aria-label="Report this conversation" onClick={onReport}>
          <img src={`${assetsPath}/live-icons/chat-report.svg`} alt="" width={22} height={22} />
        </button>
        <button type="button" className={styles.action} aria-label="Call" onClick={onCall}>
          <img src={`${assetsPath}/live-icons/chat-call.svg`} alt="" width={22} height={22} />
        </button>
        <button type="button" className={styles.action} aria-label="Send an SMS" onClick={onSms}>
          <img src={`${assetsPath}/live-icons/chat-sms.svg`} alt="" width={22} height={22} />
        </button>
        <button type="button" className={styles.action} aria-label="More" onClick={onMore}>
          <img src={`${assetsPath}/live-icons/chat-more.svg`} alt="" width={22} height={22} />
        </button>
        <button type="button" className={styles.action} aria-label="Close this conversation" onClick={onClose}>
          <img src={`${assetsPath}/live-icons/chat-close.svg`} alt="" width={22} height={22} />
        </button>
      </div>
    </header>
  );
}

export interface ChatAdStripProps {
  title: string;
  price: string;
  imageUrl?: string;
  onViewAd?: () => void;
  className?: string;
}

/** The ad the conversation is about: 73 tall on white, a 40px thumb, and the outlined View Ad. */
export function ChatAdStrip({ title, price, imageUrl, onViewAd, className }: ChatAdStripProps) {
  return (
    <div className={cx(styles.adStrip, className)}>
      {imageUrl ? <img className={styles.adThumb} src={imageUrl} alt="" width={40} height={40} /> : <span className={styles.adThumb} />}
      <div className={styles.adText}>
        <p className={styles.adTitle}>{title}</p>
        <p className={styles.adPrice}>{price}</p>
      </div>
      <button type="button" className={styles.viewAd} onClick={onViewAd}>
        View Ad
      </button>
    </div>
  );
}

export interface ChatThreadProps {
  messages: ChatMessage[];
  className?: string;
}

/**
 * The messages themselves. Anatomy from the live capture: bubbles at 8/16 with the text at
 * 15.96/23.94 in --black and the time at 14/21 in --gray-05, incoming on --gray-01 and the
 * account holder's own on --blue-02 at the right. The corner facing the speaker is square on
 * every message after the first in a run, which is what makes a run read as one block. An
 * image is sent as a 4px frame around the picture. Day pills sit centred, 28 tall, in --gray-04.
 */
export function ChatThread({ messages, className }: ChatThreadProps) {
  return (
    <div className={cx(styles.thread, className)}>
      {messages.map((message, i) => {
        const previous = messages[i - 1];
        const first = !previous || previous.own !== message.own || Boolean(message.day);
        return (
          <div key={message.id}>
            {message.day && <p className={styles.day}>{message.day}</p>}
            <div className={cx(styles.row, message.own && styles.rowOwn)}>
              <div
                className={cx(
                  styles.bubble,
                  message.own && styles.bubbleOwn,
                  first && styles.bubbleFirst,
                  message.imageUrl && styles.imageBubble,
                )}
              >
                {message.imageUrl ? <img src={message.imageUrl} alt="" width={200} height={200} /> : <span className={styles.text}>{message.text}</span>}
                <span className={styles.time}>{message.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface ChatComposerProps {
  placeholder?: string;
  tabs?: string[];
  activeTab?: string;
  onTab?: (tab: string) => void;
  onSend?: () => void;
  assetsPath?: string;
  className?: string;
}

/**
 * The composer, with live's two tabs above it on an 18px shoulder: 57 tall, a 1px
 * --neutral-color-light rule on top, the field at 15.96 and a 40px charcoal send button.
 */
export function ChatComposer({
  placeholder = 'Type a message',
  tabs = ['Questions', 'Next steps'],
  activeTab = 'Questions',
  onTab,
  onSend,
  assetsPath = '/assets',
  className,
}: ChatComposerProps) {
  return (
    <div className={className}>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tab === activeTab}
            className={cx(styles.tab, tab === activeTab && styles.tabActive)}
            onClick={() => onTab?.(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.composer}>
        <button type="button" className={styles.attach} aria-label="Attach a file">
          <img src={`${assetsPath}/live-icons/chat-attach.svg`} alt="" width={22} height={22} />
        </button>
        <input className={styles.input} type="text" placeholder={placeholder} aria-label="Message" />
        <button type="button" className={styles.send} aria-label="Send" onClick={onSend}>
          <img src={`${assetsPath}/live-icons/chat-send.svg`} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}
