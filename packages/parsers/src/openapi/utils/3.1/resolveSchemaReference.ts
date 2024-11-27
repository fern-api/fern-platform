import { OpenAPIV3_1 } from "openapi-types";
import { resolveReference } from "./resolveReference";

export function resolveSchemaReference(
    schema: OpenAPIV3_1.ReferenceObject,
    document: OpenAPIV3_1.Document,
): OpenAPIV3_1.SchemaObject {
    return resolveReference<OpenAPIV3_1.SchemaObject>(schema, document, {
        "x-fern-type": "unknown",
        additionalProperties: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as OpenAPIV3_1.SchemaObject);
}
