import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { convertToObjectProperties } from "../../utils/3.1/convertToObjectProperties";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { singleUndefinedArrayIfNullOrEmpty } from "../../utils/singleUndefinedArrayIfNullOrEmpty";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ObjectConverterNode {
  interface Input extends OpenAPIV3_1.NonArraySchemaObject {
    type?: "object";
  }
}

export class ObjectConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  ObjectConverterNode.Input,
  (
    | FernRegistry.api.latest.TypeShape.Object_
    | FernRegistry.api.latest.TypeShape.Alias
  )[]
> {
  description: string | undefined;
  extends: string[] = [];
  properties: Record<string, SchemaConverterNode> | undefined;
  extraProperties: string | SchemaConverterNode | undefined;
  requiredProperties: string[] | undefined;
  schemaName: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<ObjectConverterNode.Input> & {
      schemaName: string | undefined;
    }
  ) {
    super(args);
    this.schemaName = args.schemaName;
    this.safeParse();
  }

  parse(): void {
    this.extends = [];

    this.requiredProperties = this.input.required;
    this.properties = Object.fromEntries(
      Object.entries(this.input.properties ?? {}).map(([key, property]) => {
        return [
          key,
          new SchemaConverterNode({
            input: property,
            context: this.context,
            accessPath: this.accessPath,
            pathId: ["properties", key],
            seenSchemas: this.seenSchemas,
            nullable: undefined,
            schemaName: this.schemaName,
          }),
        ];
      })
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
              pathId: ["additionalProperties"],
              seenSchemas: this.seenSchemas,
              nullable: undefined,
              schemaName: this.schemaName,
            })
        : undefined;

    if (this.input.allOf != null) {
      this.extends = this.extends.concat(
        this.input.allOf
          .map((type, allOfIndex) => {
            if (isReferenceObject(type)) {
              return getSchemaIdFromReference(type);
            } else {
              this.properties = {
                ...this.properties,
                ...Object.fromEntries(
                  Object.entries(type.properties ?? {}).map(
                    ([key, property]) => {
                      return [
                        key,
                        new SchemaConverterNode({
                          input: property,
                          context: this.context,
                          accessPath: this.accessPath,
                          pathId: [
                            "allOf",
                            allOfIndex.toString(),
                            "properties",
                            key,
                          ],
                          seenSchemas: this.seenSchemas,
                          nullable: undefined,
                          schemaName: this.schemaName,
                        }),
                      ];
                    }
                  )
                ),
              };
              return undefined;
            }
          })
          .filter(isNonNullish)
      );
    }

    this.description = this.input.description;
  }

  convertProperties(): FernRegistry.api.latest.ObjectProperty[][] | undefined {
    if (this.properties == null) {
      return undefined;
    }

    return convertToObjectProperties(this.properties, this.requiredProperties);
  }

  convertExtraProperties():
    | FernRegistry.api.latest.TypeReference[]
    | undefined {
    if (this.extraProperties == null) {
      return undefined;
    }

    if (typeof this.extraProperties === "string") {
      return [
        {
          type: "map",
          keyShape: {
            type: "alias",
            value: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                minLength: undefined,
                maxLength: undefined,
                default: undefined,
              },
            },
          },
          valueShape: {
            type: "alias",
            value: {
              type: "unknown",
              displayName: this.extraProperties,
            },
          },
        },
      ];
    }

    const maybeConvertedShapes = maybeSingleValueToArray(
      this.extraProperties.convert()
    );

    return maybeConvertedShapes
      ?.map((shape) => ({
        type: "map" as const,
        keyShape: {
          type: "alias" as const,
          value: {
            type: "primitive" as const,
            value: {
              type: "string" as const,
              format: undefined,
              regex: undefined,
              minLength: undefined,
              maxLength: undefined,
              default: undefined,
            },
          },
        },
        valueShape: shape,
      }))
      .filter(isNonNullish);
  }

  convert():
    | (
        | FernRegistry.api.latest.TypeShape.Object_
        | FernRegistry.api.latest.TypeShape.Alias
      )[]
    | undefined {
    const maybeMultipleObjectsProperties = this.convertProperties();
    if (maybeMultipleObjectsProperties == null) {
      return undefined;
    }

    const maybeMultipleObjectsExtraProperties = this.convertExtraProperties();

    return maybeMultipleObjectsProperties.flatMap((properties) => {
      return singleUndefinedArrayIfNullOrEmpty(
        maybeMultipleObjectsExtraProperties
      ).map((extraProperties) => {
        if (
          (this.extends == null || this.extends.length === 0) &&
          properties.length === 0 &&
          extraProperties != null
        ) {
          return {
            type: "alias",
            value: extraProperties,
          };
        }
        return {
          type: "object",
          extends: this.extends.map((id) => FernRegistry.TypeId(id)),
          properties,
          extraProperties,
        };
      });
    });
  }

  example({
    includeOptionals,
  }: BaseOpenApiV3_1ConverterExampleArgs): Record<string, unknown> | undefined {
    let objectWithAllProperties = {
      ...this.properties,
    };
    this.input.allOf?.forEach((type) => {
      const resolvedType = resolveSchemaReference(type, this.context.document);
      if (resolvedType == null) {
        return;
      }
      objectWithAllProperties = {
        ...objectWithAllProperties,
        ...Object.fromEntries(
          Object.entries(resolvedType.properties ?? {}).map(
            ([key, property]) => {
              return [
                key,
                new SchemaConverterNode({
                  input: property,
                  context: this.context,
                  accessPath: this.accessPath,
                  pathId: this.pathId,
                  seenSchemas: this.seenSchemas,
                  nullable: undefined,
                  schemaName: this.schemaName,
                }),
              ];
            }
          )
        ),
      };
    });
    return (
      this.input.example ??
      this.input.examples?.[0] ??
      (!includeOptionals &&
      this.requiredProperties != null &&
      this.requiredProperties.length > 0
        ? this.requiredProperties?.reduce<Record<string, unknown>>(
            (acc, propertyKey) => {
              const propertyNode = objectWithAllProperties?.[propertyKey];
              acc[propertyKey] = propertyNode?.example({
                includeOptionals,
                override: propertyKey,
              });

              return acc;
            },
            {}
          )
        : Object.entries(objectWithAllProperties).reduce<
            Record<string, unknown>
          >((acc, [key, value]) => {
            acc[key] = value?.example({
              includeOptionals,
              override: key,
            });
            return acc;
          }, {}))
    );
  }
}
