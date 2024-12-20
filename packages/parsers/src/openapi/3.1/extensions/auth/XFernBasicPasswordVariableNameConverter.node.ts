import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_FERN_BASIC_PASSWORD } from "../fernExtension.consts";

export declare namespace XFernBasicPasswordVariableNameConverterNode {
<<<<<<< HEAD
    export interface Input {
        [X_FERN_BASIC_PASSWORD]?: string;
    }
=======
  export interface Input {
    [X_FERN_BASIC_PASSWORD]?: string;
  }
>>>>>>> main
}

export class XFernBasicPasswordVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  string
> {
  passwordVariableName: string | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

<<<<<<< HEAD
    parse(): void {
        this.passwordVariableName = extendType<XFernBasicPasswordVariableNameConverterNode.Input>(this.input)[
            X_FERN_BASIC_PASSWORD
        ];
    }
=======
  parse(): void {
    this.passwordVariableName =
      extendType<XFernBasicPasswordVariableNameConverterNode.Input>(this.input)[
        X_FERN_BASIC_PASSWORD
      ];
  }
>>>>>>> main

  convert(): string | undefined {
    return this.passwordVariableName;
  }
}
