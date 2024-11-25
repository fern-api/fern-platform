import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";

export class EnumConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.NonArraySchemaObject,
    FdrAPI.api.latest.TypeShape.Enum
> {
    default: string | undefined;
    values: string[] = [];

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.NonArraySchemaObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        if (this.input.enum != null) {
            this.values = this.input.enum
                .map((value) => {
                    // TODO: Support { name?: .., description?: .., casing?: .. } here as well
                    if (typeof value !== "string") {
                        this.context.errors.error({
                            message: `Expected enum values to be strings. Received ${value}`,
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
