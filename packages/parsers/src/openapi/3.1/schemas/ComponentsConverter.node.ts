import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class ComponentsConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ComponentsObject,
    FdrAPI.api.latest.ApiDefinition["types"]
> {
    typeSchemas: Record<string, SchemaConverterNode>;

    constructor(
        input: OpenAPIV3_1.ComponentsObject,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.typeSchemas = Object.fromEntries(
            Object.entries(input.schemas).map(([key, value]) => {
                return [key, new SchemaConverterNode(value, context, accessPath, pathId)];
            }),
        );
    }

    public convert(): FdrAPI.api.latest.ApiDefinition["types"] | undefined {
        return Object.fromEntries(
            Object.entries(this.typeSchemas).map(([key, value]) => {
                return [
                    FdrAPI.TypeId(key),
                    {
                        name: value.name,
                        shape: value.convert(),
                        description: value.description,
                        availability: undefined,
                    },
                ];
            }),
        );
    }
}
