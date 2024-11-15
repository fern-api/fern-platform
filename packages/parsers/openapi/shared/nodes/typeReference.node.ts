import { FdrAPI } from "@fern-api/fdr-sdk";
import { ApiNodeContext, OutputApiNode } from "../../base.node.interface";
import { ReferenceObject, SchemaObject } from "../openapi.types";
import { NumberNode } from "./primitives/number.node";
import { StringNode } from "./primitives/string.node";

export const isReferenceObject = (input: unknown): input is ReferenceObject => {
    return typeof input === "object" && input != null && "$ref" in input && typeof input.$ref === "string";
};
export const mapReferenceObject = (referenceObject: ReferenceObject): SchemaObject => {
    return referenceObject.$ref as SchemaObject;
};

// might want to split this out into AliasNode, PrimitiveNode, etc.
export class TypeReferenceNode extends OutputApiNode<SchemaObject | ReferenceObject, FdrAPI.api.latest.TypeReference> {
    type: FdrAPI.api.latest.TypeReference["type"] | undefined;
    typeNode: StringNode | NumberNode | undefined;
    ref: string | undefined;
    default: FdrAPI.api.latest.TypeReferenceIdDefault | undefined;

    constructor(context: ApiNodeContext, input: SchemaObject | ReferenceObject, accessPath: string[]) {
        super(context, input, accessPath);

        if (isReferenceObject(input)) {
            this.type = "id";
            this.ref = input.$ref;
            this.default = undefined;
        } else {
            this.type = "primitive";
            if (input.type === "integer" || input.type === "number") {
                this.typeNode = new NumberNode(context, input, accessPath);
            } else if (input.type === "string") {
                this.typeNode = new StringNode(context, input, accessPath);
            }
        }
        // just support primitives and ids for now
    }

    outputFdrShape = (): FdrAPI.api.latest.TypeReference | undefined => {
        if (this.type === "id") {
            if (this.ref === undefined) {
                return undefined;
            }
            return {
                type: this.type,
                id: FdrAPI.TypeId(this.ref),
                default: this.default,
            };
        }
        if (this.type === "primitive") {
            const primitiveShape = this.typeNode?.outputFdrShape();
            if (primitiveShape === undefined) {
                return undefined;
            }
            return {
                type: this.type,
                value: primitiveShape,
            };
        }
        return undefined;
    };
}
