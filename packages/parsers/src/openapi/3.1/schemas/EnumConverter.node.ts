import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";

export declare namespace EnumConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "object";
    }
}

export class EnumConverterNode extends BaseOpenApiV3_1Node<EnumConverterNode.Input, FdrAPI.api.latest.TypeShape.Enum> {
    default: string | undefined;
    values: string[] = [];

    constructor(...args: BaseOpenApiV3_1NodeConstructorArgs<EnumConverterNode.Input>) {
        super(...args);
        this.safeParse();
    }

    parse(): void {
        if (this.input.enum != null) {
            this.values = this.input.enum
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

        this.default = this.input.default;
    }

    convert(): FdrAPI.api.latest.TypeShape.Enum | undefined {
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
