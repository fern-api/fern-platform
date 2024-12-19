import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { convertToObjectProperties } from "../../utils/3.1/convertToObjectProperties";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ObjectConverterNode {
  interface Input extends OpenAPIV3_1.NonArraySchemaObject {
    type?: "object";
  }
}

export class ObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  ObjectConverterNode.Input,
  FernRegistry.api.latest.TypeShape.Object_
> {
  description: string | undefined;
  extends: string[] = [];
  properties: Record<string, SchemaConverterNode> | undefined;
  extraProperties: string | SchemaConverterNode | undefined;
  requiredProperties: string[] | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<ObjectConverterNode.Input>
  ) {
    super(args);
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
            pathId: this.pathId,
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
                  Object.entries(this.input.properties ?? {}).map(
                    ([key, property]) => {
                      return [
                        key,
                        new SchemaConverterNode({
                          input: property,
                          context: this.context,
                          accessPath: this.accessPath,
                          pathId: this.pathId,
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

  convertProperties(): FernRegistry.api.latest.ObjectProperty[] | undefined {
    if (this.properties == null) {
      return undefined;
    }

    return convertToObjectProperties(this.properties, this.requiredProperties);
  }

  convertExtraProperties(): FernRegistry.api.latest.TypeReference | undefined {
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

  convert(): FernRegistry.api.latest.TypeShape.Object_ | undefined {
    const properties = this.convertProperties();
    if (properties == null) {
      return undefined;
    }

    return {
      type: "object",
      extends: this.extends.map((id) => FernRegistry.TypeId(id)),
      properties,
      extraProperties: this.convertExtraProperties(),
    };
  }
}
