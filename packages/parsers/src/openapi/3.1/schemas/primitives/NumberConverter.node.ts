import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FdrNumberType } from "../../../../types/fdr.types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, OPENAPI_NUMBER_TYPE_FORMAT } from "../../../types/format.types";

export declare namespace NumberConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "number";
    }
    export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
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

export class NumberConverterNode extends BaseOpenApiV3_1ConverterNode<
    NumberConverterNode.Input,
    NumberConverterNode.Output
> {
    format: ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT> | undefined;
    minimum: number | undefined;
    maximum: number | undefined;
    default: number | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<NumberConverterNode.Input>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.minimum = this.input.minimum;
        this.maximum = this.input.maximum;
        if (this.input.default != null && typeof this.input.default !== "number") {
            this.context.errors.warning({
                message: `Expected default value to be a number. Received ${this.input.default}`,
                path: this.accessPath,
            });
        }
        this.default = this.input.default;

        if (this.input.format != null) {
            if (!isOpenApiNumberTypeFormat(this.input.format)) {
                this.context.errors.warning({
                    message: `Expected format to be one of ${OPENAPI_NUMBER_TYPE_FORMAT.join(", ")}. Received ${this.input.format}`,
                    path: this.accessPath,
                });
            } else {
                this.format = this.input.format;
            }
        }
    }

    convert(): NumberConverterNode.Output | undefined {
        let type: FdrNumberType["type"] = "double";
        if (this.format != null) {
            switch (this.format) {
                case "decimal":
                case "decimal128":
                case "double-int":
                case "double":
                case "float":
                case "sf-decimal":
                case undefined:
                    type = "double";
                    break;
                default:
                    new UnreachableCaseError(this.format);
                    break;
            }
        }
        return {
            type: "alias",
            value: {
                type: "primitive",
                value: {
                    type,
                    minimum: this.minimum,
                    maximum: this.maximum,
                    default: this.default,
                },
            },
        };
    }
}
