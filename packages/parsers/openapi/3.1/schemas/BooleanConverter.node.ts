import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";

export declare namespace BooleanConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "boolean";
    }
}

export class BooleanConverterNode extends BaseOpenApiV3_1Node<
    BooleanConverterNode.Input,
    FdrAPI.api.v1.read.PrimitiveType.Boolean
> {
    default: boolean | undefined;

    constructor(
        input: BooleanConverterNode.Input,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        if (typeof input.default !== "boolean") {
            this.context.errors.warning({
                message: "The default value for a boolean type should be a boolean",
                path: this.accessPath,
            });
        }
        this.default = input.default;
    }

    public convert(): FdrAPI.api.v1.read.PrimitiveType.Boolean | undefined {
        return {
            type: "boolean",
            default: this.default,
        };
    }
}
