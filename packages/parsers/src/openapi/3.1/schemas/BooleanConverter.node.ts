import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeContext, BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";

export declare namespace BooleanConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "boolean";
    }
    export interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: {
            type: "primitive";
            value: FdrAPI.api.v1.read.PrimitiveType.Boolean;
        };
    }
}

export class BooleanConverterNode extends BaseOpenApiV3_1Node<BooleanConverterNode.Input, BooleanConverterNode.Output> {
    default: boolean | undefined;

    constructor(
        input: BooleanConverterNode.Input,
        context: BaseOpenApiV3_1ConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        if (input.default != null && typeof input.default !== "boolean") {
            this.context.errors.warning({
                message: "The default value for a boolean type should be a boolean",
                path: this.accessPath,
            });
        }
        this.default = input.default;
    }

    public convert(): BooleanConverterNode.Output | undefined {
        return {
            type: "alias",
            value: {
                type: "primitive",
                value: {
                    type: "boolean",
                    default: this.default,
                },
            },
        };
    }
}
