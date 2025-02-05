import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNodeWithExample,
  BaseOpenApiV3_1ConverterNodeWithTracking,
  BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { wrapNullable } from "../../utils/wrapNullable";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";
import { isArraySchema } from "../guards/isArraySchema";
import { isBooleanSchema } from "../guards/isBooleanSchema";
import { isIntegerSchema } from "../guards/isIntegerSchema";
import { isMixedSchema } from "../guards/isMixedSchema";
import { isNonArraySchema } from "../guards/isNonArraySchema";
import { isNullableSchema } from "../guards/isNullableSchema";
import { isNullSchema } from "../guards/isNullSchema";
import { isNumberSchema } from "../guards/isNumberSchema";
import { isObjectSchema } from "../guards/isObjectSchema";
import { isReferenceObject } from "../guards/isReferenceObject";
import { isStringSchema } from "../guards/isStringSchema";
import { ArrayConverterNode } from "./ArrayConverter.node";
import { ConstConverterNode } from "./ConstConverter.node";
import { MixedSchemaConverterNode } from "./MixedSchemaConverter.node";
import { ObjectConverterNode } from "./ObjectConverter.node";
import { OneOfConverterNode } from "./OneOfConverter.node";
import { BooleanConverterNode } from "./primitives/BooleanConverter.node";
import { EnumConverterNode } from "./primitives/EnumConverter.node";
import { IntegerConverterNode } from "./primitives/IntegerConverter.node";
import { NullConverterNode } from "./primitives/NullConverter.node";
import { NumberConverterNode } from "./primitives/NumberConverter.node";
import { StringConverterNode } from "./primitives/StringConverter.node";
import { UnknownConverterNode } from "./primitives/UnknownConverter.node";
import { ReferenceConverterNode } from "./ReferenceConverter.node";

export type PrimitiveType =
  | NumberConverterNode.Input
  | IntegerConverterNode.Input
  | BooleanConverterNode.Input
  | StringConverterNode.Input;

export class SchemaConverterNode extends BaseOpenApiV3_1ConverterNodeWithTracking<
  OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  | FernRegistry.api.latest.TypeShape
  | FernRegistry.api.latest.TypeShape[]
  | undefined
