import { OpenAPIV3_1 } from "openapi-types";
import { NullConverterNode } from "../schemas/primitives/NullConverter.node";

export function isNullSchema(input: OpenAPIV3_1.SchemaObject): input is NullConverterNode.Input {
    return input.type === "null";
}
