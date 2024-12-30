import { OpenAPIV3_1 } from "openapi-types";
import { resolveReference } from "./resolveReference";

export function resolveParameterReference(
    referenceObject: OpenAPIV3_1.ReferenceObject,
    document: OpenAPIV3_1.Document,
): OpenAPIV3_1.ParameterObject | undefined {
    return resolveReference<OpenAPIV3_1.ParameterObject | undefined>(referenceObject, document, undefined);
}
