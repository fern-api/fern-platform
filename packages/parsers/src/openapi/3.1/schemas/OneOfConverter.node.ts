import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class OneOfConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.NonArraySchemaObject,
    FdrAPI.api.latest.TypeShape.DiscriminatedUnion | FdrAPI.api.latest.TypeShape.UndiscriminatedUnion
> {
    discriminated: boolean | undefined;
    discriminant: string | undefined;
    discriminatedMapping: Record<string, SchemaConverterNode> | undefined;

    undiscriminatedMapping: SchemaConverterNode[] | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.NonArraySchemaObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        if (this.input.oneOf != null) {
            if (this.input.discriminator == null) {
                this.discriminated = false;
                this.undiscriminatedMapping = this.input.oneOf
                    ?.map((schema) => {
                        // if (!isReferenceObject(schema) && schema.type !== "object") {
                        //     this.context.errors.error({
                        //         message: `Expected 'oneOf' schema to be an object. Received ${schema.type}`,
                        //         path: this.accessPath,
                        //     });
                        //     return undefined;
                        // }
                        return new SchemaConverterNode({
                            input: schema,
                            context: this.context,
                            accessPath: this.accessPath,
                            pathId: this.pathId,
                        });
                    })
                    .filter(isNonNullish);
            } else {
                const maybeMapping = this.input.discriminator.mapping;
                if (maybeMapping != null) {
                    this.discriminated = true;

                    this.discriminant = this.input.discriminator.propertyName;
                    this.discriminatedMapping = {};

                    const discriminatedMapping = this.discriminatedMapping;

                    Object.entries(maybeMapping).map(([key, value]) => {
                        discriminatedMapping[key] = new SchemaConverterNode({
                            input: resolveSchemaReference(
                                {
                                    $ref: value,
                                },
                                this.context.document,
                            ),
                            context: this.context,
                            accessPath: this.accessPath,
                            pathId: this.pathId,
                        });
                    });
                }
            }
        }
    }

    convert():
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
