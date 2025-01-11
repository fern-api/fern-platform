import { OpenAPIV3_1 } from "openapi-types";

export function isNullableSchema(
  input: OpenAPIV3_1.NonArraySchemaObject
): input is OpenAPIV3_1.NonArraySchemaObject & { nullable: boolean } {
  return "nullable" in input && typeof input.nullable === "boolean";
}
