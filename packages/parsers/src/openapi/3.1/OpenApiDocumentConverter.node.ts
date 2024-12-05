import { OpenAPIV3_1 } from "openapi-types";
import { v4 } from "uuid";
import { FernRegistry } from "../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../BaseOpenApiV3_1Converter.node";
import { basePathExtensionKey } from "../types/extension.types";
import { coalesceServers } from "../utils/3.1/coalesceServers";
import { XFernBasePathConverterNode } from "./extensions/XFernBasePathConverter.node";
import { PathsObjectConverterNode } from "./paths/PathsObjectConverter.node";
import { ServerObjectConverterNode } from "./paths/ServerObjectConverter.node";
import { ComponentsConverterNode } from "./schemas/ComponentsConverter.node";

export class OpenApiDocumentConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.Document,
    FernRegistry.api.latest.ApiDefinition
> {
    paths: PathsObjectConverterNode | undefined;
    // webhooks: WebhooksObjectConverterNode | undefined;
    components: ComponentsConverterNode | undefined;
    servers: ServerObjectConverterNode[] | undefined;
    basePath: XFernBasePathConverterNode | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.Document>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.servers = coalesceServers(this.servers, this.input.servers, this.context, this.accessPath);
        this.basePath = new XFernBasePathConverterNode({
            input: this.input,
            context: this.context,
            accessPath: this.accessPath,
            pathId: basePathExtensionKey,
        });

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
                this.basePath,
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

    convert(): FernRegistry.api.latest.ApiDefinition | undefined {
        const apiDefinitionId = v4();

        const endpoints = this.paths?.convert();
        // TODO: Implement webhooks
        // const webhooks = this.webhooks?.convert();
        const types = this.components?.convert();

        if (types == null) {
            return undefined;
        }

        return {
            id: FernRegistry.ApiDefinitionId(apiDefinitionId),
            endpoints: endpoints ?? {},
            // Websockets are not implemented in OAS, but are in AsyncAPI
            websockets: {} as Record<FernRegistry.WebSocketId, FernRegistry.api.latest.WebSocketChannel>,
            // TODO: implement webhooks
            // webhooks,
            webhooks: {} as Record<FernRegistry.WebhookId, FernRegistry.api.latest.WebhookDefinition>,
            types,
            // TODO: check if we ever have subpackages
            subpackages: {} as Record<FernRegistry.api.latest.SubpackageId, FernRegistry.api.latest.SubpackageMetadata>,
            // TODO: Implement auths
            auths: {} as Record<FernRegistry.api.latest.AuthSchemeId, FernRegistry.api.latest.AuthScheme>,
            // TODO: Implement globalHeaders
            globalHeaders: undefined,
        };
    }
}
