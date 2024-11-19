import { OpenAPIV3_1 } from "openapi-types";

export function mapReferenceObject(referenceObject: OpenAPIV3_1.ReferenceObject): OpenAPIV3_1.SchemaObject {
    // TODO: migrate the reference lookup logic from the old parser
    return referenceObject.$ref as OpenAPIV3_1.SchemaObject;
}
