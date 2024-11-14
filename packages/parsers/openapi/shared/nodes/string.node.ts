import { ApiNode, ApiNodeContext } from "../interfaces/api.node.interface";
import { PrimitiveNode } from "../interfaces/primitive.node.interface";

type FdrStringShape = {
    value: string;
    format?: "uuid" | "email";
    pattern?: RegExp;
};

type RedocStringNode = {
    stringValue: string;
    format?: "uuid" | "email";
    pattern?: RegExp;
};

export class StringNode implements PrimitiveNode<RedocStringNode, FdrStringShape> {
    name = "String";
    qualifiedId: string;

    private readonly stringValue: string;
    private readonly format?: "uuid" | "email";
    private readonly pattern?: RegExp;

    constructor(
        readonly context: ApiNodeContext,
        readonly preProcessedInput: RedocStringNode,
        readonly accessPath: ApiNode<unknown, unknown>[],
    ) {
        this.qualifiedId = accessPath.map((node) => node.qualifiedId).join(".");

        this.stringValue = preProcessedInput.stringValue;
        this.format = preProcessedInput.format;
        this.pattern = preProcessedInput.pattern;
    }

    outputFdrShape(): FdrStringShape {
        return {
            value: this.stringValue,
            ...(this.format ? {} : { format: this.format }),
            ...(this.pattern ? {} : { pattern: this.pattern }),
        };
    }
}
