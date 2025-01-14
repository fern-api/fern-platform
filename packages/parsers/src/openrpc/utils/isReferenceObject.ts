import { isNonNullish } from "@fern-api/ui-core-utils";
import { ReferenceObject } from "@open-rpc/meta-schema";

export function isReferenceObject(input: unknown): input is ReferenceObject {
  return (
    typeof input === "object" &&
    isNonNullish(input) &&
    "$ref" in input &&
    typeof input.$ref === "string"
  );
}
