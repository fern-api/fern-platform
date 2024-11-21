import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeContext, BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace OneOfConverterNode {
    export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "object";
    }
}

export class OneOfConverterNode extends BaseOpenApiV3_1Node<
    OneOfConverterNode.Input,
    FdrAPI.api.latest.TypeShape.DiscriminatedUnion | FdrAPI.api.latest.TypeShape.UndiscriminatedUnion
> {
    discriminated: boolean | undefined;
    discriminant: string | undefined;
    discriminatedMapping: Record<string, SchemaConverterNode> | undefined;

    undiscriminatedMapping: SchemaConverterNode[] | undefined;

    constructor(
        input: OneOfConverterNode.Input,
        context: BaseOpenApiV3_1ConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        if (input.oneOf != null) {
            if (input.discriminator == null) {
                this.discriminated = false;
                this.undiscriminatedMapping = input.oneOf
                    ?.map((schema) => {
                        if (!isReferenceObject(schema) && schema.type !== "object") {
                            context.errors.error({
                                message: "oneOf schema is not an object",
                                path: accessPath,
                            });
                            return undefined;
                        }
                        return new SchemaConverterNode(schema, context, accessPath, pathId);
                    })
                    .filter(isNonNullish);
            } else {
                this.discriminated = true;
                this.discriminant = input.discriminator.propertyName;
                this.discriminatedMapping = {};

                const discriminatedMapping = this.discriminatedMapping;

                const maybeMapping = input.discriminator.mapping;
                if (maybeMapping != null) {
                    Object.entries(maybeMapping).map(([key, value]) => {
                        discriminatedMapping[key] = new SchemaConverterNode(
                            resolveSchemaReference(
                                {
                                    $ref: value,
                                },
                                context.document,
                            ),
                            context,
                            accessPath,
                            pathId,
                        );
                    });
                } else {
                    // TODO: deeply visit the schemas to find the discriminant values. For now we assume all schemas are not references
                }
            }
        }
    }

    public convert():
        | FdrAPI.api.latest.TypeShape.DiscriminatedUnion
        | FdrAPI.api.latest.TypeShape.UndiscriminatedUnion
        | undefined {
        if (
            // If no decision has been made, bail
            this.discriminated == null ||
            // If the union is discriminated, we need to have a discriminant and mapping
            (this.discriminated && (this.discriminant == null || this.discriminatedMapping == null)) ||
            // If the union is undiscriminated, we should not have a discriminant or mapping
            (!this.discriminated && this.undiscriminatedMapping == null)
        ) {
            return undefined;
        }
        return this.discriminated && this.discriminant != null && this.discriminatedMapping != null
            ? {
                  type: "discriminatedUnion",
                  discriminant: FdrAPI.PropertyKey(this.discriminant),
                  variants: Object.entries(this.discriminatedMapping)
                      .map(([key, node]) => {
                          const convertedShape = node.convert();
                          if (convertedShape == null || convertedShape.type !== "object") {
                              return undefined;
                          }
                          return {
                              discriminantValue: key,
                              // TODO x-fern-display-name extension
                              displayName: undefined,
                              // TODO x-fern-availability extension
                              availability: undefined,
                              description: node.description,
                              ...convertedShape,
                          };
                      })
                      .filter(isNonNullish),
              }
            : this.undiscriminatedMapping != null
              ? {
                    type: "undiscriminatedUnion",
                    variants: this.undiscriminatedMapping
                        .map((node) => {
                            const convertedShape = node.convert();
                            if (convertedShape == null || convertedShape.type !== "object") {
                                return undefined;
                            }
                            return {
                                displayName: node.name,
                                shape: convertedShape,
                                description: node.description,
                                // TODO: handle availability
                                availability: undefined,
                            };
                        })
                        .filter(isNonNullish),
                }
              : undefined;
    }
}
