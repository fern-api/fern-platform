import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/ui-core-utils";

export function isReferenceObject(
  input: unknown
): input is OpenAPIV3_1.ReferenceObject {
  return (
    typeof input === "object" &&
    isNonNullish(input) &&
    "$ref" in input &&
    typeof input.$ref === "string"
  );
}
