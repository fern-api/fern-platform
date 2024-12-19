import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveSchemaReference(
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject | undefined,
  document: OpenAPIV3_1.Document
): OpenAPIV3_1.SchemaObject | undefined {
  if (isReferenceObject(schema)) {
    return resolveReference<OpenAPIV3_1.SchemaObject>(schema, document, {
      type: "unknown",
      "x-fern-type": "unknown",
      additionalProperties: false,
    } as unknown as OpenAPIV3_1.SchemaObject);
  }
  return schema;
}
