import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../BaseOpenApiV3_1Converter.node";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";

export class ConstConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  OpenAPIV3_1.SchemaObject,
  FernRegistry.api.latest.TypeShape.Enum
> {
  constValue: string | undefined;
  description: string | undefined;
  availability: AvailabilityConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SchemaObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    // TODO: this can be any primitive type, so Enum Value should be an FDR primitive
    if (
      this.input.const != null &&
      (typeof this.input.const === "string" ||
        typeof this.input.const === "number" ||
        typeof this.input.const === "boolean")
    ) {
      this.constValue = this.input.const.toString();
    } else {
      this.context.errors.warning({
        message: `Unsupported const type: ${typeof this.input}`,
        path: this.accessPath,
      });
    }
    this.description = this.input.description;
    this.availability = new AvailabilityConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-availability",
    });
  }

  convert(): FernRegistry.api.latest.TypeShape.Enum | undefined {
    if (this.constValue == null) {
      return undefined;
    }

    return {
      type: "enum",
      default: this.constValue,
      values: [
        {
          value: this.constValue,
          description: this.description,
          availability: this.availability?.convert(),
        },
      ],
    };
  }

  example(): string | undefined {
    return this.input.example ?? this.input.examples?.[0] ?? this.constValue;
  }
}
