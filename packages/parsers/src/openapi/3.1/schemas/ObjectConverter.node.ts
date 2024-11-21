import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeContext, BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ObjectConverterNode {
    interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "object";
    }
}

export class ObjectConverterNode extends BaseOpenApiV3_1Node<
    ObjectConverterNode.Input,
    FdrAPI.api.latest.TypeShape.Object_
> {
    description: string | undefined;
    extends: string[] = [];
    properties: Record<string, SchemaConverterNode>;
    extraProperties: string | SchemaConverterNode | undefined;

    constructor(
        input: ObjectConverterNode.Input,
        context: BaseOpenApiV3_1ConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.extends = [];

        this.properties = Object.fromEntries(
            Object.entries(input.properties ?? {}).map(([key, property]) => {
                return [key, new SchemaConverterNode(property, context, accessPath, pathId)];
            }),
        );

        this.extraProperties =
            input.additionalProperties != null
                ? typeof input.additionalProperties === "boolean"
                    ? input.additionalProperties
                        ? input.title
                        : undefined
                    : new SchemaConverterNode(input.additionalProperties, context, accessPath, pathId)
                : undefined;

        if (input.allOf != null) {
            this.extends = this.extends.concat(
                input.allOf
                    .map((type) => {
                        if (isReferenceObject(type)) {
                            return getSchemaIdFromReference(type);
                        } else {
                            this.properties = {
                                ...this.properties,
                                ...Object.fromEntries(
                                    Object.entries(input.properties ?? {}).map(([key, property]) => {
                                        return [key, new SchemaConverterNode(property, context, accessPath, pathId)];
                                    }),
                                ),
                            };
                            return undefined;
                        }
                    })
                    .filter(isNonNullish),
            );
        }

        this.description = input.description;
    }

    convertProperties(): FdrAPI.api.latest.ObjectProperty[] {
        return Object.entries(this.properties)
            .map(([key, node]) => {
                const convertedShape = node.convert();
                if (convertedShape == null) {
                    return undefined;
                }
                return {
                    key: FdrAPI.PropertyKey(key),
                    valueShape: convertedShape,
                    description: node.description,
                    // use Availability extension here
                    availability: undefined,
                };
            })
            .filter(isNonNullish);
    }

    convertExtraProperties(): FdrAPI.api.latest.TypeReference | undefined {
        if (this.extraProperties == null) {
            return undefined;
        }

        if (typeof this.extraProperties === "string") {
            return {
                type: "unknown",
                displayName: this.extraProperties,
            };
        }

        const convertedShape = this.extraProperties.convert();

        if (convertedShape?.type === "alias") {
            return convertedShape.value;
        }

        return undefined;
    }

    convert(): FdrAPI.api.latest.TypeShape.Object_ | undefined {
        return {
            type: "object",
            extends: this.extends.map((id) => FdrAPI.TypeId(id)),
            properties: this.convertProperties(),
            extraProperties: this.convertExtraProperties(),
        };
    }
}
