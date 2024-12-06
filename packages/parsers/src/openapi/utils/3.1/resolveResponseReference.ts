import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveResponseReference(
    referenceObject: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ResponseObject,
    document: OpenAPIV3_1.Document,
): OpenAPIV3_1.ResponseObject | undefined {
    if (isReferenceObject(referenceObject)) {
        return resolveReference<OpenAPIV3_1.ResponseObject | undefined>(referenceObject, document, undefined);
    }

    return referenceObject;
}
