import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { FdrNumberType } from "../../../types/fdr.types";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, OPENAPI_NUMBER_TYPE_FORMAT } from "../../types/format.types";

export declare namespace NumberConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "number";
    }
}

function isOpenApiNumberTypeFormat(format: unknown): format is ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT> {
    return OPENAPI_NUMBER_TYPE_FORMAT.includes(format as ConstArrayToType<typeof OPENAPI_NUMBER_TYPE_FORMAT>);
}

export class NumberConverterNode extends BaseOpenApiV3_1Node<NumberConverterNode.Input, FdrNumberType> {
    type: FdrNumberType["type"] = "double";
    minimum: number | undefined;
    maximum: number | undefined;
    default: number | undefined;

    constructor(
        input: NumberConverterNode.Input,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.minimum = input.minimum;
        this.maximum = input.maximum;
        if (typeof input.default !== "number") {
            this.context.errors.warning({
                message: "The default value for an number type should be an number",
                path: this.accessPath,
            });
        }
        this.default = input.default;

        if (input.format != null) {
            if (!isOpenApiNumberTypeFormat(input.format)) {
                this.context.errors.warning({
                    message: "The format for an number type should be int64, int8, int16, int32, uint8, or sf-number",
                    path: this.accessPath,
                });
            } else {
                switch (input.format) {
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
                        new UnreachableCaseError(input.format);
                }
            }
        }
    }

    public convert(): FdrNumberType | undefined {
        return {
            type: this.type,
            minimum: this.minimum,
            maximum: this.maximum,
            default: this.default,
        };
    }
}
