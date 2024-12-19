import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { xFernBasicAuthKey } from "../fernExtension.consts";
import { TokenSecurityScheme } from "./types/TokenSecurityScheme";

export declare namespace XFernBasicAuthNode {
  export interface Input {
    [xFernBasicAuthKey]?: {
      username?: TokenSecurityScheme;
      password?: TokenSecurityScheme;
    };
  }

  export interface Output {
    username?: TokenSecurityScheme;
    password?: TokenSecurityScheme;
  }
}

export class XFernBasicAuthNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  XFernBasicAuthNode.Output
> {
  username: TokenSecurityScheme | undefined;
  password: TokenSecurityScheme | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  // This would be used to set a member on the node
  parse(): void {
    const basicAuthScheme = extendType<XFernBasicAuthNode.Input>(this.input)[
      xFernBasicAuthKey
    ];
    this.username = basicAuthScheme?.username;
    this.password = basicAuthScheme?.password;
  }

  convert(): XFernBasicAuthNode.Output | undefined {
    return {
      username: this.username,
      password: this.password,
    };
  }
}
