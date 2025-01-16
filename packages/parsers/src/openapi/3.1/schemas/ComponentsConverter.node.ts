import { isNonNullish } from "@fern-api/ui-core-utils";
import { Components } from "@open-rpc/meta-schema";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class ComponentsConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.ComponentsObject | Components,
  FernRegistry.api.latest.ApiDefinition["types"]
> {
  typeSchemas: Record<string, SchemaConverterNode> | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
      OpenAPIV3_1.ComponentsObject | Components
    >
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.input.schemas == null) {
      this.context.errors.warning({
        message: "Expected 'schemas' property to be specified",
        path: this.accessPath,
      });
    } else {
      this.typeSchemas = Object.fromEntries(
        Object.entries(this.input.schemas).map(([key, value]) => {
          return [
            key,
            new SchemaConverterNode({
              input: value,
              context: this.context,
              accessPath: this.accessPath,
              pathId: key,
              seenSchemas: new Set(),
            }),
          ];
        })
      );
    }
  }

  convert(): FernRegistry.api.latest.ApiDefinition["types"] | undefined {
    if (this.typeSchemas == null) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(this.typeSchemas)
        .map(([key, value]) => {
          const name = value.name ?? key;
          const maybeShapes = maybeSingleValueToArray(value.convert());

          if (maybeShapes == null) {
            return [key, undefined];
          }

          return [
            FernRegistry.TypeId(key),
            {
              name,
              shape: maybeShapes[0],
              description: value.description,
              availability: undefined,
            },
          ];
        })
        .filter(([_, value]) => isNonNullish(value))
    );
  }
}
