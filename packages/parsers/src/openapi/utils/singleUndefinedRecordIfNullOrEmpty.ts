export function singleUndefinedRecordIfNullOrEmpty<T>(
  value: Record<string, T | undefined> | undefined
): Record<string, T | undefined> | [undefined] {
  return value != null && Object.keys(value).length > 0
    ? value
    : { "": undefined };
}
