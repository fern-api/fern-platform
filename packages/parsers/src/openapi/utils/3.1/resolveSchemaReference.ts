import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";

export function resolveSchemaReference(
    schema: OpenAPIV3_1.ReferenceObject,
    document: OpenAPIV3_1.Document,
): OpenAPIV3_1.SchemaObject {
    const keys = schema.$ref
        .substring(2)
        .split("/")
        .map((key) => key.replace(/~1/g, "/"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvedSchema: any = document;
    for (const key of keys) {
        if (typeof resolvedSchema !== "object" || resolvedSchema == null) {
            return {
                "x-fern-type": "unknown",
                additionalProperties: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any as OpenAPIV3_1.SchemaObject;
        }
        resolvedSchema = resolvedSchema[key];
    }
    if (resolvedSchema == null) {
        return {
            "x-fern-type": "unknown",
            additionalProperties: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any as OpenAPIV3_1.SchemaObject;
    }

    // Step 3: If the result is another reference object, make a recursive call
    if (isReferenceObject(resolvedSchema)) {
        resolvedSchema = resolveSchemaReference(resolvedSchema, document);
    }

    // Step 4: If the result is a schema object, return it
    return resolvedSchema;
}
