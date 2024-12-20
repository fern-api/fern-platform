import { OpenAPIV3_1 } from "openapi-types";
import { ArrayConverterNode } from "../schemas/ArrayConverter.node";

export function isArraySchema(input: OpenAPIV3_1.SchemaObject): input is ArrayConverterNode.Input {
    return typeof input.type === "string" && input.type === "array";
}
