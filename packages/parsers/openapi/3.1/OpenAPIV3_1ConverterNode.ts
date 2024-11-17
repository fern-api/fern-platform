import { ApiDefinition } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNode, BaseAPIConverterNodeContext } from "../../BaseAPIConverterNode";

export abstract class OpenAPIV3_1ConverterNode extends BaseAPIConverterNode<OpenAPIV3_1.Document, ApiDefinition.ApiDefinition> {
    constructor(
        protected readonly input: OpenAPIV3_1.Document,
        protected readonly context: BaseAPIConverterNodeContext,
    ) {
        super(input, context);
    }

    /**
     * @returns The converted API definition in the target output format
     */
    public convert(): ApiDefinition.ApiDefinition {
        return {
            id: ApiDefinition.ApiDefinitionId(Buffer.from(JSON.stringify(this.input)).toString("base64")),
            globalHeaders: [],
            auths: {},
            endpoints: {},
            websockets: {},
            webhooks: {},
            types: {},
            subpackages: {},
        };
    }
}
