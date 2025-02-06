"use server";

import { createCachedDocsLoader } from "@/server/docs-loader";
import {
  ApiDefinition,
  createEndpointContext,
  createWebhookContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { notFound } from "next/navigation";
import ApiEndpointLayout from "./ApiEndpointPageClient";
import { EndpointContent } from "./endpoints/EndpointContent";
import { WebSocketContent } from "./web-socket/WebSocket";
import { WebhookContent } from "./webhooks/WebhookContent";

export default async function ApiEndpointPage({
  domain,
  node,
  breadcrumb,
  rootslug,
}: {
  domain: string;
  node: FernNavigation.NavigationNodeApiLeaf;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  rootslug: FernNavigation.Slug;
}) {
  const docsLoader = await createCachedDocsLoader(domain);
  const apiDefinition = await docsLoader.getApi(node.apiDefinitionId);
  if (!apiDefinition) {
    notFound();
  }

  return (
    <ApiEndpointLayout>
      <ApiEndpointContent
        node={node}
        apiDefinition={apiDefinition}
        breadcrumb={breadcrumb}
        rootslug={rootslug}
      />
    </ApiEndpointLayout>
  );
}

function ApiEndpointContent({
  node,
  apiDefinition,
  breadcrumb,
  rootslug,
}: {
  node: FernNavigation.NavigationNodeApiLeaf;
  apiDefinition: ApiDefinition;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  rootslug: FernNavigation.Slug;
}) {
  switch (node.type) {
    case "endpoint": {
      const context = createEndpointContext(node, apiDefinition);
      if (!context) {
        notFound();
      }
      return (
        <EndpointContent
          breadcrumb={breadcrumb}
          context={context}
          showErrors
          rootslug={rootslug}
        />
      );
    }
    case "webSocket": {
      const context = createWebSocketContext(node, apiDefinition);
      if (!context) {
        notFound();
      }
      return (
        <WebSocketContent
          breadcrumb={breadcrumb}
          context={context}
          rootslug={rootslug}
        />
      );
    }
    case "webhook": {
      const context = createWebhookContext(node, apiDefinition);
      if (!context) {
        notFound();
      }
      return <WebhookContent breadcrumb={breadcrumb} context={context} />;
    }
    default:
      return null;
  }
}
