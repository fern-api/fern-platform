import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_FERN_HEADER_NAME } from "../fernExtension.consts";

export declare namespace XFernHeaderVariableNameConverterNode {
<<<<<<< HEAD
    export interface Input {
        [X_FERN_HEADER_NAME]?: string;
    }
=======
  export interface Input {
    [X_FERN_HEADER_NAME]?: string;
  }
>>>>>>> main
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

<<<<<<< HEAD
    parse(): void {
        this.headerVariableName = extendType<XFernHeaderVariableNameConverterNode.Input>(this.input)[
            X_FERN_HEADER_NAME
        ];
    }
=======
  parse(): void {
    this.headerVariableName =
      extendType<XFernHeaderVariableNameConverterNode.Input>(this.input)[
        X_FERN_HEADER_NAME
      ];
  }
>>>>>>> main

  convert(): string | undefined {
    return this.headerVariableName;
  }
}
