import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeContext, BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ArrayConverterNode {
    interface Input extends OpenAPIV3_1.ArraySchemaObject {
        type: "array";
    }
    interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: FdrAPI.api.latest.TypeReference.List;
    }
}

export class ArrayConverterNode extends BaseOpenApiV3_1Node<
    ArrayConverterNode.Input,
    ArrayConverterNode.Output | undefined
> {
    innerSchema: SchemaConverterNode;

    constructor(
        input: ArrayConverterNode.Input,
        context: BaseOpenApiV3_1ConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.innerSchema = new SchemaConverterNode(input.items, context, accessPath, "items");

        if (input.items == null) {
            this.context.errors.error({
                message: "No items found in array",
                path: accessPath,
            });
        }
    }

    public convert(): ArrayConverterNode.Output | undefined {
        const innerSchema = this.innerSchema.convert();

        if (innerSchema == null) {
            return undefined;
        }

        return {
            type: "alias",
            value: {
                type: "list",
                itemShape: innerSchema,
            },
        };
    }
}
