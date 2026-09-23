import { cx } from '../../utils/cx';
import styles from './ChatInbox.module.css';

export interface ChatConversation {
  id: string;
  /** Who the conversation is with. A fixture in every story — these are real people on live. */
  name: string;
  /** The ad being discussed: the loudest line in the row. */
  ad: string;
  /** Last message in the thread. */
  preview: string;
  time: string;
}

export interface ChatInboxProps {
  conversations: ChatConversation[];
  activeId?: string;
  filters?: string[];
  activeFilter?: string;
  onSelect?: (id: string) => void;
  onFilter?: (filter: string) => void;
  className?: string;
}

/**
 * The conversation list on the chat screen. Anatomy from the live capture (chat.desktop,
 * 2026-09-23), verified by npm run check:live: a 64px "Inbox" bar on --gray-01, a filter row
 * of 30px pills (selected red on --red-02, resting charcoal inside a red hairline), then rows
 * of exactly 100 — a 40px --red-01 avatar at 24, the text column at 69 with the name at
 * 15.96/23.94/700, the ad at 17.92/700 and the last message at 14/21, the time top-right, and
 * a 1px --neutral-color-light rule between rows.
 */
export function ChatInbox({
  conversations,
  activeId,
  filters = ['All', 'Unread Chats', 'Important'],
  activeFilter = 'All',
  onSelect,
  onFilter,
  className,
}: ChatInboxProps) {
  return (
    <div className={cx(styles.inbox, className)}>
      <div className={styles.head}>Inbox</div>
      <div className={styles.filterRow} role="group" aria-label="Filter conversations">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={cx(styles.filter, filter === activeFilter && styles.filterSelected)}
            aria-pressed={filter === activeFilter}
            onClick={() => onFilter?.(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          className={cx(styles.row, conversation.id === activeId && styles.rowActive)}
          aria-current={conversation.id === activeId ? 'true' : undefined}
          onClick={() => onSelect?.(conversation.id)}
        >
          <span className={styles.avatar} aria-hidden="true">
            {[...conversation.name][0]}
          </span>
          <span className={styles.body}>
            <span className={styles.name}>{conversation.name}</span>
            <span className={styles.ad}>{conversation.ad}</span>
            <span className={styles.preview}>{conversation.preview}</span>
          </span>
          <span className={styles.time}>{conversation.time}</span>
        </button>
      ))}
    </div>
  );
}
