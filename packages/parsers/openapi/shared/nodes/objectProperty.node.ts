import { FdrAPI } from "@fern-api/fdr-sdk";
import { ApiNodeContext, OutputApiNode } from "../../base.node.interface";
import { ReferenceObject, SchemaObject } from "../openapi.types";
import { isReferenceObject, mapReferenceObject } from "./typeReference.node";
import { TypeShapeNode } from "./typeShape.node";

export class ObjectPropertyNode extends OutputApiNode<
    SchemaObject | ReferenceObject,
    FdrAPI.api.latest.ObjectProperty
> {
    valueShape: TypeShapeNode;
    description: string | undefined;
    // availability: AvailabilityNode;

    constructor(
        private readonly key: string,
        context: ApiNodeContext,
        input: SchemaObject | ReferenceObject,
        accessPath: string[],
        accessorKey?: string,
    ) {
        super(context, input, accessPath);

        if (isReferenceObject(input)) {
            input = mapReferenceObject(input);
        }

        this.valueShape = new TypeShapeNode(context, input, accessPath, accessorKey);
        this.description = input.description;
        // this.availability = input.availability;
    }

    outputFdrShape = (): FdrAPI.api.latest.ObjectProperty | undefined => {
        const valueShape = this.valueShape.outputFdrShape();
        if (valueShape === undefined) {
            return undefined;
        }

        return {
            key: FdrAPI.PropertyKey(this.key),
            valueShape,
            description: this.description,
            availability: undefined,
            // TODO: update to availability: this.availability.outputFdrShape(),
        };
    };
}
