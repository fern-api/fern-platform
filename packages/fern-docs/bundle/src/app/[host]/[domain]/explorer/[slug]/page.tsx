import "server-only";

import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  createEndpointContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import { COOKIE_FERN_TOKEN, conformTrailingSlash } from "@fern-docs/utils";

import { getFernToken } from "@/app/fern-token";
import { PlaygroundEndpoint } from "@/components/playground/endpoint/PlaygroundEndpoint";
import { conformExplorerRoute } from "@/components/playground/utils/explorer-route";
import { PlaygroundWebSocket } from "@/components/playground/websocket/PlaygroundWebSocket";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function Page(props: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const [{ host, domain, slug: slugProp }, cookieJar] = await Promise.all([
    props.params,
    cookies(),
  ]);
  console.debug(`[${domain}] Loading API Explorer page`);

  const slug = FernNavigation.slugjoin(slugProp);
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(host, domain, fern_token);

  console.debug(`[${loader.domain}] Loading API Explorer for slug: ${slug}`);
  const root = await loader.getRoot();

  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    if (found.redirect) {
      console.log(
        `[${loader.domain}] Redirecting from ${slug} to ${found.redirect}`
      );
      // follows the route path hierarchy
      redirect(conformTrailingSlash(conformExplorerRoute(found.redirect)));
    }

    console.error(`[${loader.domain}] Could not find node for slug: ${slug}`);
    notFound();
  }
  const node = found.node;
  if (!FernNavigation.isApiLeaf(node)) {
    console.error(`[${loader.domain}] Found non-leaf node for slug: ${slug}`);
    notFound();
  }
  const api = await loader.getApi(node.apiDefinitionId);

  if (node.type === "endpoint") {
    const context = createEndpointContext(node, api);
    if (context == null) {
      console.error(
        `[${loader.domain}] Could not create endpoint context for slug: ${slug}`
      );
      notFound();
    }
    return <PlaygroundEndpoint context={context} />;
  } else if (node.type === "webSocket") {
    const context = createWebSocketContext(node, api);
    if (context == null) {
      console.error(
        `[${loader.domain}] Could not create web socket context for slug: ${slug}`
      );
      notFound();
    }
    return <PlaygroundWebSocket context={context} />;
  }
  console.error(
    `[${loader.domain}] Found non-visitable node for slug: ${slug}`,
    node
  );
  notFound();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}): Promise<Metadata> {
  const { host, domain, slug: slugProp } = await params;
  const slug = FernNavigation.slugjoin(slugProp);
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );
  const root = await loader.getRoot();
  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    return {};
  }
  return {
    title: `${found.node.title} (API Explorer)`,
  };
}
