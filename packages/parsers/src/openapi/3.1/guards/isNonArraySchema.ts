import { OpenAPIV3_1 } from "openapi-types";
import { isArraySchema } from "./isArraySchema";

export function isNonArraySchema(input: OpenAPIV3_1.SchemaObject): input is OpenAPIV3_1.NonArraySchemaObject {
    return !Array.isArray(input.type) && !isArraySchema(input);
}
