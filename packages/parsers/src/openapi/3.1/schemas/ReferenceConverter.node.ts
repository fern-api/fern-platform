import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { isNonArraySchema } from "../guards/isNonArraySchema";
import { SchemaConverterNode } from "./SchemaConverter.node";
import { EnumConverterNode } from "./primitives/EnumConverter.node";

export class ReferenceConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  OpenAPIV3_1.ReferenceObject,
  FernRegistry.api.latest.TypeShape.Alias
> {
  schemaId: string | undefined;
  maybeEnumConverterNode: EnumConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<OpenAPIV3_1.ReferenceObject>,
    protected nullable: boolean | undefined
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.schemaId = getSchemaIdFromReference(this.input);

    const maybeEnum = resolveSchemaReference(this.input, this.context.document);
    if (maybeEnum?.enum != null && isNonArraySchema(maybeEnum)) {
      this.maybeEnumConverterNode = new EnumConverterNode({
        input: maybeEnum,
        context: this.context,
        accessPath: this.accessPath,
        pathId: this.schemaId ?? "",
        nullable: this.nullable,
      });
    }

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
        default:
          this.maybeEnumConverterNode?.default != null
            ? {
                type: "enum",
                value: this.maybeEnumConverterNode.default,
              }
            : undefined,
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
      nullable: this.nullable,
    }).example(includeOptionals);
  }
}
