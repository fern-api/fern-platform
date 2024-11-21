import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FdrIntegerType } from "../../../types/fdr.types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, OPENAPI_INTEGER_TYPE_FORMAT } from "../../types/format.types";

export declare namespace IntegerConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "integer";
    }
    export interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: {
            type: "primitive";
            value: FdrIntegerType;
        };
    }
}

function isOpenApiIntegerTypeFormat(format: unknown): format is ConstArrayToType<typeof OPENAPI_INTEGER_TYPE_FORMAT> {
    return OPENAPI_INTEGER_TYPE_FORMAT.includes(format as ConstArrayToType<typeof OPENAPI_INTEGER_TYPE_FORMAT>);
}

export class IntegerConverterNode extends BaseOpenApiV3_1Node<IntegerConverterNode.Input, IntegerConverterNode.Output> {
    type: FdrIntegerType["type"] = "integer";
    minimum: number | undefined;
    maximum: number | undefined;
    default: number | undefined;

    constructor(...args: BaseOpenApiV3_1NodeConstructorArgs<IntegerConverterNode.Input>) {
        super(...args);
        this.safeParse();
    }

    parse(): void {
        this.minimum = this.input.minimum;
        this.maximum = this.input.maximum;
        if (this.input.default != null && typeof this.input.default !== "number") {
            this.context.errors.warning({
                message: "The default value for an integer type should be an integer",
                path: this.accessPath,
            });
        }
        this.default = this.input.default;

        if (this.input.format != null) {
            if (!isOpenApiIntegerTypeFormat(this.input.format)) {
                this.context.errors.warning({
                    message: "The format for an integer type should be int64, int8, int16, int32, uint8, or sf-integer",
                    path: this.accessPath,
                });
            } else {
                switch (this.input.format) {
                    case "int64":
                        this.type = "long";
                        break;
                    case "int8":
                    case "int16":
                    case "int32":
                    case "uint8":
                    case "sf-integer":
                    case undefined:
                        this.type = "integer";
                        break;
                    default:
                        new UnreachableCaseError(this.input.format);
                }
            }
        }
    }

    convert(): IntegerConverterNode.Output | undefined {
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
