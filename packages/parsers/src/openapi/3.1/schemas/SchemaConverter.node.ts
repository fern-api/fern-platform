import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { BaseOpenApiV3_1ConverterNodeContext, BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
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
    anyOfNode: BaseOpenApiV3_1Node<unknown, FdrAPI.api.latest.TypeShape | undefined>[] | undefined;
    allOfNode: BaseOpenApiV3_1Node<unknown, FdrAPI.api.latest.TypeShape | undefined>[] | undefined;
    oneOfNode: BaseOpenApiV3_1Node<unknown, FdrAPI.api.latest.TypeShape | undefined>[] | undefined;
    enumNode: BaseOpenApiV3_1Node<unknown, FdrAPI.api.latest.TypeShape | undefined>[] | undefined;
    notNode: BaseOpenApiV3_1Node<unknown, FdrAPI.api.latest.TypeShape | undefined>[] | undefined;

    description: string | undefined;
    name: string | undefined;

    constructor(
        input: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
        context: BaseOpenApiV3_1ConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        // Check if the input is a reference object
        if (isReferenceObject(input)) {
            this.typeShapeNode = new ReferenceConverterNode(input, context, accessPath, pathId);
        } else {
            // If the object is not a reference object, then it is a schema object, gather all appropriate variables
            this.name = input.title;

            // We assume that if one of is defined, it is an object node
            if (typeof input.type === "string") {
                if (input.type === "object" && input.oneOf != null) {
                    this.typeShapeNode = new OneOfConverterNode(
                        input as OneOfConverterNode.Input,
                        context,
                        accessPath,
                        pathId,
                    );
                } else if (input.type === "object" && input.enum != null) {
                    this.typeShapeNode = new EnumConverterNode(
                        input as EnumConverterNode.Input,
                        context,
                        accessPath,
                        pathId,
                    );
                } else {
                    switch (input.type) {
                        case "object":
                            this.typeShapeNode = new ObjectConverterNode(
                                input as ObjectConverterNode.Input,
                                context,
                                accessPath,
                                pathId,
                            );
                            break;
                        case "array":
                            this.typeShapeNode = new ArrayConverterNode(input, context, accessPath, pathId);
                            break;
                        case "boolean":
                            this.typeShapeNode = new BooleanConverterNode(
                                input as BooleanConverterNode.Input,
                                context,
                                accessPath,
                                pathId,
                            );
                            break;
                        case "integer":
                            this.typeShapeNode = new IntegerConverterNode(
                                input as IntegerConverterNode.Input,
                                context,
                                accessPath,
                                pathId,
                            );
                            break;
                        case "number":
                            this.typeShapeNode = new NumberConverterNode(
                                input as NumberConverterNode.Input,
                                context,
                                accessPath,
                                pathId,
                            );
                            break;
                        case "string":
                            this.typeShapeNode = new StringConverterNode(
                                input as StringConverterNode.Input,
                                context,
                                accessPath,
                                pathId,
                            );
                            break;
                        case "null":
                            this.typeShapeNode = new NullConverterNode(input, context, accessPath, pathId);
                            break;
                        default:
                            new UnreachableCaseError(input.type);
                            break;
                    }
                }
            }
        }

        this.description = input.description;
    }

    convert(): FdrAPI.api.latest.TypeShape | undefined {
        return this.typeShapeNode?.convert();
    }
}
