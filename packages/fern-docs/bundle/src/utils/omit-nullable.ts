import { omitBy } from "es-toolkit/object";

export function omitNullable<T>(
  record: Record<string, T>
): Record<string, NonNullable<T>> {
  return omitBy(record, (value) => value == null) as Record<
    string,
    NonNullable<T>
  >;
}
