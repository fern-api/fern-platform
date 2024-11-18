import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../BaseApiConverter.node";
import { isReferenceObject } from "../3.1/guards/isReferenceObject";
import { ReferenceConverterNode } from "../3.1/schemas/ReferenceConverter.node";
import { SchemaConverterNode } from "../3.1/schemas/SchemaConverter.node";

export function chooseReferenceOrSchemaNode(
    input: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
    context: BaseAPIConverterNodeContext,
    accessPath: string[],
    pathId: string,
): SchemaConverterNode | ReferenceConverterNode | undefined {
    if (isReferenceObject(input)) {
        return new ReferenceConverterNode(input, context, accessPath, pathId);
    }
    return new SchemaConverterNode(input, context, accessPath, pathId);
}
