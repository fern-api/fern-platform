import { OpenAPIV3_1 } from "openapi-types";
import { ObjectConverterNode } from "../schemas/ObjectConverter.node";

export function isObjectSchema(input: OpenAPIV3_1.SchemaObject): input is ObjectConverterNode.Input {
    return typeof input.type === "string" && input.type === "object";
}
