import { OpenAPIV3_1 } from "openapi-types";
import { v4 } from "uuid";

import { FernRegistry } from "../../client/generated";
import { computeSubpackages } from "../../utils/computeSubpackages";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../utils/3.1/coalesceServers";
import { SecurityRequirementObjectConverterNode } from "./auth/SecurityRequirementObjectConverter.node";
import { XFernBasePathConverterNode } from "./extensions/XFernBasePathConverter.node";
import { XFernGlobalHeadersConverterNode } from "./extensions/XFernGlobalHeadersConverter.node";
import { XFernGroupsConverterNode } from "./extensions/XFernGroupsConverter.node";
import { PathsObjectConverterNode } from "./paths/PathsObjectConverter.node";
import { ServerObjectConverterNode } from "./paths/ServerObjectConverter.node";
import { TagObjectConverterNode } from "./paths/TagsObjectConverter.node";
import { WebhooksObjectConverterNode } from "./paths/WebhooksObjectConverter.node";
import { ComponentsConverterNode } from "./schemas/ComponentsConverter.node";

export class OpenApiDocumentConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.Document,
  FernRegistry.api.latest.ApiDefinition
> {
  paths: PathsObjectConverterNode | undefined;
  webhooks: WebhooksObjectConverterNode | undefined;
  components: ComponentsConverterNode | undefined;
  servers: ServerObjectConverterNode[] | undefined;
  auth: SecurityRequirementObjectConverterNode | undefined;
  basePath: XFernBasePathConverterNode | undefined;
  fernGroups: XFernGroupsConverterNode | undefined;
  tags: TagObjectConverterNode[] | undefined;
  globalHeaders: XFernGlobalHeadersConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.Document>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.servers = coalesceServers(
      this.servers,
      this.input.servers,
      this.context,
      this.accessPath
    );

    if (this.input.security != null) {
      this.auth = new SecurityRequirementObjectConverterNode({
        input: this.input.security,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "security",
      });
    }

    this.basePath = new XFernBasePathConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: this.pathId,
    });

    if (this.input.tags != null) {
      this.tags = this.input.tags.map(
        (tag, index) =>
          new TagObjectConverterNode({
            input: tag,
            context: this.context,
            accessPath: this.accessPath,
            pathId: ["tags", `${index}`],
          })
      );
    }

    this.fernGroups = new XFernGroupsConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-groups",
    });

    if (this.input.paths == null && this.input.webhooks == null) {
      this.context.errors.warning({
        message: "Expected 'paths' or 'webhooks' property to be specified",
        path: this.accessPath,
      });
    }

    if (this.input.paths != null) {
      this.paths = new PathsObjectConverterNode(
        {
          input: this.input.paths,
          context: this.context,
          accessPath: this.accessPath,
          pathId: "paths",
        },
        this.servers,
        this.auth,
        this.basePath
      );
    }

    if (this.input.webhooks != null) {
      this.webhooks = new WebhooksObjectConverterNode(
        {
          input: this.input.webhooks,
          context: this.context,
          accessPath: this.accessPath,
          pathId: "webhooks",
        },
        this.basePath,
        this.servers,
        this.auth
      );
    }

    if (this.input.components != null) {
      this.components = new ComponentsConverterNode({
        input: this.input.components,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "components",
      });
    }

    this.globalHeaders = new XFernGlobalHeadersConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-global-headers",
    });
  }

  convert(): FernRegistry.api.latest.ApiDefinition | undefined {
    const apiDefinitionId = v4();

    const { webhookEndpoints, endpoints } = this.paths?.convert() ?? {};

    const subpackages: Record<
      FernRegistry.api.v1.SubpackageId,
      FernRegistry.api.latest.SubpackageMetadata
    > = computeSubpackages({ endpoints, webhookEndpoints });

    const types = {
      ...this.components?.convert(),
      ...this.context.generatedTypes,
    };

    return {
      id: FernRegistry.ApiDefinitionId(apiDefinitionId),
      endpoints: endpoints ?? {},
      // Websockets are not implemented in OAS, but are in AsyncAPI
      websockets: {},
      webhooks: {
        ...(this.webhooks?.convert() ?? {}),
        ...(webhookEndpoints ?? {}),
      },
      types:
        types != null
          ? Object.fromEntries(
              Object.entries(types).map(([id, type]) => [id, type])
            )
          : {},
      // This is not necessary and will be removed
      subpackages,
      auths: this.auth?.convert() ?? {},
      globalHeaders: this.globalHeaders?.convert(),
    };
  }
}
