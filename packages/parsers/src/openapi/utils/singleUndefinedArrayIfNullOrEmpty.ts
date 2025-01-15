export function singleUndefinedArrayIfNullOrEmpty<T>(
  value: T[] | undefined
): T[] | [undefined] {
  return value != null && value.length > 0 ? value : [undefined];
}
