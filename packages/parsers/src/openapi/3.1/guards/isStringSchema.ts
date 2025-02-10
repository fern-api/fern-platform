import { OpenAPIV3_1 } from "openapi-types";

import { StringConverterNode } from "../schemas/primitives/StringConverter.node";

export function isStringSchema(
  input: OpenAPIV3_1.SchemaObject
): input is StringConverterNode.Input {
  return input.type === "string";
}
