import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_BEARER_FORMAT } from "../openApiExtension.consts";

export declare namespace XBearerFormatConverterNode {
  export interface Input {
    [X_BEARER_FORMAT]?: string;
  }
}

export class XBearerFormatConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  string | undefined
> {
  bearerFormat: string | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.bearerFormat = extendType<XBearerFormatConverterNode.Input>(
      this.input
    )[X_BEARER_FORMAT];
  }

  convert(): string | undefined {
    return this.bearerFormat;
  }
}
