export function maybeSingleValueToArray<T>(
  value: T | T[] | undefined
): T[] | undefined {
  if (value == null) {
    return undefined;
  }
  return Array.isArray(value) ? value : [value];
}
