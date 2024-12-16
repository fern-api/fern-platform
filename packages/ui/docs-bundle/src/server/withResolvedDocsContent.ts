import { DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FeatureFlags } from "@fern-ui/fern-docs-utils";
import { resolveDocsContent, type DocsContent } from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { AuthState } from "./auth/getAuthState";
import { withPrunedNavigation } from "./withPrunedNavigation";

interface WithResolvedDocsContentOpts {
    domain: string;
    found: FernNavigation.utils.Node.Found;
    authState: AuthState;
    definition: DocsV1Read.DocsDefinition;
    featureFlags: FeatureFlags;
}

export async function withResolvedDocsContent({
    domain,
    found,
    authState,
    definition,
    featureFlags,
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

    const engine = featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

    return resolveDocsContent({
        node,
        apiReference,

        // TODO: don't pass in the version or parents
        version: found.currentVersion ?? found.root,
        parents: found.parents,

        breadcrumb: found.breadcrumb,

        // strip away authed neighbors unless they are explicitly discoverable
        prev: featureFlags.isAuthenticatedPagesDiscoverable ? found.prev : found.prev?.authed ? undefined : found.prev,
        next: featureFlags.isAuthenticatedPagesDiscoverable ? found.next : found.next?.authed ? undefined : found.next,

        apis: definition.apis,
        apisLatest: definition.apisLatest,
        pages: definition.pages,
        featureFlags,
        mdxOptions: {
            files: definition.jsFiles,
        },
        serializeMdx,
        domain,
        engine,
    });
}
