import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { ApiDefinitionLoader } from "@fern-ui/fern-docs-server";
import type { DocsContent } from "./DocsContent";

interface ResolveApiEndpointPageOpts {
    node: FernNavigation.NavigationNodeApiLeaf;
    parent: FernNavigation.NavigationNodeParent | undefined;
    apiDefinitionLoader: ApiDefinitionLoader;
    neighbors: DocsContent.Neighbors;
    showErrors: boolean | undefined;
}

export async function resolveApiEndpointPage({
    node,
    parent,
    apiDefinitionLoader,
    neighbors,
    showErrors,
}: ResolveApiEndpointPageOpts): Promise<DocsContent.ApiEndpointPage | undefined> {
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

    return {
        type: "api-endpoint-page",
        slug: node.slug,
        item: parent?.type === "endpointPair" ? parent : node,
        apiDefinition,
        showErrors: showErrors ?? false,
        neighbors,
    };
}
