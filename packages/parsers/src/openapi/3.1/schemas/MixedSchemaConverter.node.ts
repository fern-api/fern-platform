import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { wrapNullable } from "../../utils/wrapNullable";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace MixedSchemaConverterNode {
  export type Input = (
    | OpenAPIV3_1.ArraySchemaObject
    | OpenAPIV3_1.NonArraySchemaObject
    | { type: "null" }
  )[];
}

export class MixedSchemaConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  MixedSchemaConverterNode.Input,
  | FernRegistry.api.latest.TypeShape.UndiscriminatedUnion[]
  | FernRegistry.api.latest.TypeShape.Alias[]
> {
  typeNodes: SchemaConverterNode[] | undefined;
  nullable: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<MixedSchemaConverterNode.Input>
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
            seenSchemas: this.seenSchemas,
          });
        }
        return undefined;
      })
      .filter(isNonNullish);
  }

  public convert():
    | FernRegistry.api.latest.TypeShape.UndiscriminatedUnion[]
    | FernRegistry.api.latest.TypeShape.Alias[]
    | undefined {
    if (this.typeNodes == null) {
      return undefined;
    }

    const concreteTypeNodes: FernRegistry.api.latest.UndiscriminatedUnionVariant[][] =
      this.typeNodes
        .map((typeNode) => {
          const maybeShapes = maybeSingleValueToArray(typeNode.convert());

          return maybeShapes?.map((shape) => ({
            displayName: typeNode.name,
            shape,
            description: typeNode.description,
            availability: typeNode.availability?.convert(),
          }));
        })
        .filter(isNonNullish);

    const concreteTypeNodePermutations = concreteTypeNodes.reduce<
      FernRegistry.api.latest.UndiscriminatedUnionVariant[][]
    >(
      (acc, curr) => {
        return acc.flatMap((acc) =>
          curr.length > 0 ? curr.map((c) => [...acc, c]) : [[...acc]]
        );
      },
      [[]]
    );
    const unions = concreteTypeNodePermutations.map((variants) => ({
      type: "undiscriminatedUnion" as const,
      variants,
    }));

    return this.nullable
      ? unions.map(wrapNullable).filter(isNonNullish)
      : unions;
  }

  example(
    exampleArgs: BaseOpenApiV3_1ConverterExampleArgs
  ): unknown | undefined {
    return this.nullable ? null : this.typeNodes?.[0]?.example(exampleArgs);
  }
}
