import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
  BaseOpenApiV3_1ConverterNodeWithExample,
} from "../../../BaseOpenApiV3_1Converter.node";
import { convertToObjectProperties } from "../../../utils/3.1/convertToObjectProperties";
import { resolveParameterBaseReference } from "../../../utils/3.1/resolveParameterBaseReference";
import { AvailabilityConverterNode } from "../../extensions/AvailabilityConverter.node";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";

export function convertOperationObjectProperties(
  properties: Record<string, ParameterBaseObjectConverterNode> | undefined
): FernRegistry.api.latest.ObjectProperty[][] | undefined {
  if (properties == null) {
    return undefined;
  }

  return convertToObjectProperties(
    properties,
    Object.entries(properties ?? {})
      .map(([key, header]) => (header.required ? key : undefined))
      .filter(isNonNullish)
  );
}

export class ParameterBaseObjectConverterNode extends BaseOpenApiV3_1ConverterNodeWithExample<
  OpenAPIV3_1.ParameterBaseObject | OpenAPIV3_1.ReferenceObject,
  FernRegistry.api.latest.TypeShape | FernRegistry.api.latest.TypeShape[]
> {
  availability: AvailabilityConverterNode | undefined;
  required: boolean | undefined;
  schema: SchemaConverterNode | undefined;
  description: string | undefined;
  inputExample: unknown | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
      OpenAPIV3_1.ParameterBaseObject | OpenAPIV3_1.ReferenceObject
    >
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.description = this.input.description;

    let schema:
      | OpenAPIV3_1.SchemaObject
      | OpenAPIV3_1.ReferenceObject
      | undefined;
    if (isReferenceObject(this.input)) {
      schema = this.input;
    } else {
      if (this.input.schema != null) {
        schema = this.input.schema;
        this.required = this.input.required;
      } else {
        schema = {
          type: "string",
        };
        this.required = false;
      }
    }

    this.availability = new AvailabilityConverterNode({
      input: schema,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "availability",
    });
    this.schema = new SchemaConverterNode({
      input: schema,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "schema",
      seenSchemas: new Set(),
    });

    // TODO: support multiple examples
    const input = resolveParameterBaseReference(
      this.input,
      this.context.document
    );

    this.inputExample =
      input?.example ?? Object.values(input?.examples ?? {})[0];
  }

  convert():
    | FernRegistry.api.latest.TypeShape
    | FernRegistry.api.latest.TypeShape[]
    | undefined {
    return this.schema?.convert();
  }

  example(
    exampleArgs: BaseOpenApiV3_1ConverterExampleArgs
  ): unknown | undefined {
    return this.inputExample ?? this.schema?.example(exampleArgs);
  }
}
