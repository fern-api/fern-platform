import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { X_FERN_SDK_METHOD_NAME } from "./fernExtension.consts";

export declare namespace XFernSdkMethodNameConverter {
  export interface Input {
    [X_FERN_SDK_METHOD_NAME]?: string;
  }
}

export class XFernSdkMethodNameConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  string | undefined
> {
  sdkMethodName?: string;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  // This would be used to set a member on the node
  parse(): void {
    this.sdkMethodName = extendType<XFernSdkMethodNameConverter.Input>(
      this.input
    )[X_FERN_SDK_METHOD_NAME];
  }

  convert(): string | undefined {
    return this.sdkMethodName;
  }
}
