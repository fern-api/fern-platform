import { FdrAPI } from "@fern-api/fdr-sdk";
import { ApiNodeContext, OutputApiNode } from "../../base.node.interface";
import { SchemaObject } from "../openapi.types";
import { ObjectPropertyNode } from "./objectProperty.node";
import { TypeReferenceNode, isReferenceObject } from "./typeReference.node";

export class ObjectNode extends OutputApiNode<SchemaObject, FdrAPI.api.latest.ObjectType> {
    extends: FdrAPI.TypeId[] = [];
    properties: ObjectPropertyNode[] = [];
    extraProperties: TypeReferenceNode | undefined;

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[], accessorKey?: string) {
        super(context, input, accessPath);

        if (input.allOf !== undefined) {
            this.extends = input.allOf
                .map((type) => (isReferenceObject(type) ? FdrAPI.TypeId(type.$ref) : undefined))
                .filter((id): id is FdrAPI.TypeId => id !== undefined);
        }

        if (input.properties !== undefined) {
            Object.entries(input.properties).forEach(([key, property]) => {
                this.properties.push(new ObjectPropertyNode(key, context, property, accessPath, accessorKey));
            });
        }
    }

    outputFdrShape = (): FdrAPI.api.latest.ObjectType | undefined => {
        const properties = this.properties
            .map((property) => property.outputFdrShape())
            .filter((property): property is FdrAPI.api.latest.ObjectProperty => property !== undefined);

        return {
            extends: this.extends,
            properties,
            extraProperties: undefined,
            // TODO: add extraProperties
        };
    };
}
