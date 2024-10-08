import { type ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-ui/core-utils";
import { ApiDefinitionLoader, type MarkdownLoader } from "@fern-ui/fern-docs-server";
import type { DocsContent } from "./DocsContent";

interface ResolveMarkdownPageOptions {
    node: FernNavigation.NavigationNodeWithMarkdown;
    found: FernNavigation.utils.Node.Found;
    apiLoaders: Record<FernNavigation.ApiDefinitionId, ApiDefinitionLoader>;
    neighbors: DocsContent.Neighbors;
    markdownLoader: MarkdownLoader;
}

// TODO: this should be more robust
function shouldFetchApiRef(markdown: FernDocs.MarkdownText): boolean {
    if (typeof markdown === "string") {
        return markdown.includes("EndpointRequestSnippet") || markdown.includes("EndpointResponseSnippet");
    } else {
        return shouldFetchApiRef(markdown.code);
    }
}

export async function resolveMarkdownPage({
    node,
    found,
    apiLoaders,
    neighbors,
    markdownLoader,
}: ResolveMarkdownPageOptions): Promise<DocsContent.CustomMarkdownPage | undefined> {
    const mdx = await markdownLoader.load(node, found.breadcrumb);

    if (!mdx) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load markdown for ${node.slug}`);
        return;
    }

    const apiDefinitionIds = new Set<FernNavigation.ApiDefinitionId>();
    if (shouldFetchApiRef(mdx)) {
        FernNavigation.utils.collectApiReferences(found.currentVersion ?? found.root).forEach((apiRef) => {
            apiDefinitionIds.add(apiRef.apiDefinitionId);
        });
    }
    const resolvedApis = Object.fromEntries(
        (
            await Promise.all(
                [...apiDefinitionIds].map(
                    async (id): Promise<[id: FernNavigation.ApiDefinitionId, ApiDefinition] | undefined> => {
                        const loader = apiLoaders[id];
                        if (loader == null) {
                            // eslint-disable-next-line no-console
                            console.error("API definition not found", id);
                            return;
                        }
                        const apiDefinition = await loader.load();

                        if (apiDefinition == null) {
                            // eslint-disable-next-line no-console
                            console.error(`Failed to load API definition for ${id}`);
                            return;
                        }
                        return [apiDefinition.id, apiDefinition] as const;
                    },
                ),
            )
        ).filter(isNonNullish),
    );
    return {
        type: "custom-markdown-page",
        slug: node.slug,
        mdx,
        neighbors,
        apis: resolvedApis,
    };
}
