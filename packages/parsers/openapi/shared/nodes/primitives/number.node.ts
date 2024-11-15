import { ApiNodeContext, InputApiNode } from "../../../ApiNode";
import { SchemaObject } from "../../openapi.types";
import { FloatNode } from "./number/float.node";
import { IntegerNode } from "./number/integer.node";

import { FdrFloatType, FdrIntegerType } from "../../../../fdr/fdr.types";
export class NumberNode extends InputApiNode<SchemaObject, FdrFloatType | FdrIntegerType> {
    typeNode: IntegerNode | FloatNode | undefined;
    default: number | undefined;
    minimum: number | undefined;
    maximum: number | undefined;

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[]) {
        super(context, input, accessPath);

        if (input.type !== "integer" && input.type !== "number") {
            context.errorCollector.addError(
                `Expected type "integer" or "number" for numerical primitive, but got "${input.type}"`,
                accessPath,
            );
            return;
        }

        switch (input.type) {
            case "integer":
                this.typeNode = new IntegerNode(context, input, accessPath);
                break;
            case "number":
                this.typeNode = new FloatNode(context, input, accessPath);
                break;
        }

        this.default = input.default;
        this.minimum = input.minimum;
        this.maximum = input.maximum;
    }

    toFdrShape = (): FdrFloatType | FdrIntegerType | undefined => {
        const typeProperties = this.typeNode?.toFdrShape();

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
