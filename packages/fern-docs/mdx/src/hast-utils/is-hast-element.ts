import { isPlainObject } from "@fern-api/ui-core-utils";
import type { Element } from "hast";

export function isHastElement(value: unknown): value is Element {
  return (
    isPlainObject(value) &&
    value.type === "element" &&
    typeof value.tagName === "string" &&
    isPlainObject(value.properties) &&
    Array.isArray(value.children)
  );
}
