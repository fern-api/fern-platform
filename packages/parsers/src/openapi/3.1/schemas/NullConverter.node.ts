import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";

export declare namespace NullConverterNode {
    export interface Output extends FdrAPI.api.latest.TypeShape.Alias {
        type: "alias";
        value: FdrAPI.api.latest.TypeReference.Unknown;
    }
}

export class NullConverterNode extends BaseOpenApiV3_1Node<OpenAPIV3_1.NonArraySchemaObject, NullConverterNode.Output> {
    convert(): NullConverterNode.Output | undefined {
        return {
            type: "alias",
            value: {
                type: "unknown",
                displayName: undefined,
            },
        };
    }
}
