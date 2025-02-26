import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../../BaseOpenApiV3_1Converter.node";
import { wrapNullable } from "../../../utils/wrapNullable";
import { SchemaConverterNode } from "../SchemaConverter.node";

export declare namespace NullConverterNode {
  export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
    type: "null";
  }

  export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
    type: "alias";
    value: FernRegistry.api.latest.TypeReference.Nullable;
  }
}

export class NullConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  NullConverterNode.Input,
  NullConverterNode.Output
> {
  displayName: string | undefined;
  shape: SchemaConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<NullConverterNode.Input>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.displayName = this.input.title;
  }

  convert(): NullConverterNode.Output | undefined {
    return wrapNullable({
      type: "alias",
      value: {
        type: "unknown",
        displayName: this.displayName,
      },
    });
  }

  example({
    includeOptionals,
  }: BaseOpenApiV3_1ConverterExampleArgs): null | undefined {
    return includeOptionals ? null : undefined;
  }
}
