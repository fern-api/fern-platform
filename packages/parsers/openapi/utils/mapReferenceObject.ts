import { OpenAPIV3_1 } from "openapi-types";

export function mapReferenceObject(referenceObject: OpenAPIV3_1.ReferenceObject): OpenAPIV3_1.SchemaObject {
    return referenceObject.$ref as OpenAPIV3_1.SchemaObject;
}
