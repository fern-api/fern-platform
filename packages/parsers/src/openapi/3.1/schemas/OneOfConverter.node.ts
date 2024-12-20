import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class OneOfConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  OpenAPIV3_1.NonArraySchemaObject,
  | FernRegistry.api.latest.TypeShape.DiscriminatedUnion
  | FernRegistry.api.latest.TypeShape.UndiscriminatedUnion
> {
  discriminated: boolean | undefined;
  discriminant: string | undefined;
  discriminatedMapping: Record<string, SchemaConverterNode> | undefined;

  undiscriminatedMapping: SchemaConverterNode[] | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.NonArraySchemaObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.input.oneOf != null) {
      if (this.input.discriminator == null) {
        this.discriminated = false;
        this.undiscriminatedMapping = this.input.oneOf?.map((schema, i) => {
          return new SchemaConverterNode({
            input: schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: `oneOf[${i}]`,
          });
        });
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
            });
          });
        }
      }
    }
  }

  convert():
    | FernRegistry.api.latest.TypeShape.DiscriminatedUnion
    | FernRegistry.api.latest.TypeShape.UndiscriminatedUnion
    | undefined {
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
    return this.discriminated &&
      this.discriminant != null &&
      this.discriminatedMapping != null
      ? {
          type: "discriminatedUnion",
          discriminant: FernRegistry.PropertyKey(this.discriminant),
          variants: Object.entries(this.discriminatedMapping)
            .map(([key, node]) => {
              const convertedShape = node.convert();
              if (
                convertedShape == null ||
                (convertedShape.type !== "object" &&
                  convertedShape.type !== "alias")
              ) {
                return undefined;
              }

              if (convertedShape.type === "alias") {
                return {
                  discriminantValue: key,
                  displayName: undefined,
                  availability: node.availability?.convert(),
                  description: node.description,
                  properties: [],
                  extraProperties: undefined,
                  extends:
                    convertedShape.value.type === "id"
                      ? [FernRegistry.TypeId(convertedShape.value.id)]
                      : [],
                };
              }

              return {
                discriminantValue: key,
                // TODO x-fern-display-name extension
                displayName: undefined,
                availability: node.availability?.convert(),
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
                if (
                  convertedShape == null ||
                  (convertedShape.type !== "object" &&
                    convertedShape.type !== "alias")
                ) {
                  return undefined;
                }
                return {
                  displayName: node.name,
                  shape: convertedShape,
                  description: node.description,
                  availability: node.availability?.convert(),
                };
              })
              .filter(isNonNullish),
          }
        : undefined;
  }

  example(): Record<string, unknown> | undefined {
    return (
      this.input.example ??
      this.input.examples?.[0] ??
      this.undiscriminatedMapping?.[0]?.example() ??
      Object.values(this.discriminatedMapping ?? {})[0]?.example()
    );
  }
}
