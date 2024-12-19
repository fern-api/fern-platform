import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";

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
