export function undefinedIfEmpty<T>(
  value: T[] | Record<string, T>
): T[] | Record<string, T> | undefined {
  return (Array.isArray(value) && value.length > 0) ||
    Object.keys(value).length > 0
    ? value
    : undefined;
}
