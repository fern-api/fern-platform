"use server";

import { PlaygroundEndpoint } from "@/components/playground/endpoint/PlaygroundEndpoint";
import { conformExplorerRoute } from "@/components/playground/utils/explorer-route";
import { PlaygroundWebSocket } from "@/components/playground/websocket/PlaygroundWebSocket";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  createEndpointContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import { conformTrailingSlash, COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { slug: string[]; domain: string };
}) {
  const slug = FernNavigation.slugjoin(
    headers().get("x-basepath"),
    params.slug
  );
  const fern_token = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(params.domain, fern_token);
  console.debug(`[${loader.domain}] Loading API Explorer for slug: ${slug}`);
  const root = await loader.getRoot();
  if (root == null) {
    console.warn(`[${loader.domain}] Could not find root for slug: ${slug}`);
    notFound();
  }

  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    if (found.redirect) {
      console.warn(
        `[${loader.domain}] Redirecting from ${slug} to ${found.redirect}`
      );
      // follows the route path hierarchy
      // e.g. /docs/foo/bar -> /docs/~/api-explorer/foo/bar
      redirect(
        conformTrailingSlash(conformExplorerRoute(found.redirect, root.slug))
      );
    }

    console.warn(`[${loader.domain}] Could not find node for slug: ${slug}`);
    notFound();
  }
  const node = found.node;
  if (!FernNavigation.isApiLeaf(node)) {
    console.warn(`[${loader.domain}] Found non-leaf node for slug: ${slug}`);
    notFound();
  }
  const api = await loader.getApi(node.apiDefinitionId);
  if (api == null) {
    console.warn(`[${loader.domain}] Could not find api for slug: ${slug}`);
    notFound();
  }
  if (node.type === "endpoint") {
    const context = createEndpointContext(node, api);
    if (context == null) {
      console.warn(
        `[${loader.domain}] Could not create endpoint context for slug: ${slug}`
      );
      notFound();
    }
    return <PlaygroundEndpoint context={context} />;
  } else if (node.type === "webSocket") {
    const context = createWebSocketContext(node, api);
    if (context == null) {
      console.warn(
        `[${loader.domain}] Could not create web socket context for slug: ${slug}`
      );
      notFound();
    }
    return <PlaygroundWebSocket context={context} />;
  }
  console.warn(
    `[${loader.domain}] Found non-visitable node for slug: ${slug}`,
    node
  );
  notFound();
}
