import { noop } from "es-toolkit";
import { OpenAPIV3_1 } from "openapi-types";
import {
<<<<<<< HEAD
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";

export class TagObjectConverterNode extends BaseOpenApiV3_1ConverterNode<OpenAPIV3_1.TagObject, void> {
    name: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.TagObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.name = this.input.name;
    }

    convert(): void {
        noop();
    }
=======
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";

export class TagObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.TagObject,
  void
> {
  name: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.TagObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.name = this.input.name;
  }

  convert(): void {
    noop();
  }
>>>>>>> main
}
