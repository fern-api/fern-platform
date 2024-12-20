import { OpenAPIV3_1 } from "openapi-types";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { X_FERN_BASE_PATH } from "./fernExtension.consts";
export declare namespace XFernBasePathConverterNode {
<<<<<<< HEAD
    export interface Input {
        [X_FERN_BASE_PATH]?: string;
    }
=======
  export interface Input {
    [X_FERN_BASE_PATH]?: string;
  }
>>>>>>> main
}

export class XFernBasePathConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.Document,
  string | undefined
> {
  basePath?: string;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.Document>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.basePath = extendType<XFernBasePathConverterNode.Input>(this.input)[
      X_FERN_BASE_PATH
    ];

    if (this.basePath != null) {
      if (this.basePath.startsWith("/")) {
        this.basePath = this.basePath.slice(1);
      }

      if (this.basePath.endsWith("/")) {
        this.basePath = this.basePath.slice(0, -1);
      }
    } else {
      this.basePath = undefined;
    }
  }

<<<<<<< HEAD
    parse(): void {
        this.basePath = extendType<XFernBasePathConverterNode.Input>(this.input)[X_FERN_BASE_PATH];

        if (this.basePath != null) {
            if (this.basePath.startsWith("/")) {
                this.basePath = this.basePath.slice(1);
            }

            if (this.basePath.endsWith("/")) {
                this.basePath = this.basePath.slice(0, -1);
            }
        } else {
            this.basePath = undefined;
        }
    }

    convert(): string | undefined {
        return this.basePath;
    }
=======
  convert(): string | undefined {
    return this.basePath;
  }
>>>>>>> main
}
