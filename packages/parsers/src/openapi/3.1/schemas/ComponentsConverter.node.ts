import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class ComponentsConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ComponentsObject,
    FdrAPI.api.latest.ApiDefinition["types"]
> {
    typeSchemas: Record<string, SchemaConverterNode> | undefined;

    constructor(
        input: OpenAPIV3_1.ComponentsObject,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        if (input.schemas == null) {
            this.context.errors.error({
                message: "No schemas found in components",
                path: accessPath,
            });
        } else {
            this.typeSchemas = Object.fromEntries(
                Object.entries(input.schemas).map(([key, value]) => {
                    return [key, new SchemaConverterNode(value, context, accessPath, pathId)];
                }),
            );
        }
    }

    public convert(): FdrAPI.api.latest.ApiDefinition["types"] | undefined {
        if (this.typeSchemas == null) {
            return undefined;
        }

        return Object.fromEntries(
            Object.entries(this.typeSchemas)
                .map(([key, value]) => {
                    const name = value.name ?? key;
                    const shape = value.convert();

                    if (name == null || shape == null) {
                        return [key, undefined];
                    }

                    return [
                        FdrAPI.TypeId(key),
                        {
                            name,
                            shape,
                            description: value.description,
                            availability: undefined,
                        },
                    ];
                })
                .filter(([_, value]) => isNonNullish(value)),
        );
    }
}
