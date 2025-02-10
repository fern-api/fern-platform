import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";

import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveWebhookReference } from "../../utils/3.1/resolveWebhookReference";
import { SecurityRequirementObjectConverterNode } from "../auth/SecurityRequirementObjectConverter.node";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { PathItemObjectConverterNode } from "./PathItemObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export class WebhooksObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.Document["webhooks"],
  FernRegistry.api.latest.ApiDefinition["webhooks"]
> {
  webhooks: Record<string, PathItemObjectConverterNode> | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
      OpenAPIV3_1.Document["webhooks"]
    >,
    protected readonly basePath: XFernBasePathConverterNode | undefined,
    protected readonly servers: ServerObjectConverterNode[] | undefined,
    protected readonly globalAuth:
      | SecurityRequirementObjectConverterNode
      | undefined
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.webhooks = Object.fromEntries(
      Object.entries(this.input ?? {})
        .map(([operation, operationItem]) => {
          const resolvedOperationItem = resolveWebhookReference(
            operationItem,
            this.context.document
          );
          if (resolvedOperationItem == null) {
            return undefined;
          }
          return [
            operation,
            new PathItemObjectConverterNode(
              {
                input: resolvedOperationItem,
                context: this.context,
                accessPath: this.accessPath,
                pathId: operation,
              },
              this.servers,
              this.globalAuth,
              this.basePath,
              true
            ),
          ];
        })
        .filter(isNonNullish)
    );
  }

  convert(): FernRegistry.api.latest.ApiDefinition["webhooks"] | undefined {
    return {};
  }
}
