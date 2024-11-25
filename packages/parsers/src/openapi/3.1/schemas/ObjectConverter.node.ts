import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ObjectConverterNode {
    interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "object";
    }
}

export function convertProperties(
    properties: Record<string, SchemaConverterNode> | undefined,
): FdrAPI.api.latest.ObjectProperty[] | undefined {
    if (properties == null) {
        return undefined;
    }

    return Object.entries(properties)
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

export class ObjectConverterNode extends BaseOpenApiV3_1Node<
    ObjectConverterNode.Input,
    FdrAPI.api.latest.TypeShape.Object_
> {
    description: string | undefined;
    extends: string[] = [];
    properties: Record<string, SchemaConverterNode> | undefined;
    extraProperties: string | SchemaConverterNode | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<ObjectConverterNode.Input>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.extends = [];

        this.properties = Object.fromEntries(
            Object.entries(this.input.properties ?? {}).map(([key, property]) => {
                return [
                    key,
                    new SchemaConverterNode({
                        input: property,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: this.pathId,
                    }),
                ];
            }),
        );

        this.extraProperties =
            this.input.additionalProperties != null
                ? typeof this.input.additionalProperties === "boolean"
                    ? this.input.additionalProperties
                        ? this.input.title
                        : undefined
                    : new SchemaConverterNode({
                          input: this.input.additionalProperties,
                          context: this.context,
                          accessPath: this.accessPath,
                          pathId: this.pathId,
                      })
                : undefined;

        if (this.input.allOf != null) {
            this.extends = this.extends.concat(
                this.input.allOf
                    .map((type) => {
                        if (isReferenceObject(type)) {
                            return getSchemaIdFromReference(type);
                        } else {
                            this.properties = {
                                ...this.properties,
                                ...Object.fromEntries(
                                    Object.entries(this.input.properties ?? {}).map(([key, property]) => {
                                        return [
                                            key,
                                            new SchemaConverterNode({
                                                input: property,
                                                context: this.context,
                                                accessPath: this.accessPath,
                                                pathId: this.pathId,
                                            }),
                                        ];
                                    }),
                                ),
                            };
                            return undefined;
                        }
                    })
                    .filter(isNonNullish),
            );
        }

        this.description = this.input.description;
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
        const properties = convertProperties(this.properties);
        if (properties == null) {
            return undefined;
        }

        return {
            type: "object",
            extends: this.extends.map((id) => FdrAPI.TypeId(id)),
            properties,
            extraProperties: this.convertExtraProperties(),
        };
    }
}
