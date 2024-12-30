import { OpenAPIV3_1 } from "openapi-types";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

export function getSchemaIdFromReference(ref: OpenAPIV3_1.ReferenceObject): string | undefined {
    if (!ref.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        return undefined;
    }
    return ref.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
}
