import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_FERN_BASIC_USERNAME } from "../fernExtension.consts";

export declare namespace XFernBasicUsernameVariableNameConverterNode {
  export interface Input {
    [X_FERN_BASIC_USERNAME]?: string;
  }
}

export class XFernBasicUsernameVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  string
> {
  usernameVariableName: string | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.usernameVariableName =
      extendType<XFernBasicUsernameVariableNameConverterNode.Input>(this.input)[
        X_FERN_BASIC_USERNAME
      ];
  }

  convert(): string | undefined {
    return this.usernameVariableName;
  }
}
