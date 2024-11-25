import { OpenAPIV3_1 } from "openapi-types";
import { BooleanConverterNode } from "../schemas/primitives/BooleanConverter.node";

export function isBooleanSchema(input: OpenAPIV3_1.SchemaObject): input is BooleanConverterNode.Input {
    return input.type === "boolean";
}
