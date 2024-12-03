import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";

export declare namespace BooleanConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "boolean";
    }
    export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
        type: "alias";
        value: {
            type: "primitive";
            value: FernRegistry.api.v1.read.PrimitiveType.Boolean;
        };
    }
}

export class BooleanConverterNode extends BaseOpenApiV3_1ConverterNode<
    BooleanConverterNode.Input,
    BooleanConverterNode.Output
> {
    default: boolean | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<BooleanConverterNode.Input>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        if (this.input.default != null && typeof this.input.default !== "boolean") {
            this.context.errors.warning({
                message: `Expected default value to be a boolean. Received ${this.input.default}`,
                path: this.accessPath,
            });
        }
        this.default = this.input.default;
    }

    convert(): BooleanConverterNode.Output | undefined {
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
