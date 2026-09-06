export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

/**
 * Minimal class name joiner.
 *
 * Deliberately not `clsx` + `tailwind-merge`: the component API below uses
 * explicit variant maps rather than merging conflicting utility strings, so
 * the extra dependencies would not earn their place.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}
