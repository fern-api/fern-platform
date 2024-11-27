import { OpenAPIV3_1 } from "openapi-types";
import { resolveReference } from "./resolveReference";

export function resolveResponseReference(
    referenceObject: OpenAPIV3_1.ReferenceObject,
    document: OpenAPIV3_1.Document,
): OpenAPIV3_1.ResponseObject | undefined {
    return resolveReference<OpenAPIV3_1.ResponseObject | undefined>(referenceObject, document, undefined);
}
