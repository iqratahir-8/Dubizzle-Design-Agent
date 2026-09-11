import { cx } from '../../utils/cx';
import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

function buildPageList(currentPage: number, totalPages: number): (number | '…')[] {
  const maxVisible = 2;
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - maxVisible && i <= currentPage + maxVisible)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return pages;
}

/** Page navigation with numbered buttons, ellipsis, and prev/next arrows. 32×32px buttons. */
export function Pagination({ currentPage = 1, totalPages = 10, onPageChange, className }: PaginationProps) {
  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className={cx(styles.pagination, className)}>
      <button
        type="button"
        className={styles.button}
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        aria-label="Previous page"
      >
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M10 4l-4 4 4 4" />
        </svg>
      </button>

      {pages.map((page, i) =>
        page === '…' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={cx(styles.button, page === currentPage && styles.active)}
            onClick={() => page !== currentPage && onPageChange?.(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.button}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        aria-label="Next page"
      >
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
}
