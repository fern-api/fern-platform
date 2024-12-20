import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_FERN_BASIC_AUTH } from "../fernExtension.consts";
import { TokenSecurityScheme } from "./types/TokenSecurityScheme";

export declare namespace XFernBasicAuthNode {
<<<<<<< HEAD
    export interface Input {
        [X_FERN_BASIC_AUTH]?: {
            username?: TokenSecurityScheme;
            password?: TokenSecurityScheme;
        };
    }
=======
  export interface Input {
    [X_FERN_BASIC_AUTH]?: {
      username?: TokenSecurityScheme;
      password?: TokenSecurityScheme;
    };
  }
>>>>>>> main

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

<<<<<<< HEAD
    // This would be used to set a member on the node
    parse(): void {
        const basicAuthScheme = extendType<XFernBasicAuthNode.Input>(this.input)[X_FERN_BASIC_AUTH];
        this.username = basicAuthScheme?.username;
        this.password = basicAuthScheme?.password;
    }
=======
  // This would be used to set a member on the node
  parse(): void {
    const basicAuthScheme = extendType<XFernBasicAuthNode.Input>(this.input)[
      X_FERN_BASIC_AUTH
    ];
    this.username = basicAuthScheme?.username;
    this.password = basicAuthScheme?.password;
  }
>>>>>>> main

  convert(): XFernBasicAuthNode.Output | undefined {
    return {
      username: this.username,
      password: this.password,
    };
  }
}
