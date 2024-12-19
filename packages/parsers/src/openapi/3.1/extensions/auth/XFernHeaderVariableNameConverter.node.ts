import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { xFernHeaderVariableNameKey } from "../fernExtension.consts";

export declare namespace XFernHeaderVariableNameConverterNode {
  export interface Input {
    [xFernHeaderVariableNameKey]?: string;
  }
}

export class XFernHeaderVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  string
> {
  headerVariableName: string | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.headerVariableName =
      extendType<XFernHeaderVariableNameConverterNode.Input>(this.input)[
        xFernHeaderVariableNameKey
      ];
  }

  convert(): string | undefined {
    return this.headerVariableName;
  }
}
