import {
  ApiDefinition,
  createEndpointContext,
  createWebSocketContext,
  createWebhookContext,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { createCachedDocsLoader } from "@/server/docs-loader";

import { ApiPageLayout } from "./api-page-layout";
import { EndpointContent } from "./endpoints/EndpointContent";
import { WebhookContent } from "./webhooks/WebhookContent";
import { WebSocketContent } from "./websockets/WebSocket";

export default async function ApiEndpointPage({
  domain,
  node,
  breadcrumb,
}: {
  domain: string;
  node: FernNavigation.NavigationNodeApiLeaf;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const loader = await createCachedDocsLoader(domain);
  const apiDefinition = await loader.getApi(node.apiDefinitionId);

  return (
    <ApiPageLayout>
      <ApiEndpointContent
        domain={domain}
        node={node}
        apiDefinition={apiDefinition}
        breadcrumb={breadcrumb}
      />
    </ApiPageLayout>
  );
}

function ApiEndpointContent({
  domain,
  node,
  apiDefinition,
  breadcrumb,
}: {
  domain: string;
  node: FernNavigation.NavigationNodeApiLeaf;
  apiDefinition: ApiDefinition;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  switch (node.type) {
    case "endpoint": {
      const context = createEndpointContext(node, apiDefinition);
      if (!context) {
        throw new Error(
          `[${domain}] Could not create endpoint context for ${node.id}`
        );
      }
      return (
        <EndpointContent
          domain={domain}
          breadcrumb={breadcrumb}
          context={context}
          showErrors
        />
      );
    }
    case "webSocket": {
      const context = createWebSocketContext(node, apiDefinition);
      if (!context) {
        throw new Error(
          `[${domain}] Could not create web socket context for ${node.id}`
        );
      }
      return (
        <WebSocketContent
          domain={domain}
          breadcrumb={breadcrumb}
          context={context}
        />
      );
    }
    case "webhook": {
      const context = createWebhookContext(node, apiDefinition);
      if (!context) {
        throw new Error(
          `[${domain}] Could not create web hook context for ${node.id}`
        );
      }
      return (
        <WebhookContent
          domain={domain}
          breadcrumb={breadcrumb}
          context={context}
        />
      );
    }
    default:
      return null;
  }
}
