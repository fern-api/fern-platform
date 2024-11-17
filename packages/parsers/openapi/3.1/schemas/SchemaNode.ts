import { ApiDefinition } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNode, BaseAPIConverterNodeContext } from "../../../BaseAPIConverterNode";

export abstract class SchemaNode extends BaseAPIConverterNode<OpenAPIV3_1.SchemaObject, ApiDefinition.TypeShape> {
    constructor(
        protected readonly input: ObjectNode.Input,
        protected readonly context: BaseAPIConverterNodeContext,
    ) {
        super(input, context);
    }

    /**
     * @returns The converted API definition in the target output format
     */
    public convert(): ApiDefinition.ObjectType {}
}
