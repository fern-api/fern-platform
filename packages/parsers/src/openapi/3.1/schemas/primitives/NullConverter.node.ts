import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
<<<<<<< HEAD
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
    BaseOpenApiV3_1ConverterNodeWithExample,
=======
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
>>>>>>> main
} from "../../../BaseOpenApiV3_1Converter.node";

export declare namespace NullConverterNode {
  export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
    type: "null";
  }

  export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
    type: "alias";
    value: FernRegistry.api.latest.TypeReference.Unknown;
  }
}

export class NullConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
<<<<<<< HEAD
    NullConverterNode.Input,
    NullConverterNode.Output
> {
    displayName: string | undefined;
=======
  NullConverterNode.Input,
  NullConverterNode.Output
> {
  displayName: string | undefined;
>>>>>>> main

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<NullConverterNode.Input>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.displayName = this.input.title;
  }

<<<<<<< HEAD
    convert(): NullConverterNode.Output | undefined {
        return {
            type: "alias",
            value: {
                type: "unknown",
                displayName: this.displayName,
            },
        };
    }

    example(): null {
        return null;
    }
=======
  convert(): NullConverterNode.Output | undefined {
    return {
      type: "alias",
      value: {
        type: "unknown",
        displayName: this.displayName,
      },
    };
  }

  example(): null {
    return null;
  }
>>>>>>> main
}
