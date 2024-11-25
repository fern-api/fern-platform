import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";

export declare namespace NullConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "null";
    }

    export interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: FdrAPI.api.latest.TypeReference.Unknown;
    }
}

export class NullConverterNode extends BaseOpenApiV3_1Node<NullConverterNode.Input, NullConverterNode.Output> {
    displayName: string | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<NullConverterNode.Input>) {
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
