"use server";

import { PlaygroundEndpoint } from "@/components/playground/endpoint/PlaygroundEndpoint";
import { PlaygroundWebSocket } from "@/components/playground/websocket/PlaygroundWebSocket";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { createFindNode } from "@/server/find-node";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  createEndpointContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = FernNavigation.slugjoin(params.slug);
  const fern_token = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(getDocsDomainApp(), fern_token);
  const node = await createFindNode(loader)(slug);
  if (node == null) {
    notFound();
  }
  if (!FernNavigation.isApiLeaf(node)) {
    notFound();
  }
  const api = await loader.getApi(node.apiDefinitionId);
  if (api == null) {
    notFound();
  }
  if (node.type === "endpoint") {
    const context = createEndpointContext(node, api);
    if (context == null) {
      notFound();
    }
    return <PlaygroundEndpoint context={context} />;
  } else if (node.type === "webSocket") {
    const context = createWebSocketContext(node, api);
    if (context == null) {
      notFound();
    }
    return <PlaygroundWebSocket context={context} />;
  }
  notFound();
}
