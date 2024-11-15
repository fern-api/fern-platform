import { FdrAPI } from "@fern-api/fdr-sdk";
import { ApiNodeContext, InputApiNode } from "../../../base.node.interface";
import { SchemaObject } from "../../openapi.types";
import { FloatNode } from "./number/float.node";
import { IntegerNode } from "./number/integer.node";

type FdrNumberType =
    | FdrAPI.api.v1.read.PrimitiveType.Integer
    | FdrAPI.api.v1.read.PrimitiveType.Long
    | FdrAPI.api.v1.read.PrimitiveType.Double
    | FdrAPI.api.v1.read.PrimitiveType.Uint
    | FdrAPI.api.v1.read.PrimitiveType.Uint64;

export class NumberNode extends InputApiNode<SchemaObject, FdrNumberType> {
    typeNode: IntegerNode | FloatNode | undefined;
    default: number | undefined;
    minimum: number | undefined;
    maximum: number | undefined;

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[], accessorKey?: string) {
        super(context, input, accessPath);

        if (input.type !== "integer" && input.type !== "number") {
            context.errorCollector.addError(
                `Expected type "integer" or "number" for numerical primitive, but got "${input.type}"`,
                accessPath,
                accessorKey,
            );
            return;
        }

        switch (input.type) {
            case "integer":
                this.typeNode = new IntegerNode(context, input, accessPath, accessorKey);
                break;
            case "number":
                this.typeNode = new FloatNode(context, input, accessPath, accessorKey);
                break;
        }

        this.default = input.default;
        this.minimum = input.minimum;
        this.maximum = input.maximum;
    }

    outputFdrShape = (): FdrNumberType | undefined => {
        const typeProperties = this.typeNode?.outputFdrShape();

        if (typeProperties === undefined) {
            return undefined;
        }

        return {
            ...typeProperties,
            minimum: this.minimum,
            maximum: this.maximum,
            default: this.default,
        };
    };
}
