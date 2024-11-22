import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { isReferenceObject } from "../guards/isReferenceObject";
import { ArrayConverterNode } from "./ArrayConverter.node";
import { BooleanConverterNode } from "./BooleanConverter.node";
import { EnumConverterNode } from "./EnumConverter.node";
import { IntegerConverterNode } from "./IntegerConverter.node";
import { NullConverterNode } from "./NullConverter.node";
import { NumberConverterNode } from "./NumberConverter.node";
import { ObjectConverterNode } from "./ObjectConverter.node";
import { OneOfConverterNode } from "./OneOfConverter.node";
import { ReferenceConverterNode } from "./ReferenceConverter.node";
import { StringConverterNode } from "./StringConverter.node";

export type PrimitiveType =
    | NumberConverterNode.Input
    | IntegerConverterNode.Input
    | BooleanConverterNode.Input
    | StringConverterNode.Input;

export class SchemaConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    FdrAPI.api.latest.TypeShape | undefined
> {
    typeShapeNode: BaseOpenApiV3_1Node<unknown, FdrAPI.api.latest.TypeShape | undefined> | undefined;

    description: string | undefined;
    name: string | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>) {
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
                if (this.input.type === "object" && this.input.oneOf != null) {
                    this.typeShapeNode = new OneOfConverterNode({
                        input: this.input as OneOfConverterNode.Input,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: this.pathId,
                    });
                } else if (this.input.type !== "array" && this.input.enum != null) {
                    this.typeShapeNode = new EnumConverterNode({
                        input: this.input,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: this.pathId,
                    });
                } else {
                    switch (this.input.type) {
                        case "object":
                            this.typeShapeNode = new ObjectConverterNode({
                                input: this.input as ObjectConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        case "array":
                            this.typeShapeNode = new ArrayConverterNode({
                                input: this.input as ArrayConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        case "boolean":
                            this.typeShapeNode = new BooleanConverterNode({
                                input: this.input as BooleanConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        case "integer":
                            this.typeShapeNode = new IntegerConverterNode({
                                input: this.input as IntegerConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        case "number":
                            this.typeShapeNode = new NumberConverterNode({
                                input: this.input as NumberConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        case "string":
                            this.typeShapeNode = new StringConverterNode({
                                input: this.input as StringConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        case "null":
                            this.typeShapeNode = new NullConverterNode({
                                input: this.input as NullConverterNode.Input,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: this.pathId,
                            });
                            break;
                        default:
                            new UnreachableCaseError(this.input.type);
                            break;
                    }
                }
            }
        }

        this.description = this.input.description;

        if (this.typeShapeNode == null) {
            this.context.errors.error({
                message: "No type shape node found",
                path: this.accessPath,
            });
        }
    }

    convert(): FdrAPI.api.latest.TypeShape | undefined {
        return this.typeShapeNode?.convert();
    }
}
