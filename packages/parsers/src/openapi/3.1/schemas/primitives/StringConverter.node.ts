import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";

import { FernRegistry } from "../../../../client/generated";
import { FdrStringType } from "../../../../types/fdr.types";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../../BaseOpenApiV3_1Converter.node";
import {
  ConstArrayToType,
  OPENAPI_STRING_TYPE_FORMAT,
} from "../../../types/format.types";
import { EnumConverterNode } from "./EnumConverter.node";

export declare namespace StringConverterNode {
  export interface Input extends OpenAPIV3_1.NonArraySchemaObject {
    type: "string";
  }
  export interface Output extends FernRegistry.api.latest.TypeShape.Alias {
    type: "alias";
    value: {
      type: "primitive";
      value: FdrStringType;
    };
  }
}

function isOpenApiStringTypeFormat(
  format: unknown
): format is ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT> {
  return OPENAPI_STRING_TYPE_FORMAT.includes(
    format as ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT>
  );
}

export class StringConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  StringConverterNode.Input,
  StringConverterNode.Output | FernRegistry.api.latest.TypeShape.Enum
> {
  format: ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT> | undefined;
  regex: string | undefined;
  default: string | undefined;
  minLength: number | undefined;
  maxLength: number | undefined;
  enum: EnumConverterNode | undefined;
  mimeType: string | undefined;
  nullable: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<StringConverterNode.Input> & {
      nullable: boolean | undefined;
    }
  ) {
    super(args);
    this.nullable = args.nullable;
    this.safeParse();
  }

  mapToFdrType(
    format: ConstArrayToType<typeof OPENAPI_STRING_TYPE_FORMAT>
  ): FdrStringType["type"] {
    switch (format) {
      case "base64url":
      case "binary":
      case "byte":
      case "sf-binary":
        return "base64";
      case "date-time":
        return "datetime";
      case "int64":
        return "bigInteger";
      case "date":
        return "date";
      case "uuid":
        return "uuid";
      case "char":
      case "commonmark":
      case "decimal":
      case "decimal128":
      case "duration":
      case "email":
      case "hostname":
      case "html":
      case "http-date":
      case "idn-email":
      case "idn-hostname":
      case "ipv4":
      case "ipv6":
      case "iri-reference":
      case "iri":
      case "json-pointer":
      case "media-range":
      case "password":
      case "regex":
      case "relative-json-pointer":
      case "sf-boolean":
      case "sf-string":
      case "sf-token":
      case "time":
      case "uri-reference":
      case "uri-template":
      case "uri":
      case undefined:
        return "string";
      default:
        new UnreachableCaseError(format);
        return "string";
    }
  }

  parse(): void {
    this.regex = this.input.pattern;
    this.minLength = this.input.minLength;
    this.maxLength = this.input.maxLength;

    this.mimeType = this.input.contentMediaType;

    if (this.input.default != null && typeof this.input.default !== "string") {
      this.context.errors.warning({
        message: `Expected default value to be a string. Received ${this.input.default}`,
        path: this.accessPath,
      });
    }
    this.default = this.input.default;

    if (this.input.format != null) {
      if (!isOpenApiStringTypeFormat(this.input.format)) {
        this.context.errors.warning({
          message: `Expected format to be one of ${OPENAPI_STRING_TYPE_FORMAT.join(", ")}. Received ${this.input.format}`,
          path: this.accessPath,
        });
      } else {
        this.format = this.input.format;
      }
    }

    if (this.input.enum != null) {
      this.enum = new EnumConverterNode({
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "enum",
        nullable: this.nullable,
      });
    }
  }

  convert():
    | StringConverterNode.Output
    | FernRegistry.api.latest.TypeShape.Enum
    | undefined {
    if (this.enum != null) {
      return this.enum.convert();
    }

    let type: FdrStringType["type"] = "string";
    if (this.format != null) {
      type = this.mapToFdrType(this.format);
    }

    return {
      type: "alias",
      value: {
        type: "primitive",
        value:
          type === "base64"
            ? {
                type,
                mimeType: this.mimeType,
                default: this.default,
              }
            : {
                type,
                format: type === "string" ? this.format : undefined,
                regex: this.regex,
                minLength: this.minLength,
                maxLength: this.maxLength,
                default: this.default,
              },
      },
    };
  }

  example({
    override,
  }: BaseOpenApiV3_1ConverterExampleArgs): string | undefined {
    return (
      this.input.example ??
      this.input.examples?.[0] ??
      this.default ??
      (this.nullable ? null : (override ?? "string"))
    );
  }
}
