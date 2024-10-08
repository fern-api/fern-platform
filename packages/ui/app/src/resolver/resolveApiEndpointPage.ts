import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { ApiDefinitionLoader } from "@fern-ui/fern-docs-server";
import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";

interface ResolveApiEndpointPageOpts {
    node: FernNavigation.NavigationNodeApiLeaf;
    parents: readonly FernNavigation.NavigationNodeParent[];
    apiDefinitionLoader: ApiDefinitionLoader;
    mdxOptions: FernSerializeMdxOptions | undefined;
    featureFlags: FeatureFlags;
    neighbors: DocsContent.Neighbors;
    serializeMdx: MDX_SERIALIZER;
    collector: FernNavigation.NodeCollector;
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
        return;
    }

    return {
        type: "api-endpoint-page",
        slug: node.slug,
        apiDefinition,
        showErrors: showErrors ?? false,
        neighbors,
    };
}
