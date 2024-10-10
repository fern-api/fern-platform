import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { ApiDefinitionLoader } from "@fern-ui/fern-docs-server";
import type { DocsContent } from "./DocsContent";

interface ResolveApiEndpointPageOpts {
    node: FernNavigation.NavigationNodeApiLeaf;
    parents: readonly FernNavigation.NavigationNodeParent[];
    apiDefinitionLoader: ApiDefinitionLoader;
    neighbors: DocsContent.Neighbors;
    showErrors: boolean | undefined;
}

export async function resolveApiEndpointPage({
    node,
    parents,
    apiDefinitionLoader,
    neighbors,
    showErrors,
}: ResolveApiEndpointPageOpts): Promise<DocsContent.ApiEndpointPage | undefined> {
    const parent = parents[parents.length - 1];

    if (parent?.type === "endpointPair") {
        apiDefinitionLoader.withPrune(parent.nonStream);
        apiDefinitionLoader.withPrune(parent.stream);
    } else {
        apiDefinitionLoader.withPrune(node);
    }

    const apiDefinition = await apiDefinitionLoader.load();

    if (!apiDefinition) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error(`Failed to load API definition for ${node.slug}`);
        return;
    }

    const sidebarRootNodeIdx = parents.findIndex((p) => p.type === "sidebarRoot");
    if (sidebarRootNodeIdx === -1) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Failed to find sidebar root node");
    }
    const breadcrumb = FernNavigation.utils.createBreadcrumb(
        sidebarRootNodeIdx >= 0 ? parents.slice(sidebarRootNodeIdx) : parents,
    );

    return {
        type: "api-endpoint-page",
        slug: node.slug,
        nodeId: parent?.type === "endpointPair" ? parent.id : node.id,
        apiDefinition,
        showErrors: showErrors ?? false,
        neighbors,
        breadcrumb,
    };
}
