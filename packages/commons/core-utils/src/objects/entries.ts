export type Entries<T> = [keyof T, T[keyof T]][];

export function entries<T extends Record<string, unknown>>(
  object: T
): Entries<T> {
  return Object.entries(object) as Entries<T>;
}
