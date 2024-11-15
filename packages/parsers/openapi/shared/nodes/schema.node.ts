import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { ApiNodeContext, InputApiNode } from "../../base.node.interface";
import { SchemaObject } from "../openapi.types";
import { TypeShapeNode } from "./typeShape.node";

export class SchemaNode extends InputApiNode<SchemaObject, FdrAPI.api.latest.TypeDefinition> {
    shape: TypeShapeNode;
    description: string | undefined;
    // availability: AvailabilityNode;

    constructor(
        private readonly name: string,
        context: ApiNodeContext,
        input: OpenAPIV3_1.SchemaObject,
        accessPath: string[],
        accessorKey?: string,
    ) {
        super(context, input, accessPath, accessorKey);

        this.shape = new TypeShapeNode(context, input, accessPath, accessorKey);
        this.description = input.description;
    }

    outputFdrShape = (): FdrAPI.api.latest.TypeDefinition | undefined => {
        const typeShape = this.shape.outputFdrShape();
        if (typeShape === undefined) {
            return undefined;
        }

        return {
            name: this.name,
            shape: typeShape,
            description: this.description,
            availability: undefined,
            // TODO: update to availability: this.availability.outputFdrShape(),
        };
    };
}
