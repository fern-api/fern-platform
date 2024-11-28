import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";

export declare namespace NullConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "null";
    }

    export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
        type: "alias";
        value: FernRegistry.api.latest.TypeReference.Unknown;
    }
}

export class NullConverterNode extends BaseOpenApiV3_1ConverterNode<NullConverterNode.Input, NullConverterNode.Output> {
    displayName: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<NullConverterNode.Input>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.displayName = this.input.title;
    }

    convert(): NullConverterNode.Output | undefined {
        return {
            type: "alias",
            value: {
                type: "unknown",
                displayName: this.displayName,
            },
        };
    }
}