> {
  typeShapeNode:
    | BaseOpenApiV3_1ConverterNodeWithExample<
        unknown,
        | FernRegistry.api.latest.TypeShape
        | FernRegistry.api.latest.TypeShape[]
        | undefined
      >
    | undefined;
  description: string | undefined;
  name: string | undefined;
  examples: unknown | undefined;
  availability: AvailabilityConverterNode | undefined;
  nullable?: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<
      OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    > & { nullable?: boolean | undefined }
  ) {
    super(args);
    this.nullable = args.nullable;
    this.safeParse();
  }

  parse(): void {
    this.description = this.input.description;
    this.availability = new AvailabilityConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-availability",
    });
    // check if nullable is set. If nullable is false, we will set it, otherwise we will ignore it
    if (isNonArraySchema(this.input) && isNullableSchema(this.input)) {
      this.nullable =
        this.input.nullable != null ? this.input.nullable : this.nullable;
    }

    // Check if the input is a reference object
    if (isReferenceObject(this.input)) {
      const refPath = getSchemaIdFromReference(this.input);
      if (refPath == null) {
        this.context.errors.error({
          message: "Reference object does not have a valid schema ID",
          path: this.accessPath,
        });
        return;
      }
      if (this.seenSchemas.has(refPath)) {
        this.context.errors.warning({
          message: "Circular or deeply nested schema found, terminating",
          path: this.accessPath,
        });
        return;
      }
      this.seenSchemas.add(refPath);

      this.typeShapeNode = new ReferenceConverterNode(
        {
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: refPath,
          seenSchemas: this.seenSchemas,
        },
        this.nullable
      );
    } else {
      // If the object is not a reference object, then it is a schema object, gather all appropriate variables
      this.name = this.input.title;
      this.examples = this.input.example;
      if (this.input.const != null) {
        this.typeShapeNode = new ConstConverterNode({
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
        });
      } else if (isMixedSchema(this.input)) {
        this.typeShapeNode = new MixedSchemaConverterNode({
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
          seenSchemas: this.seenSchemas,
        });
      } else if (
        isNonArraySchema(this.input) &&
        (this.input.oneOf != null || this.input.anyOf != null)
      ) {
        this.typeShapeNode = new OneOfConverterNode({
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
          seenSchemas: this.seenSchemas,
        });
        // here, isObjectSchema also supports null type
      } else if (isObjectSchema(this.input) && this.input.allOf != null) {
        // Object Converter Node encapsulates allOf logic, so we use that
        this.typeShapeNode = new ObjectConverterNode({
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
          seenSchemas: this.seenSchemas,
        });
      } else if (isNonArraySchema(this.input) && this.input.enum != null) {
        this.typeShapeNode = new EnumConverterNode({
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
          nullable: this.nullable,
        });
      }
      // We assume that if one of is defined, it is an object node
      else if (typeof this.input.type === "string") {
        switch (this.input.type) {
          case "object":
            if (isObjectSchema(this.input)) {
              this.typeShapeNode = new ObjectConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
                seenSchemas: this.seenSchemas,
              });
            }
            break;
          case "array":
            if (isArraySchema(this.input)) {
              this.typeShapeNode = new ArrayConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
                seenSchemas: this.seenSchemas,
              });
            }
            break;
          case "boolean":
            if (isBooleanSchema(this.input)) {
              this.typeShapeNode = new BooleanConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
                nullable: this.nullable,
              });
            }
            break;
          case "integer":
            if (isIntegerSchema(this.input)) {
              this.typeShapeNode = new IntegerConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
                nullable: this.nullable,
              });
            }
            break;
          case "number":
            if (isNumberSchema(this.input)) {
              this.typeShapeNode = new NumberConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
                nullable: this.nullable,
              });
            }
            break;
          case "string":
            if (isStringSchema(this.input)) {
              this.typeShapeNode = new StringConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
                nullable: this.nullable,
              });
            }
            break;
          case "null":
            if (isNullSchema(this.input)) {
              this.typeShapeNode = new NullConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
              });
            }
            break;
          default:
            new UnreachableCaseError(this.input.type);
            break;
        }
      } else if (
        Array.isArray(this.input.type) &&
        this.input.type.includes("null") &&
        this.input.type.length === 2
      ) {
        const newType = this.input.type.filter((t) => t !== "null")[0];

        if (newType !== "array") {
          this.typeShapeNode = new SchemaConverterNode({
            input: {
              ...this.input,
              type: newType,
            },
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
            seenSchemas: this.seenSchemas,
            nullable: true,
          });
        }
      } else if (this.input.properties != null) {
        this.typeShapeNode = new ObjectConverterNode({
          input: { ...this.input, type: "object" },
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
          seenSchemas: this.seenSchemas,
        });
      }
    }

    if (this.typeShapeNode == null) {
      this.typeShapeNode = new UnknownConverterNode({
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: this.pathId,
      });
      this.context.errors.error({
        message: "Expected type declaration. Received: null",
        path: this.accessPath,
      });
    }
  }

  convert():
    | FernRegistry.api.latest.TypeShape
    | FernRegistry.api.latest.TypeShape[]
    | undefined {
    const maybeShapes = this.typeShapeNode?.convert();
    if (maybeShapes == null) {
      return undefined;
    }
    const mappedShapes = maybeSingleValueToArray(maybeShapes)
      ?.map((shape) => (this.nullable ? wrapNullable(shape) : shape))
      .filter(isNonNullish);

    return Array.isArray(maybeShapes) && maybeShapes.length > 1
      ? mappedShapes
      : mappedShapes?.[0];
  }

  example(includeOptionals: boolean): unknown | undefined {
    return this.availability?.availability !== "deprecated"
      ? this.typeShapeNode?.example(includeOptionals)
      : undefined;
  }
}
