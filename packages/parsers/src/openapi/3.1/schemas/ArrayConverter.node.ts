import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../BaseOpenApiV3_1Converter.node";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ArrayConverterNode {
  interface Input extends OpenAPIV3_1.ArraySchemaObject {
    type: "array";
  }
  interface Output extends FernRegistry.api.latest.TypeShape.Alias {
    type: "alias";
    value: FernRegistry.api.latest.TypeReference.List;
  }
}

export class ArrayConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  ArrayConverterNode.Input,
  ArrayConverterNode.Output[] | undefined
> {
  item: SchemaConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<ArrayConverterNode.Input>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.item = new SchemaConverterNode({
      input: this.input.items,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "items",
    });

    if (this.input.items == null) {
      this.context.errors.error({
        message: "Expected 'items' property to be specified",
        path: this.accessPath,
      });
    }
  }

  convert(): ArrayConverterNode.Output[] | undefined {
    const maybeItemShapes = maybeSingleValueToArray(this.item?.convert());

    return maybeItemShapes?.map((itemShape) => ({
      type: "alias",
      value: {
        type: "list",
        itemShape,
      },
    }));
  }

  example(): unknown[] | undefined {
    return (
      this.input.example ?? this.input.examples?.[0] ?? [this.item?.example()]
    );
  }
}
