import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { v4 } from "uuid";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../utils/3.1/coalesceServers";
import { PathsObjectConverterNode } from "./paths/PathsObjectConverter.node";
import { ServerObjectConverterNode } from "./paths/ServerObjectConverter.node";
import { ComponentsConverterNode } from "./schemas/ComponentsConverter.node";

export class OpenApiDocumentConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.Document,
    FdrAPI.api.latest.ApiDefinition
> {
    paths: PathsObjectConverterNode | undefined;
    // webhooks: WebhooksObjectConverterNode | undefined;
    components: ComponentsConverterNode | undefined;
    servers: ServerObjectConverterNode[] | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.Document>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.servers = coalesceServers(this.servers, this.input.servers, this.context, this.accessPath);

        if (this.input.paths == null) {
            this.context.errors.warning({
                message: "Expected 'paths' property to be specified",
                path: this.accessPath,
            });
        } else {
            this.paths = new PathsObjectConverterNode(
                {
                    input: this.input.paths,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "paths",
                },
                this.servers,
            );
        }

        // TODO: Webhook disambiguation

        if (this.input.components == null) {
            this.context.errors.warning({
                message: "Expected 'components' property to be specified",
                path: this.accessPath,
            });
        } else {
            this.components = new ComponentsConverterNode({
                input: this.input.components,
                context: this.context,
                accessPath: this.accessPath,
                pathId: "components",
            });
        }
    }

    convert(): FdrAPI.api.latest.ApiDefinition | undefined {
        const apiDefinitionId = v4();

        const endpoints = this.paths?.convert();
        // TODO: Implement webhooks
        // const webhooks = this.webhooks?.convert();
        const types = this.components?.convert();

        if (types == null) {
            return undefined;
        }

        return {
            id: FdrAPI.ApiDefinitionId(apiDefinitionId),
            endpoints: endpoints ?? {},
            // Websockets are not implemented in OAS, but are in AsyncAPI
            websockets: {} as Record<FdrAPI.WebSocketId, FdrAPI.api.latest.WebSocketChannel>,
            // TODO: implement webhooks
            // webhooks,
            webhooks: {} as Record<FdrAPI.WebhookId, FdrAPI.api.latest.WebhookDefinition>,
            types,
            // TODO: check if we ever have subpackages
            subpackages: {} as Record<FdrAPI.api.latest.SubpackageId, FdrAPI.api.latest.SubpackageMetadata>,
            // TODO: Implement auths
            auths: {} as Record<FdrAPI.api.latest.AuthSchemeId, FdrAPI.api.latest.AuthScheme>,
            // TODO: Implement globalHeaders
            globalHeaders: undefined,
        };
    }
}
