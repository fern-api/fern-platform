import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/ui-core-utils";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveWebhookReference } from "../../utils/3.1/resolveWebhookReference";
import { SecurityRequirementObjectConverterNode } from "../auth/SecurityRequirementObjectConverter.node";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { isWebhookDefinition } from "../guards/isWebhookDefinition";
import { PathItemObjectConverterNode } from "./PathItemObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export declare namespace WebhooksObjectConverterNode {
  export interface ConstructorArgs
    extends BaseOpenApiV3_1ConverterNodeConstructorArgs<
      OpenAPIV3_1.Document["webhooks"]
    > {
    servers: ServerObjectConverterNode[] | undefined;
    globalAuth: SecurityRequirementObjectConverterNode | undefined;
    basePath: XFernBasePathConverterNode | undefined;
  }
}

export class WebhooksObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.Document["webhooks"],
  FernRegistry.api.latest.ApiDefinition["webhooks"]
> {
  webhooks: PathItemObjectConverterNode[] | undefined;

  constructor(args: WebhooksObjectConverterNode.ConstructorArgs) {
    super(args);
    this.safeParse(args);
  }

  parse({
    servers,
    globalAuth,
    basePath,
  }: WebhooksObjectConverterNode.ConstructorArgs): void {
    this.webhooks = Object.entries(this.input ?? {})
      .map(([operation, operationItem]) => {
        const resolvedOperationItem = resolveWebhookReference(
          operationItem,
          this.context.document
        );
        if (resolvedOperationItem == null) {
          return undefined;
        }
        return new PathItemObjectConverterNode({
          input: resolvedOperationItem,
          context: this.context,
          accessPath: this.accessPath,
          pathId: operation,
          servers,
          globalAuth,
          basePath,
          isWebhook: true,
        });
      })
      .filter(isNonNullish);
  }

  convert(): FernRegistry.api.latest.ApiDefinition["webhooks"] | undefined {
    return this.webhooks?.reduce<
      FernRegistry.api.latest.ApiDefinition["webhooks"]
    >((acc, webhook) => {
      webhook.convert()?.forEach((convertedWebhook) => {
        if (isWebhookDefinition(convertedWebhook)) {
          acc[FernRegistry.WebhookId(convertedWebhook.id)] = convertedWebhook;
        }
      });

      return acc;
    }, {});
  }
}
