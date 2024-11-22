import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
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
    innerSchema: SchemaConverterNode | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<ArrayConverterNode.Input>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.innerSchema = new SchemaConverterNode({
            input: this.input.items,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "items",
        });

        if (this.input.items == null) {
            this.context.errors.error({
                message: "No items found in array",
                path: this.accessPath,
            });
        }
    }

    convert(): ArrayConverterNode.Output | undefined {
        const innerSchema = this.innerSchema?.convert();

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
