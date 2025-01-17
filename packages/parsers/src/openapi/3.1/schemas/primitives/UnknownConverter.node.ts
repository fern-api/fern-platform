import { noop } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "../SchemaConverter.node";

export declare namespace UnknownConverterNode {
  export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
    type: "alias";
    value: FernRegistry.api.latest.TypeReference.Unknown;
  }
}

export class UnknownConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  unknown,
  UnknownConverterNode.Output
> {
  displayName: string | undefined;
  shape: SchemaConverterNode | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    noop();
  }

  convert(): UnknownConverterNode.Output | undefined {
    return {
      type: "alias",
      value: {
        type: "unknown",
        displayName: undefined,
      },
    };
  }

  example(): undefined {
    return undefined;
  }
}
