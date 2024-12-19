import { OpenAPIV3_1 } from "openapi-types";
import { NumberConverterNode } from "../schemas/primitives/NumberConverter.node";

export function isNumberSchema(
  input: OpenAPIV3_1.SchemaObject
): input is NumberConverterNode.Input {
  return input.type === "number";
}
