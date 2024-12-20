import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_FERN_BEARER_TOKEN } from "../fernExtension.consts";
import { TokenSecurityScheme } from "./types/TokenSecurityScheme";

export declare namespace XFernBearerTokenConverterNode {
<<<<<<< HEAD
    export interface Input {
        [X_FERN_BEARER_TOKEN]?: TokenSecurityScheme;
    }
=======
  export interface Input {
    [X_FERN_BEARER_TOKEN]?: TokenSecurityScheme;
  }
>>>>>>> main

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

<<<<<<< HEAD
    parse(): void {
        const bearerToken = extendType<XFernBearerTokenConverterNode.Input>(this.input)[X_FERN_BEARER_TOKEN];
        this.bearerTokenVariableName = bearerToken?.name;
        this.bearerTokenEnvVar = bearerToken?.env;
    }
=======
  parse(): void {
    const bearerToken = extendType<XFernBearerTokenConverterNode.Input>(
      this.input
    )[X_FERN_BEARER_TOKEN];
    this.bearerTokenVariableName = bearerToken?.name;
    this.bearerTokenEnvVar = bearerToken?.env;
  }
>>>>>>> main

  convert(): XFernBearerTokenConverterNode.Output | undefined {
    return {
      tokenVariableName: this.bearerTokenVariableName,
      tokenEnvVar: this.bearerTokenEnvVar,
    };
  }
}
