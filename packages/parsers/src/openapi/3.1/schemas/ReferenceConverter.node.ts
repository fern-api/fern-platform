import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class ReferenceConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  OpenAPIV3_1.ReferenceObject,
  FernRegistry.api.latest.TypeShape.Alias
> {
  schemaId: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<OpenAPIV3_1.ReferenceObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.schemaId = getSchemaIdFromReference(this.input);

    if (this.schemaId == null) {
      this.context.errors.error({
        message: `Unprocessable reference: ${this.input.$ref}`,
        path: this.accessPath,
      });
    }
  }

  convert(): FernRegistry.api.latest.TypeShape.Alias | undefined {
    if (this.schemaId == null) {
      return undefined;
    }

    return {
      type: "alias",
      value: {
        type: "id",
        id: FernRegistry.TypeId(this.schemaId),
        default: resolveSchemaReference(this.input, this.context.document)
          ?.default,
      },
    };
  }

  example(includeOptionals: boolean): unknown | undefined {
    const schema = resolveSchemaReference(this.input, this.context.document);
    if (schema == null) {
      return undefined;
    }

    return new SchemaConverterNode({
      input: schema,
      context: this.context,
      accessPath: this.accessPath,
      pathId: this.schemaId ?? "",
      seenSchemas: this.seenSchemas,
    }).example(includeOptionals);
  }
}
