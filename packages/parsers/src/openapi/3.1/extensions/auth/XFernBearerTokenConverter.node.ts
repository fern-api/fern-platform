import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { xFernBearerTokenKey } from "../fernExtension.consts";
import { TokenSecurityScheme } from "./types/TokenSecurityScheme";

export declare namespace XFernBearerTokenConverterNode {
  export interface Input {
    [xFernBearerTokenKey]?: TokenSecurityScheme;
  }

  export interface Output {
    tokenVariableName?: string;
    tokenEnvVar?: string;
  }
}

export class XFernBearerTokenConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  XFernBearerTokenConverterNode.Output
> {
  bearerTokenVariableName: string | undefined;
  bearerTokenEnvVar: string | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    const bearerToken = extendType<XFernBearerTokenConverterNode.Input>(
      this.input
    )[xFernBearerTokenKey];
    this.bearerTokenVariableName = bearerToken?.name;
    this.bearerTokenEnvVar = bearerToken?.env;
  }

  convert(): XFernBearerTokenConverterNode.Output | undefined {
    return {
      tokenVariableName: this.bearerTokenVariableName,
      tokenEnvVar: this.bearerTokenEnvVar,
    };
  }
}
