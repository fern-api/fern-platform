import {
<<<<<<< HEAD
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
=======
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
>>>>>>> main
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { X_FERN_SERVER_NAME } from "./fernExtension.consts";

export declare namespace XFernServerNameConverterNode {
<<<<<<< HEAD
    export type Input = {
        [X_FERN_SERVER_NAME]: string;
    };
}

export class XFernServerNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    serverName?: string;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.serverName = extendType<XFernServerNameConverterNode.Input>(this.input)[X_FERN_SERVER_NAME];
    }

    convert(): string | undefined {
        if (this.serverName == null) {
            return undefined;
        }

        return this.serverName;
    }
=======
  export type Input = {
    [X_FERN_SERVER_NAME]: string;
  };
}

export class XFernServerNameConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  string
> {
  serverName?: string;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.serverName = extendType<XFernServerNameConverterNode.Input>(
      this.input
    )[X_FERN_SERVER_NAME];
  }

  convert(): string | undefined {
    if (this.serverName == null) {
      return undefined;
    }

    return this.serverName;
  }
>>>>>>> main
}
