import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";

export function resolveReference<Output>(
    referenceObject: OpenAPIV3_1.ReferenceObject,
    document: OpenAPIV3_1.Document,
    defaultOutput: Output
): Output {
    const keys = referenceObject.$ref
        .substring(2)
        .split("/")
        .map((key) => key.replace(/~1/g, "/"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvedSchema: any = document;
    for (const key of keys) {
        if (typeof resolvedSchema !== "object" || resolvedSchema == null) {
            return defaultOutput;
        }
        resolvedSchema = resolvedSchema[key];
    }
    if (resolvedSchema == null) {
        return defaultOutput;
    }

    // Step 3: If the result is another reference object, make a recursive call
    if (isReferenceObject(resolvedSchema)) {
        resolvedSchema = resolveReference(
            resolvedSchema,
            document,
            defaultOutput
        );
    }

    // Step 4: If the result is a schema object, return it
    return resolvedSchema;
}
