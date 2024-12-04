import { OpenAPIV3_1 } from "openapi-types";
// import { UnreachableCaseError } from "ts-essentials";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";

export class XFernBasePathConverterNode extends BaseOpenApiV3_1ConverterNode<OpenAPIV3_1.Document, string | undefined> {
  basePath?: string;
  
  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.Document>) {
    super(args);
    this.safeParse();
  }
  
  parse(): void {
    // check base path is valid
    this.basePath = extendType<{ "x-fern-base-path"?: string; }>(this.input)["x-fern-base-path"];
  }
  
  convert(): string | undefined {
    switch (this.basePath) {
      case this.basePath: 
        return this.basePath;
      case undefined: 
        return undefined;
      // default:
      //   new UnreachableCaseError(this.basePath);
      //   return undefined;
    }
  }
}