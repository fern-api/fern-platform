import { GLOBAL_EXAMPLE_NAME } from "../3.1/paths/ExampleObjectConverter.node";

export function singleUndefinedRecordIfNullOrEmpty<T>(
  value: Record<string, T | undefined> | undefined
): Record<string, T | undefined> | [undefined] {
  return value != null && Object.keys(value).length > 0
    ? value
    : { [GLOBAL_EXAMPLE_NAME]: undefined };
}
