import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeContext, BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";

export declare namespace EnumConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "object";
    }
}

export class EnumConverterNode extends BaseOpenApiV3_1Node<EnumConverterNode.Input, FdrAPI.api.latest.TypeShape.Enum> {
    default: string | undefined;
    values: string[] = [];

    constructor(
        input: EnumConverterNode.Input,
        context: BaseOpenApiV3_1ConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        if (input.enum != null) {
            this.values = input.enum
                .map((value) => {
                    // TODO: Support { name?: .., description?: .., casing?: .. } here as well
                    if (typeof value !== "string") {
                        this.context.errors.error({
                            message: "The values in an enum type should be strings",
                            path: this.accessPath,
                        });
                        return undefined;
                    }
                    return value;
                })
                .filter(isNonNullish);
            this.values = Array.from(new Set(this.values));
        }

        this.default = input.default;
    }

    public convert(): FdrAPI.api.latest.TypeShape.Enum | undefined {
        return {
            type: "enum",
            values: this.values.map((value) => ({
                value,
                description: undefined,
                availability: undefined,
            })),
            default: this.default,
        };
    }
}
