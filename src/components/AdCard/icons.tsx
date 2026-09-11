export function PlaceholderIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--gray-03)" strokeWidth={1.5}>
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <circle cx={8.5} cy={8.5} r={1.5} />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function HeartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--gray-05)" strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function PhotoStackIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" stroke="none">
      <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm8 3a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

export function LocationPinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size * (18 / 13)} viewBox="0 0 13 18" fill="var(--gray-04)" stroke="none">
      <path d="M6.6 0C2.955 0 0 2.955 0 6.6C0 10.8 4.446 16.38 5.4 17.33C5.925 17.86 6.215 18 6.6 18C6.985 18 7.275 17.86 7.8 17.33C8.754 16.38 13.2 10.8 13.2 6.6C13.2 2.955 10.245 0 6.6 0ZM6.6 9.6C4.943 9.6 3.6 8.257 3.6 6.6C3.6 4.943 4.943 3.6 6.6 3.6C8.257 3.6 9.6 4.943 9.6 6.6C9.6 8.257 8.257 9.6 6.6 9.6Z" />
    </svg>
  );
}
