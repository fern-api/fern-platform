import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { ApiNodeContext, InputApiNode } from "../../../ApiNode";

export class EnumNode extends InputApiNode<OpenAPIV3_1.SchemaObject, FdrAPI.api.v1.read.PrimitiveType.Enum> {
    default: number | undefined;
    format: string | undefined;
    minimum: number | undefined;
    maximum: number | undefined;

    constructor(
        context: ApiNodeContext,
        input: OpenAPIV3_1.NonArraySchemaObject,
        accessPath: string[],
        accessorKey?: string,
    ) {
        super(context, input, accessPath, accessorKey);
        if (input.type !== "integer") {
            context.errorCollector.addError(
                `Expected type "integer" for primitive, but got "${input.type}"`,
                accessPath,
            );
        }
        this.format = input.format;
        this.default = input.default;
        this.minimum = input.minimum;
        this.maximum = input.maximum;
    }

    toFdrShape = (): FdrAPI.api.v1.read.PrimitiveType.Integer => {
        return {
            type: "integer",
            minimum: this.minimum,
            maximum: this.maximum,
            default: this.default,
        };
    };
}
