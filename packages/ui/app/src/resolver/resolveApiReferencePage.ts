import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiDefinitionLoader, MarkdownLoader } from "@fern-ui/fern-docs-server";
import type { DocsContent } from "./DocsContent";

interface ResolveApiReferencePageOpts {
    node: FernNavigation.NavigationNodeWithMetadata;
    parents: readonly FernNavigation.NavigationNodeParent[];
    apiReferenceNode: FernNavigation.ApiReferenceNode;
    apiDefinitionLoader: ApiDefinitionLoader;
    markdownLoader: MarkdownLoader;
}

export async function resolveApiReferencePage({
    node,
    parents,
    apiReferenceNode,
    apiDefinitionLoader,
    markdownLoader,
}: ResolveApiReferencePageOpts): Promise<DocsContent.ApiReferencePage | undefined> {
    const apiDefinition = await apiDefinitionLoader.load();

    if (!apiDefinition) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error(`Failed to load API definition for ${node.slug}`);
        return;
    }

    const nodes: [FernNavigation.NavigationNodeWithMarkdown, readonly FernNavigation.BreadcrumbItem[]][] = [];

    const apiReferenceNodeIdx = parents.findIndex((parent) => parent.id === apiReferenceNode.id);
    if (apiReferenceNodeIdx === -1) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Could not find api reference node in parents");
    }

    const sidebarRootNodeIdx = parents.findIndex((parent) => parent.type === "sidebarRoot");
    if (sidebarRootNodeIdx === -1) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Failed to find sidebar root node");
    }

    // get all the parents of the api reference node (excluding the api reference node itself) up to the sidebar root node
    const apiReferenceNodeParents = parents.slice(
        Math.max(0, sidebarRootNodeIdx),
        Math.max(0, apiReferenceNodeIdx - 1),
    );

    const breadcrumb = FernNavigation.utils.createBreadcrumb(apiReferenceNodeParents);

    FernNavigation.traverseDF(apiReferenceNode, (node, parents) => {
        if (!FernNavigation.hasMarkdown(node)) {
            return;
        }
        nodes.push([node, [...breadcrumb, ...FernNavigation.utils.createBreadcrumb(parents)]]);
    });

    const mdxs = Object.fromEntries(
        (
            await Promise.all(
                nodes.map(async ([node, breadcrumb]) => {
                    const page = await markdownLoader.load(node, breadcrumb);
                    return [node.id, page] as const;
                }),
            )
        ).filter((entry): entry is [FernNavigation.NodeId, FernDocs.MarkdownText] => entry[1] != null),
    );

    return {
        type: "api-reference-page",
        slug: node.slug,
        apiReferenceNode,
        apiDefinition,
        mdxs,
        breadcrumb,
    };
}
