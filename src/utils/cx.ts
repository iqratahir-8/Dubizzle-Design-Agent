export type ClassValue = string | number | false | null | undefined;

/** Joins truthy class names together. A minimal local stand-in for `clsx`. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
