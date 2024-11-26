import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { isArraySchema } from "../guards/isArraySchema";
import { isBooleanSchema } from "../guards/isBooleanSchema";
import { isIntegerSchema } from "../guards/isIntegerSchema";
import { isNullSchema } from "../guards/isNullSchema";
import { isNumberSchema } from "../guards/isNumberSchema";
import { isObjectSchema } from "../guards/isObjectSchema";
import { isReferenceObject } from "../guards/isReferenceObject";
import { isStringSchema } from "../guards/isStringSchema";
import { ArrayConverterNode } from "./ArrayConverter.node";
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
    FdrAPI.api.latest.TypeShape | undefined
> {
    typeShapeNode: BaseOpenApiV3_1ConverterNode<unknown, FdrAPI.api.latest.TypeShape | undefined> | undefined;

    description: string | undefined;
    name: string | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>,
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
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

            // We assume that if one of is defined, it is an object node
            if (typeof this.input.type === "string") {
                if (isObjectSchema(this.input) && this.input.oneOf != null) {
                    this.typeShapeNode = new OneOfConverterNode({
                        input: this.input,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: this.pathId,
                    });
                } else if (!isArraySchema(this.input) && this.input.enum != null) {
                    this.typeShapeNode = new EnumConverterNode({
                        input: this.input,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: this.pathId,
                    });
                } else {
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
                                    input: this.input as IntegerConverterNode.Input,
                                    context: this.context,
                                    accessPath: this.accessPath,
                                    pathId: this.pathId,
                                });
                            }
                            break;
                        case "number":
                            if (isNumberSchema(this.input)) {
                                this.typeShapeNode = new NumberConverterNode({
                                    input: this.input as NumberConverterNode.Input,
                                    context: this.context,
                                    accessPath: this.accessPath,
                                    pathId: this.pathId,
                                });
                            }
                            break;
                        case "string":
                            if (isStringSchema(this.input)) {
                                this.typeShapeNode = new StringConverterNode({
                                    input: this.input as StringConverterNode.Input,
                                    context: this.context,
                                    accessPath: this.accessPath,
                                    pathId: this.pathId,
                                });
                            }
                            break;
                        case "null":
                            if (isNullSchema(this.input)) {
                                this.typeShapeNode = new NullConverterNode({
                                    input: this.input as NullConverterNode.Input,
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

        this.description = this.input.description;

        if (this.typeShapeNode == null) {
            this.context.errors.error({
                message: "Expected type declaration. Received: null",
                path: this.accessPath,
            });
        }
    }

    convert(): FdrAPI.api.latest.TypeShape | undefined {
        return this.typeShapeNode?.convert();
    }
}
