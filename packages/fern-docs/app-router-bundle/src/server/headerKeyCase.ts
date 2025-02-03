import { mapKeys } from "es-toolkit/object";
import { pascalCase } from "es-toolkit/string";

export function pascalCaseHeaderKey(key: string): string {
  return key.split("-").map(pascalCase).join("-");
}

export function pascalCaseHeaderKeys(
  headers: Record<string, unknown> = {}
): Record<string, unknown> {
  return mapKeys(headers, (_, key) => pascalCaseHeaderKey(key));
}
