import { isNonNullish, titleCase } from "@fern-api/ui-core-utils";
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
  // isUnionOfContainers: boolean | undefined;
  isNullable: boolean | undefined;
  discriminated: boolean | undefined;
  discriminant: string | undefined;
  discriminatedMapping: Record<string, SchemaConverterNode> | undefined;

  undiscriminatedMapping: SchemaConverterNode[] | undefined;
  schemaName: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<OpenAPIV3_1.NonArraySchemaObject> & {
      schemaName: string | undefined;
    }
  ) {
    super(args);
    this.schemaName = args.schemaName;
    this.safeParse();
  }

  parse(): void {
    if (this.input.oneOf != null || this.input.anyOf != null) {
      // COMMENTED OUT FOR NOW, CONSIDER BRINGING BACK IF MULTIPLE RESPONSES ARE SUPPORTED
      // this.isUnionOfContainers = (this.input.oneOf ?? this.input.anyOf)?.every(
      //   (schema) => {
      //     const resolvedSchema = resolveSchemaReference(
      //       schema,
      //       this.context.document
      //     );
      //     return (
      //       resolvedSchema?.type === "object" || resolvedSchema?.enum != null
      //     );
      //   }
      // );

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
                  nullable: undefined,
                  schemaName: this.schemaName,
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
              nullable: undefined,
              schemaName: this.schemaName,
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
    // COMMENTED OUT FOR NOW, CONSIDER BRINGING BACK IF MULTIPLE RESPONSES ARE SUPPORTED
    // if (!this.isUnionOfContainers && !this.discriminated) {
    if (!this.discriminated && this.undiscriminatedMapping?.length === 1) {
      const convertedNodes = this.undiscriminatedMapping
        ?.flatMap((node) => node.convert())
        .filter(isNonNullish);
      return this.isNullable && convertedNodes != null
        ? convertedNodes.map(wrapNullable).filter(isNonNullish)
        : convertedNodes;
    }

    let index = 0;
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
                      displayName: node.name ?? titleCase(key),
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
                      index += 1;
                      const fallbackTitle =
                        shape.type === "object"
                          ? titleCase(
                              `${this.schemaName ?? "Variant"} ${index}`
                            )
                          : undefined;
                      return {
                        displayName:
                          node.name ??
                          (shape.type === "alias"
                            ? shape.value.type === "id"
                              ? titleCase(shape.value.id)
                              : fallbackTitle
                            : fallbackTitle),
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
