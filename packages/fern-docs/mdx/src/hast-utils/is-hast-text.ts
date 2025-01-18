import { isPlainObject } from "@fern-api/ui-core-utils";
import type { Text } from "hast";

export function isHastText(value: unknown): value is Text {
  return (
    isPlainObject(value) &&
    value.type === "text" &&
    typeof value.value === "string"
  );
}
