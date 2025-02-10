import { OpenAPIV3_1 } from "openapi-types";

import { IntegerConverterNode } from "../schemas/primitives/IntegerConverter.node";

export function isIntegerSchema(
  input: OpenAPIV3_1.SchemaObject
): input is IntegerConverterNode.Input {
  return input.type === "integer";
}
