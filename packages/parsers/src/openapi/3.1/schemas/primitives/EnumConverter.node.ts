import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../../BaseOpenApiV3_1Converter.node";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { isReferenceObject } from "../../guards/isReferenceObject";

export class EnumConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  OpenAPIV3_1.NonArraySchemaObject,
  FernRegistry.api.latest.TypeShape.Enum
> {
  default: string | undefined;
  values: string[] = [];
  nullable: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.NonArraySchemaObject> & {
      nullable: boolean | undefined;
    }
  ) {
    super(args);
    this.nullable = args.nullable;
    this.safeParse();
  }

  parse(): void {
    if (this.input.enum != null) {
      let continueParsing = true;
      this.values = this.input.enum
        .map((value, index) => {
          if (!continueParsing) {
            return undefined;
          }

          if (isReferenceObject(value)) {
            const resolvedReference = resolveSchemaReference(
              value,
              this.context.document
            );

            value =
              typeof resolvedReference === "string"
                ? resolvedReference
                : typeof resolvedReference?.default === "string"
                  ? resolvedReference?.default
                  : typeof resolvedReference?.example === "string"
                    ? resolvedReference.example
                    : undefined;
          }

          // TODO: Support { name?: .., description?: .., casing?: .. } here as well
          if (typeof value !== "string") {
            this.context.errors.error({
              message: `Expected enum values to be strings. Received ${value}`,
              path: [...this.accessPath, `enum[${index}]`],
            });
            continueParsing = false;
            return undefined;
          }
          return value;
        })
        .filter(isNonNullish);
      this.values = Array.from(new Set(this.values));
    }

    this.default = this.input.default;
  }

  convert(): FernRegistry.api.latest.TypeShape.Enum | undefined {
    return {
      type: "enum",
      values: this.values.map((value) => ({
        value,
        description: undefined,
        availability: undefined,
      })),
      default: this.default,
    };
  }

  example({
    includeOptionals,
  }: BaseOpenApiV3_1ConverterExampleArgs): string | null | undefined {
    return (
      this.input.example ??
      this.input.examples?.[0] ??
      this.default ??
      this.values[0] ??
      (includeOptionals ? (this.nullable ? null : undefined) : undefined)
    );
  }
}
