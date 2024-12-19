import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
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

export class ArrayConverterNode extends BaseOpenApiV3_1ConverterNode<
  ArrayConverterNode.Input,
  ArrayConverterNode.Output | undefined
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

  convert(): ArrayConverterNode.Output | undefined {
    const itemShape = this.item?.convert();

    if (itemShape == null) {
      return undefined;
    }

    return {
      type: "alias",
      value: {
        type: "list",
        itemShape,
      },
    };
  }
}
