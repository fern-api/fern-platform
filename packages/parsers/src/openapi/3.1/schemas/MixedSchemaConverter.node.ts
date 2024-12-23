import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace MixedSchemaConverterNode {
  export type Input = (
    | OpenAPIV3_1.ArraySchemaObject
    | OpenAPIV3_1.NonArraySchemaObject
    | { type: "null" }
  )[];
}

export class MixedSchemaConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  MixedSchemaConverterNode.Input,
  | FernRegistry.api.latest.TypeShape.UndiscriminatedUnion
  | FernRegistry.api.latest.TypeShape.Alias
> {
  typeNodes: SchemaConverterNode[] | undefined;
  nullable: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<MixedSchemaConverterNode.Input>
  ) {
    super(args);
    this.parse();
  }

  parse(): void {
    this.typeNodes = this.input
      .map((type) => {
        if (type.type === "null") {
          this.nullable = true;
        } else {
          return new SchemaConverterNode({
            input: type,
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
          });
        }
        return undefined;
      })
      .filter(isNonNullish);
  }

  public convert():
    | FernRegistry.api.latest.TypeShape.UndiscriminatedUnion
    | FernRegistry.api.latest.TypeShape.Alias
    | undefined {
    if (this.typeNodes == null) {
      return undefined;
    }

    const union = {
      type: "undiscriminatedUnion",
      variants: this.typeNodes
        .map((typeNode) => {
          const shape = typeNode.convert();
          if (shape == null) {
            return undefined;
          }

          return {
            displayName: typeNode.name,
            shape,
            description: typeNode.description,
            availability: typeNode.availability?.convert(),
          };
        })
        .filter(isNonNullish),
    } as const;

    // TODO: right now, this is handled as an optional, but we should handle it as nullable
    return this.nullable
      ? {
          type: "alias",
          value: {
            type: "optional",
            default: union.variants[0],
            shape: union,
          },
        }
      : union;
  }

  example(): unknown | undefined {
    return this.typeNodes?.[0]?.example();
  }
}
