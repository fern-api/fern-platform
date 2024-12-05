import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";
import { isArraySchema } from "../guards/isArraySchema";
import { isBooleanSchema } from "../guards/isBooleanSchema";
import { isIntegerSchema } from "../guards/isIntegerSchema";
import { isMixedSchema } from "../guards/isMixedSchema";
import { isNonArraySchema } from "../guards/isNonArraySchema";
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
import { ReferenceConverterNode } from "./ReferenceConverter.node";
import { BooleanConverterNode } from "./primitives/BooleanConverter.node";
import { EnumConverterNode } from "./primitives/EnumConverter.node";
import { IntegerConverterNode } from "./primitives/IntegerConverter.node";
import { NullConverterNode } from "./primitives/NullConverter.node";
import { NumberConverterNode } from "./primitives/NumberConverter.node";
import { StringConverterNode } from "./primitives/StringConverter.node";

export type PrimitiveType =
    | NumberConverterNode.Input
    | IntegerConverterNode.Input
    | BooleanConverterNode.Input
    | StringConverterNode.Input;

export class SchemaConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    FernRegistry.api.latest.TypeShape | undefined
> {
    typeShapeNode: BaseOpenApiV3_1ConverterNode<unknown, FernRegistry.api.latest.TypeShape | undefined> | undefined;

    description: string | undefined;
    name: string | undefined;
    availability: AvailabilityConverterNode | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>,
    ) {
        super(args);
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

        // Check if the input is a reference object
        if (isReferenceObject(this.input)) {
            this.typeShapeNode = new ReferenceConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
            });
        } else {
            // If the object is not a reference object, then it is a schema object, gather all appropriate variables
            this.name = this.input.title;

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
                });
            } else if (isNonArraySchema(this.input) && this.input.oneOf != null) {
                this.typeShapeNode = new OneOfConverterNode({
                    input: this.input,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: this.pathId,
                });
                // here, isObjectSchema also supports null type
            } else if (isObjectSchema(this.input) && this.input.allOf != null) {
                // Object Converter Node encapsulates allOf logic, so we use that
                this.typeShapeNode = new ObjectConverterNode({
                    input: this.input,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: this.pathId,
                });
            } else if (isNonArraySchema(this.input) && this.input.enum != null) {
                this.typeShapeNode = new EnumConverterNode({
                    input: this.input,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: this.pathId,
                });
            }

            // We assume that if one of is defined, it is an object node
            if (typeof this.input.type === "string") {
                switch (this.input.type) {
                    case "object":
                        if (isObjectSchema(this.input)) {
                            this.typeShapeNode = new ObjectConverterNode({
                                input: this.input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
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
            } else if (this.input.properties != null) {
                this.typeShapeNode = new ObjectConverterNode({
                    input: this.input as ObjectConverterNode.Input,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: this.pathId,
                });
            }
        }

        if (this.typeShapeNode == null) {
            this.context.errors.error({
                message: "Expected type declaration. Received: null",
                path: this.accessPath,
            });
        }
    }

    convert(): FernRegistry.api.latest.TypeShape | undefined {
        return this.typeShapeNode?.convert();
    }
}
