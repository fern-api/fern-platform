import { DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { resolveDocsContent, type DocsContent } from "@fern-docs/ui";
import { serializeMdx } from "@fern-docs/ui/bundlers/mdx-bundler";
import { EdgeFlags } from "@fern-docs/utils";
import { AuthState } from "./auth/getAuthState";
import { withPrunedNavigation } from "./withPrunedNavigation";

interface WithResolvedDocsContentOpts {
  domain: string;
  found: FernNavigation.utils.Node.Found;
  authState: AuthState;
  definition: DocsV1Read.DocsDefinition;
  edgeFlags: EdgeFlags;
  scope?: Record<string, unknown>;
}

export async function withResolvedDocsContent({
  domain,
  found,
  authState,
  definition,
  edgeFlags,
  scope,
}: WithResolvedDocsContentOpts): Promise<DocsContent | undefined> {
  const node = withPrunedNavigation(found.node, {
    visibleNodeIds: [found.node.id],
    authed: authState.authed,
  });

  if (node == null) {
    return undefined;
  }

  // pruning is especially relevant here! If the API reference is long-scrolling, we need to guarantee that the user is authed otherwise the node should not exist.
  const apiReference = withPrunedNavigation(found.apiReference, {
    visibleNodeIds: [found.node.id],
    authed: authState.authed,
  });

  return resolveDocsContent({
    node,
    apiReference,

    // TODO: don't pass in the version or parents
    version: found.currentVersion ?? found.root,
    parents: found.parents,

    breadcrumb: found.breadcrumb,

    // strip away authed neighbors unless they are explicitly discoverable
    prev: edgeFlags.isAuthenticatedPagesDiscoverable
      ? found.prev
      : found.prev?.authed
        ? undefined
        : found.prev,
    next: edgeFlags.isAuthenticatedPagesDiscoverable
      ? found.next
      : found.next?.authed
        ? undefined
        : found.next,

    apis: definition.apis,
    apisV2: definition.apisV2,
    pages: definition.pages,
    edgeFlags,
    mdxOptions: {
      files: definition.jsFiles,
      scope,
    },
    serializeMdx,
    domain,
    engine: "mdx-bundler",
  });
}
