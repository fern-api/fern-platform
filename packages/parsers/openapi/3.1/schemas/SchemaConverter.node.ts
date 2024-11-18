import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { BooleanConverterNode } from "./BooleanConverter.node";
import { IntegerConverterNode } from "./IntegerConverter.node";
import { NumberConverterNode } from "./NumberConverter.node";
import { ObjectConverterNode } from "./ObjectConverter.node";
import { StringConverterNode } from "./StringConverter.node";

type PrimitiveType =
    | NumberConverterNode.Input
    | IntegerConverterNode.Input
    | BooleanConverterNode.Input
    | StringConverterNode.Input;

export class SchemaConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.SchemaObject,
    FdrAPI.api.latest.TypeShape | undefined
> {
    typeShapeNode: { convert: () => FdrAPI.api.latest.TypeShape | undefined } | undefined;

    convertPrimitive(input: BaseOpenApiV3_1Node<PrimitiveType, FdrAPI.api.latest.PrimitiveType | undefined>): {
        convert: () => FdrAPI.api.latest.TypeShape.Alias | undefined;
    } {
        return {
            convert: () => {
                const convertedShape = input.convert();
                if (convertedShape == null) {
                    return undefined;
                }
                return {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: convertedShape,
                    },
                };
            },
        };
    }

    constructor(
        input: OpenAPIV3_1.SchemaObject,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        // if (input.anyOf != null) {
        //     this.typeNode = new AnyOfConverterNode(input, this.context, this.accessPath);
        //     break;
        // } else if (input.oneOf != null) {
        //     this.typeNode = new OneOfConverterNode(input, this.context, this.accessPath);
        //     break;
        // } else if (input.allOf != null) {
        //     this.typeNode = new AllOfConverterNode(input, this.context, this.accessPath);
        //     break;
        // }

        if (input != null) {
            if (typeof input.type === "string") {
                switch (input.type) {
                    case "object":
                        this.typeShapeNode = new ObjectConverterNode(
                            input as ObjectConverterNode.Input,
                            this.context,
                            this.accessPath,
                            pathId,
                        );
                        break;
                    // case "array":
                    //     this.typeNode = new ArrayConverterNode(input, this.context, this.accessPath, pathId);
                    //     break;
                    case "boolean":
                        this.typeShapeNode = this.convertPrimitive(
                            new BooleanConverterNode(
                                input as BooleanConverterNode.Input,
                                this.context,
                                this.accessPath,
                                pathId,
                            ),
                        );
                        break;
                    case "integer":
                        this.typeShapeNode = this.convertPrimitive(
                            new IntegerConverterNode(
                                input as IntegerConverterNode.Input,
                                this.context,
                                this.accessPath,
                                pathId,
                            ),
                        );
                        break;
                    case "number":
                        this.typeShapeNode = this.convertPrimitive(
                            new NumberConverterNode(
                                input as NumberConverterNode.Input,
                                this.context,
                                this.accessPath,
                                pathId,
                            ),
                        );
                        break;
                    case "string":
                        this.typeShapeNode = this.convertPrimitive(
                            new StringConverterNode(
                                input as StringConverterNode.Input,
                                this.context,
                                this.accessPath,
                                pathId,
                            ),
                        );
                        break;
                    // case "null":
                    //     this.typeNode = new NullConverterNode(input, this.context, this.accessPath, pathId);
                    //     break;
                    default:
                        // new UnreachableCaseError(input);
                        break;
                }
            }
        }
    }

    convert(): FdrAPI.api.latest.TypeShape | undefined {
        return this.typeShapeNode?.convert();
    }
}
