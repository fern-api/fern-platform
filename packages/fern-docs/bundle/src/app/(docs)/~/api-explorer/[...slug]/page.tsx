"use server";

import { PlaygroundEndpoint } from "@/components/playground/endpoint/PlaygroundEndpoint";
import { conformExplorerRoute } from "@/components/playground/utils/explorer-route";
import { PlaygroundWebSocket } from "@/components/playground/websocket/PlaygroundWebSocket";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  createEndpointContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import { conformTrailingSlash, COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = FernNavigation.slugjoin(
    headers().get("x-basepath"),
    params.slug
  );
  console.log("slug", headers().get("x-basepath"), params.slug, slug);
  const fern_token = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(getDocsDomainApp(), fern_token);
  const root = await loader.getRoot();
  if (root == null) {
    notFound();
  }
  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    if (found.redirect) {
      // follows the route path hierarchy
      // e.g. /docs/foo/bar -> /docs/~/api-explorer/foo/bar
      redirect(
        conformTrailingSlash(conformExplorerRoute(found.redirect, root.slug))
      );
    }

    notFound();
  }
  const node = found.node;
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
