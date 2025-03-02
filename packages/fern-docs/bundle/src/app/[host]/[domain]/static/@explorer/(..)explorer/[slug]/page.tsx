import "server-only";

import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import React from "react";

import { ArrowLeft } from "lucide-react";

import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  createEndpointContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import { NavigationNodePage } from "@fern-api/fdr-sdk/navigation";
import { conformTrailingSlash } from "@fern-docs/utils";

import { PlaygroundAuthorizationFormCard } from "@/components/playground/auth/PlaygroundAuthorizationFormCard";
import { PlaygroundEndpoint } from "@/components/playground/endpoint/PlaygroundEndpoint";
import { conformExplorerRoute } from "@/components/playground/utils/explorer-route";
import { PlaygroundWebSocket } from "@/components/playground/websocket/PlaygroundWebSocket";
import { DocsLoader, createCachedDocsLoader } from "@/server/docs-loader";

export default async function ExplorerPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug: slugProp } = await params;

  const slug = FernNavigation.slugjoin(slugProp);

  console.debug(
    `[${domain}] Loading intercepted API Explorer page for ${slug}`
  );

  const loader = await createCachedDocsLoader(host, domain);
  const root = await loader.getRoot();

  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    if (found.redirect) {
      // this will allow us to redirect to the correct page in the same intercepted API Explorer page
      redirect(
        conformTrailingSlash(conformExplorerRoute(found.redirect)),
        RedirectType.replace
      );
    }

    return <NoEndpointSelected />;
  }
  const node = found.node;

  return <ExplorerContent loader={loader} node={node} />;
}

async function ExplorerContent({
  loader,
  node,
}: {
  loader: DocsLoader;
  node: NavigationNodePage;
}) {
  if (!FernNavigation.isApiLeaf(node)) {
    return <NoEndpointSelected />;
  }
  const api = await loader.getPrunedApi(node.apiDefinitionId, node);

  if (node.type === "endpoint") {
    const context = createEndpointContext(node, api);
    if (!context) return null;
    const authForm = context.auth != null && (
      <PlaygroundAuthorizationFormCard
        loader={loader}
        apiDefinitionId={node.apiDefinitionId}
        auth={context.auth}
      />
    );
    return <PlaygroundEndpoint context={context} authForm={authForm} />;
  } else if (node.type === "webSocket") {
    const context = createWebSocketContext(node, api);
    if (!context) return null;
    const authForm = context.auth != null && (
      <PlaygroundAuthorizationFormCard
        loader={loader}
        apiDefinitionId={node.apiDefinitionId}
        auth={context.auth}
      />
    );
    return <PlaygroundWebSocket context={context} authForm={authForm} />;
  }
  return <NoEndpointSelected />;
}

function NoEndpointSelected() {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <ArrowLeft className="t-muted mb-2 size-8" />
      <h6 className="t-muted">Select an endpoint to get started</h6>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}): Promise<Metadata> {
  const { host, domain, slug: slugProp } = await params;
  const slug = FernNavigation.slugjoin(slugProp);
  const loader = await createCachedDocsLoader(host, domain);
  const root = await loader.getRoot();
  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    return {};
  }
  return {
    title: `${found.node.title} (API Explorer)`,
  };
}
