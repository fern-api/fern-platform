import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { wrapNullable } from "../../utils/wrapNullable";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class OneOfConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  OpenAPIV3_1.NonArraySchemaObject,
  | [FernRegistry.api.latest.TypeShape.DiscriminatedUnion]
  | [FernRegistry.api.latest.TypeShape.UndiscriminatedUnion]
  | FernRegistry.api.latest.TypeShape[]
> {
  isUnionOfContainers: boolean | undefined;
  isNullable: boolean | undefined;
  discriminated: boolean | undefined;
  discriminant: string | undefined;
  discriminatedMapping: Record<string, SchemaConverterNode> | undefined;

  undiscriminatedMapping: SchemaConverterNode[] | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<OpenAPIV3_1.NonArraySchemaObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.input.oneOf != null || this.input.anyOf != null) {
      this.isUnionOfContainers = (this.input.oneOf ?? this.input.anyOf)?.every(
        (schema) => {
          const resolvedSchema = resolveSchemaReference(
            schema,
            this.context.document
          );
          return (
            resolvedSchema?.type === "object" || resolvedSchema?.enum != null
          );
        }
      );
      this.isNullable = (this.input.oneOf ?? this.input.anyOf)?.some(
        (schema) =>
          resolveSchemaReference(schema, this.context.document)?.type === "null"
      );
      if (this.input.discriminator == null) {
        this.discriminated = false;
        this.undiscriminatedMapping = (this.input.oneOf ?? this.input.anyOf)
          ?.map((schema) => {
            return resolveSchemaReference(schema, this.context.document)
              ?.type !== "null"
              ? new SchemaConverterNode({
                  input: schema,
                  context: this.context,
                  accessPath: this.accessPath,
                  pathId: this.pathId,
                  seenSchemas: this.seenSchemas,
                })
              : undefined;
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
            const schema = resolveSchemaReference(
              { $ref: value },
              this.context.document
            );
            if (schema == null) {
              this.context.errors.warning({
                message: `Expected schema reference. Received undefined reference: ${value}`,
                path: [...this.accessPath, "discriminator", "mapping", key],
              });
              return;
            }
            discriminatedMapping[key] = new SchemaConverterNode({
              input: schema,
              context: this.context,
              accessPath: [...this.accessPath, "discriminator", "mapping", key],
              pathId: key,
              seenSchemas: this.seenSchemas,
            });
          });
        }
      }
    }
  }

  convert():
    | [FernRegistry.api.latest.TypeShape.DiscriminatedUnion]
    | [FernRegistry.api.latest.TypeShape.UndiscriminatedUnion]
    | FernRegistry.api.latest.TypeShape[]
    | undefined {
    if (!this.isUnionOfContainers && !this.discriminated) {
      const convertedNodes = this.undiscriminatedMapping
        ?.flatMap((node) => node.convert())
        .filter(isNonNullish);
      return this.isNullable && convertedNodes != null
        ? convertedNodes.map(wrapNullable).filter(isNonNullish)
        : convertedNodes;
    }

    if (
      // If no decision has been made, bail
      this.discriminated == null ||
      // If the union is discriminated, we need to have a discriminant and mapping
      (this.discriminated &&
        (this.discriminant == null || this.discriminatedMapping == null)) ||
      // If the union is undiscriminated, we should not have a discriminant or mapping
      (!this.discriminated && this.undiscriminatedMapping == null)
    ) {
      return undefined;
    }
    const union =
      this.discriminated &&
      this.discriminant != null &&
      this.discriminatedMapping != null
        ? {
            type: "discriminatedUnion" as const,
            discriminant: FernRegistry.PropertyKey(this.discriminant),
            variants: Object.entries(this.discriminatedMapping)
              .flatMap(([key, node]) => {
                const convertedShapes = maybeSingleValueToArray(node.convert());

                return convertedShapes
                  ?.map((shape) => {
                    if (shape == null || shape.type !== "object") {
                      return undefined;
                    }
                    return {
                      discriminantValue: key,
                      displayName: node.name,
                      availability: node.availability?.convert(),
                      description: node.description,
                      ...shape,
                    };
                  })
                  .filter(isNonNullish);
              })
              .filter(isNonNullish),
          }
        : this.undiscriminatedMapping != null
          ? {
              type: "undiscriminatedUnion" as const,
              variants: this.undiscriminatedMapping
                .flatMap((node) => {
                  const convertedShapes = maybeSingleValueToArray(
                    node.convert()
                  );

                  return convertedShapes
                    ?.map((shape) => {
                      if (shape == null) {
                        return undefined;
                      }
                      return {
                        displayName: node.name,
                        shape,
                        description: node.description,
                        availability: node.availability?.convert(),
                      };
                    })
                    .filter(isNonNullish);
                })
                .filter(isNonNullish),
            }
          : undefined;
    const wrappedUnion = this.isNullable ? wrapNullable(union) : union;
    return wrappedUnion != null ? [wrappedUnion] : undefined;
  }

  example(
    exampleArgs: BaseOpenApiV3_1ConverterExampleArgs
  ): Record<string, unknown> | undefined {
    return (
      this.input.example ??
      this.input.examples?.[0] ??
      this.undiscriminatedMapping?.[0]?.example(exampleArgs) ??
      Object.values(this.discriminatedMapping ?? {})[0]?.example(exampleArgs)
    );
  }
}
