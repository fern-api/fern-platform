import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import { FdrIntegerType } from "../../../../types/fdr.types";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../../BaseOpenApiV3_1Converter.node";
import {
  ConstArrayToType,
  OPENAPI_INTEGER_TYPE_FORMAT,
} from "../../../types/format.types";

export declare namespace IntegerConverterNode {
  export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
    type: "integer";
  }
  export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
    type: "alias";
    value: {
      type: "primitive";
      value: FdrIntegerType;
    };
  }
}

function isOpenApiIntegerTypeFormat(
  format: unknown
): format is ConstArrayToType<typeof OPENAPI_INTEGER_TYPE_FORMAT> {
  return OPENAPI_INTEGER_TYPE_FORMAT.includes(
    format as ConstArrayToType<typeof OPENAPI_INTEGER_TYPE_FORMAT>
  );
}

export class IntegerConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  IntegerConverterNode.Input,
  IntegerConverterNode.Output
> {
  format: ConstArrayToType<typeof OPENAPI_INTEGER_TYPE_FORMAT> | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  default: number | undefined;
  nullable: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<IntegerConverterNode.Input> & {
      nullable: boolean | undefined;
    }
  ) {
    super(args);
    this.nullable = args.nullable;
    this.safeParse();
  }

  parse(): void {
    this.minimum = this.input.minimum;
    this.maximum = this.input.maximum;
    if (this.input.default != null && typeof this.input.default !== "number") {
      this.context.errors.warning({
        message: `Expected default value to be an integer. Received ${this.input.default}`,
        path: this.accessPath,
      });
    }
    this.default = this.input.default;

    if (this.input.format != null) {
      if (!isOpenApiIntegerTypeFormat(this.input.format)) {
        this.context.errors.warning({
          message: `Expected format to be one of ${OPENAPI_INTEGER_TYPE_FORMAT.join(", ")}. Received ${this.input.format}`,
          path: this.accessPath,
        });
      } else {
        this.format = this.input.format;
      }
    }
  }

  convert(): IntegerConverterNode.Output | undefined {
    let type: FdrIntegerType["type"] = "integer";
    if (this.format != null) {
      switch (this.format) {
        case "int64":
          type = "long";
          break;
        case "int8":
        case "int16":
        case "int32":
        case "uint8":
        case "sf-integer":
        case undefined:
          type = "integer";
          break;
        default:
          new UnreachableCaseError(this.format);
          break;
      }
    }
    return {
      type: "alias",
      value: {
        type: "primitive",
        value: {
          type,
          minimum: this.minimum,
          maximum: this.maximum,
          default: this.default,
        },
      },
    };
  }

  example({
    includeOptionals,
  }: BaseOpenApiV3_1ConverterExampleArgs): string | number | undefined {
    return (
      this.input.example ??
      this.input.examples?.[0] ??
      this.default ??
      (includeOptionals ? (this.nullable ? null : 0) : undefined)
    );
  }
}
