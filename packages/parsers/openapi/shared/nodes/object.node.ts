import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { ApiNodeContext, OutputApiNode } from "../../ApiNode";
import { SchemaObject } from "../openapi.types";
import { ObjectPropertyNode } from "./objectProperty.node";
import { TypeReferenceNode, isReferenceObject } from "./typeReference.node";

export class ObjectNode extends OutputApiNode<SchemaObject, FdrAPI.api.latest.ObjectType> {
    extends: FdrAPI.TypeId[] = [];
    properties: ObjectPropertyNode[] = [];
    extraProperties: TypeReferenceNode | undefined;

    constructor(context: ApiNodeContext, input: SchemaObject, accessPath: string[], accessorKey?: string) {
        super(context, input, accessPath);

        if (input.allOf != null) {
            this.extends = input.allOf
                .map((type) => (isReferenceObject(type) ? FdrAPI.TypeId(type.$ref) : undefined))
                .filter(isNonNullish);
        }

        if (input.properties != null) {
            Object.entries(input.properties).forEach(([key, property]) => {
                this.properties.push(new ObjectPropertyNode(key, context, property, accessPath, accessorKey));
            });
        }
    }

    toFdrShape = (): FdrAPI.api.latest.ObjectType | undefined => {
        const properties = this.properties.map((property) => property.toFdrShape()).filter(isNonNullish);

        return {
            extends: this.extends,
            properties,
            extraProperties: undefined,
            // TODO: add extraProperties
        };
    };
}
