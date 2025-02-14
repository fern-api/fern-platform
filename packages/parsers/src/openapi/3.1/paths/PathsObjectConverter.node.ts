import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { SecurityRequirementObjectConverterNode } from "../auth/SecurityRequirementObjectConverter.node";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { isWebhookDefinition } from "../guards/isWebhookDefinition";
import { PathItemObjectConverterNode } from "./PathItemObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export declare namespace PathsObjectConverterNode {
  export interface Output {
    endpoints: Record<
      FernRegistry.EndpointId,
      FernRegistry.api.latest.EndpointDefinition
    >;
    webhookEndpoints: Record<
      FernRegistry.WebhookId,
      FernRegistry.api.latest.WebhookDefinition
    >;
  }

  export interface ConstructorArgs
    extends BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.PathsObject> {
    servers: ServerObjectConverterNode[] | undefined;
    globalAuth: SecurityRequirementObjectConverterNode | undefined;
    basePath: XFernBasePathConverterNode | undefined;
  }
}

export class PathsObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.PathsObject,
  PathsObjectConverterNode.Output
> {
  paths: PathItemObjectConverterNode[] | undefined;

  constructor(args: PathsObjectConverterNode.ConstructorArgs) {
    super(args);
    this.safeParse(args);
  }

  parse({
    servers,
    globalAuth,
    basePath,
  }: PathsObjectConverterNode.ConstructorArgs): void {
    this.paths = Object.entries(this.input)
      .map(([path, pathItem]) => {
        if (pathItem == null) {
          return undefined;
        }
        return new PathItemObjectConverterNode({
          input: pathItem,
          context: this.context,
          accessPath: this.accessPath,
          pathId: path,
          servers: coalesceServers(
            servers,
            pathItem.servers,
            this.context,
            this.accessPath
          ),
          globalAuth,
          basePath,
          isWebhook: undefined,
        });
      })
      .filter(isNonNullish);
  }

  convert(): PathsObjectConverterNode.Output | undefined {
    if (this.paths == null) {
      return undefined;
    }

    const endpoints: Record<
      FernRegistry.EndpointId,
      FernRegistry.api.latest.EndpointDefinition
    > = {};
    const webhookEndpoints: Record<
      FernRegistry.WebhookId,
      FernRegistry.api.latest.WebhookDefinition
    > = {};

    this.paths.forEach((pathItem) => {
      const pathItemDefinitions = pathItem.convert();
      if (pathItemDefinitions == null) {
        return undefined;
      }

      pathItemDefinitions.forEach((definition) => {
        if (isWebhookDefinition(definition)) {
          webhookEndpoints[FernRegistry.WebhookId(definition.id)] = definition;
        } else {
          endpoints[FernRegistry.EndpointId(definition.id)] = definition;
        }
      });
    });

    return {
      endpoints,
      webhookEndpoints,
    };
  }
}
