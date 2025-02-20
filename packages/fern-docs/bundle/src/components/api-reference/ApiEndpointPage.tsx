import "server-only";

import {
  ApiDefinition,
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
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  bottomNavigation?: React.ReactNode;
}) {
  const apiDefinition = await loader.getApi(node.apiDefinitionId);

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
  apiDefinition,
  breadcrumb,
  bottomNavigation,
}: {
  serialize: MdxSerializer;
  node: FernNavigation.NavigationNodeApiLeaf;
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
        />
      );
    }
    default:
      return null;
  }
}
