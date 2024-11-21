import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FdrNumberType } from "../../../types/fdr.types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, OPENAPI_NUMBER_TYPE_FORMAT } from "../../types/format.types";

export declare namespace NumberConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "number";
    }
    export interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: {
            type: "primitive";
            value: FdrNumberType;
        };
    }
}

function isOpenApiNumberTypeFormat(format: unknown): format is ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT> {
    return OPENAPI_NUMBER_TYPE_FORMAT.includes(format as ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT>);
}

export class NumberConverterNode extends BaseOpenApiV3_1Node<NumberConverterNode.Input, NumberConverterNode.Output> {
    type: FdrNumberType["type"] = "double";
    minimum: number | undefined;
    maximum: number | undefined;
    default: number | undefined;

    constructor(...args: BaseOpenApiV3_1NodeConstructorArgs<NumberConverterNode.Input>) {
        super(...args);
        this.safeParse();
    }

    parse(): void {
        this.minimum = this.input.minimum;
        this.maximum = this.input.maximum;
        if (this.input.default != null && typeof this.input.default !== "number") {
            this.context.errors.warning({
                message: "The default value for an number type should be an number",
                path: this.accessPath,
            });
        }
        this.default = this.input.default;

        if (this.input.format != null) {
            if (!isOpenApiNumberTypeFormat(this.input.format)) {
                this.context.errors.warning({
                    message: "The format for an number type should be int64, int8, int16, int32, uint8, or sf-number",
                    path: this.accessPath,
                });
            } else {
                switch (this.input.format) {
                    case "decimal":
                    case "decimal128":
                    case "double-int":
                    case "double":
                    case "float":
                    case "sf-decimal":
                    case undefined:
                        this.type = "double";
                        break;
                    default:
                        new UnreachableCaseError(this.input.format);
                }
            }
        }
    }

    convert(): NumberConverterNode.Output | undefined {
        return {
            type: "alias",
            value: {
                type: "primitive",
                value: {
                    type: this.type,
                    minimum: this.minimum,
                    maximum: this.maximum,
                    default: this.default,
                },
            },
        };
    }
}
