import "server-only";

import {
  ApiDefinition,
  PruningNodeType,
  createEndpointContext,
  createWebSocketContext,
  createWebhookContext,
  prune,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";

import { EndpointContent } from "./endpoints/EndpointContent";
import { WebhookContent } from "./webhooks/WebhookContent";
import { WebSocketContent } from "./websockets/WebSocket";

export default async function ApiEndpointPage({
  loader,
  serialize,
  node,
  breadcrumb,
  bottomNavigation,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
  node: FernNavigation.NavigationNodeApiLeaf;
  action?: React.ReactNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  bottomNavigation?: React.ReactNode;
}) {
  const apiDefinition = await loader.getPrunedApi(
    node.apiDefinitionId,
    createPruneKey(node)
  );

  return (
    <ApiEndpointContent
      serialize={serialize}
      node={node}
      apiDefinition={apiDefinition}
      breadcrumb={breadcrumb}
      bottomNavigation={bottomNavigation}
    />
  );
}

async function ApiEndpointContent({
  serialize,
  node,
  action,
  apiDefinition,
  breadcrumb,
  bottomNavigation,
}: {
  serialize: MdxSerializer;
  node: FernNavigation.NavigationNodeApiLeaf;
  action?: React.ReactNode;
  apiDefinition: ApiDefinition;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  bottomNavigation?: React.ReactNode;
}) {
  switch (node.type) {
    case "endpoint": {
      const context = createEndpointContext(node, prune(apiDefinition, node));
      if (!context) {
        throw new Error(`Could not create endpoint context for ${node.id}`);
      }
      return (
        <EndpointContent
          serialize={serialize}
          breadcrumb={breadcrumb}
          context={context}
          action={action}
          showErrors
          bottomNavigation={bottomNavigation}
          showAuth
        />
      );
    }
    case "webSocket": {
      const context = createWebSocketContext(node, prune(apiDefinition, node));
      if (!context) {
        throw new Error(`Could not create web socket context for ${node.id}`);
      }
      return (
        <WebSocketContent
          serialize={serialize}
          breadcrumb={breadcrumb}
          context={context}
          action={action}
          bottomNavigation={bottomNavigation}
        />
      );
    }
    case "webhook": {
      const context = createWebhookContext(node, prune(apiDefinition, node));
      if (!context) {
        throw new Error(`Could not create web hook context for ${node.id}`);
      }
      return (
        <WebhookContent
          serialize={serialize}
          breadcrumb={breadcrumb}
          context={context}
          action={action}
          bottomNavigation={bottomNavigation}
        />
      );
    }
    default:
      return null;
  }
}

function createPruneKey(
  node: FernNavigation.NavigationNodeApiLeaf
): PruningNodeType {
  switch (node.type) {
    case "endpoint":
      return {
        type: "endpoint",
        endpointId: node.endpointId,
      };
    case "webSocket":
      return {
        type: "webSocket",
        webSocketId: node.webSocketId,
      };
    case "webhook":
      return {
        type: "webhook",
        webhookId: node.webhookId,
      };
    default:
      throw new Error(`Unknown node type: ${node}`);
  }
}
