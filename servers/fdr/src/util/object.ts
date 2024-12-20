import { isPlainObject } from "es-toolkit/predicate";

export const isPlainObject2 = isPlainObject as (
  val: unknown
) => val is Record<string, unknown>;

/**
 * Deep clones the specified object omitting keys with `undefined` value.
 */
export function compact<T extends Record<string, unknown>>(source: T) {
  const obj: Record<string, unknown> = {};
  Object.keys(source).forEach((key) => {
    const val = source[key];
    if (val !== undefined) {
      obj[key] = compactVal(val);
    }
  });
  return obj as T;
}

function compactVal(val: unknown): unknown {
  if (Array.isArray(val)) {
    return val.filter((v) => v !== undefined).map((v) => compactVal(v));
  }
  if (isPlainObject2(val)) {
    return compact(val);
  }
  return val;
}

export function createObjectFromMap<K extends string, V>(
  map: Map<K, V>
): Record<K, V> {
  const obj = {} as Record<K, V>;
  map.forEach((val, key) => {
    obj[key] = val;
  });
  return obj;
}
