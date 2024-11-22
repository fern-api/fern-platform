import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class ComponentsConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ComponentsObject,
    FdrAPI.api.latest.ApiDefinition["types"]
> {
    typeSchemas: Record<string, SchemaConverterNode> | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.ComponentsObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        if (this.input.schemas == null) {
            this.context.errors.error({
                message: "No schemas found in components",
                path: this.accessPath,
            });
        } else {
            this.typeSchemas = Object.fromEntries(
                Object.entries(this.input.schemas).map(([key, value]) => {
                    return [
                        key,
                        new SchemaConverterNode({
                            input: value,
                            context: this.context,
                            accessPath: this.accessPath,
                            pathId: this.pathId,
                        }),
                    ];
                }),
            );
        }
    }

    convert(): FdrAPI.api.latest.ApiDefinition["types"] | undefined {
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
