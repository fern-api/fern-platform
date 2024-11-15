import { FdrAPI } from "@fern-api/fdr-sdk";
import { ApiNodeContext, OutputApiNode } from "../../ApiNode";
import { SchemaObject } from "../openapi.types";
import { ObjectNode } from "./object.node";
import { TypeReferenceNode } from "./typeReference.node";

export class TypeShapeNode extends OutputApiNode<SchemaObject, FdrAPI.api.latest.TypeShape> {
    // For now, we will just support Object nodes, in the future, this will need to be updated to an exhaustive switch
    type: FdrAPI.api.latest.TypeShape["type"] | undefined;
    typeNode: ObjectNode | TypeReferenceNode | undefined;

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[], accessorKey?: string) {
        super(context, input, accessPath);

        // For now, we will just support Object and alias nodes, in the future, this will need to be updated to an exhaustive switch

        if (input.type === "object") {
            this.type = "object";
            this.typeNode = new ObjectNode(context, input, accessPath, accessorKey);
        } else {
            this.type = "alias";
            this.typeNode = new TypeReferenceNode(context, input, accessPath);
        }
    }

    toFdrShape = (): FdrAPI.api.latest.TypeShape | undefined => {
        const typeShape = this.typeNode?.toFdrShape();
        if (typeShape === undefined || this.type === undefined) {
            return undefined;
        }
        switch (this.type) {
            case "object":
                return {
                    type: "object",
                    // Figure out a better way to do this
                    ...(typeShape as FdrAPI.api.latest.ObjectType),
                };
            case "alias":
                return {
                    type: this.type,
                    value: typeShape as FdrAPI.api.latest.TypeReference,
                };
            default:
                return undefined;
        }
    };
}
