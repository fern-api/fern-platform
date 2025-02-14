import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterExampleArgs,
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { resolveSchemaReference } from "../../utils/3.1/resolveSchemaReference";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";
import { isNonArraySchema } from "../guards/isNonArraySchema";
import { SchemaConverterNode } from "./SchemaConverter.node";
import { EnumConverterNode } from "./primitives/EnumConverter.node";

export class ReferenceConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  OpenAPIV3_1.ReferenceObject,
  FernRegistry.api.latest.TypeShape.Alias
> {
  description: string | undefined;
  availability: AvailabilityConverterNode | undefined;

  schemaId: string | undefined;
  maybeEnumConverterNode: EnumConverterNode | undefined;
  nullable: boolean | undefined;
  schemaName: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<OpenAPIV3_1.ReferenceObject> & {
      nullable: boolean | undefined;
      schemaName: string | undefined;
      description: string | undefined;
      availability: AvailabilityConverterNode | undefined;
    }
  ) {
    super(args);
    this.nullable = args.nullable;
    this.schemaName = args.schemaName;
    this.description = args.description;
    this.availability = args.availability;
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

  example(
    exampleArgs: BaseOpenApiV3_1ConverterExampleArgs
  ): unknown | undefined {
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
      schemaName: this.schemaName,
    }).example(exampleArgs);
  }
}
