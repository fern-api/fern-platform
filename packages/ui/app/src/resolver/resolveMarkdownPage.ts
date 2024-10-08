import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { FeatureFlags } from "../atoms";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import { ApiDefinitionResolver } from "./ApiDefinitionResolver";
import type { DocsContent } from "./DocsContent";
import { ResolvedRootPackage } from "./types";

interface ResolveMarkdownPageOptions {
    node: FernNavigation.NavigationNodePage;
    found: FernNavigation.utils.Node.Found;
    apis: Record<string, APIV1Read.ApiDefinition>;
    pages: Record<string, DocsV1Read.PageContent>;
    mdxOptions: FernSerializeMdxOptions | undefined;
    featureFlags: FeatureFlags;
    neighbors: DocsContent.Neighbors;
    serializeMdx: MDX_SERIALIZER;
}

export async function resolveMarkdownPage({
    node,
    found,
    apis,
    pages,
    mdxOptions,
    featureFlags,
    neighbors,
    serializeMdx,
}: ResolveMarkdownPageOptions): Promise<DocsContent.CustomMarkdownPage | undefined> {
    const pageId = FernNavigation.getPageId(node);
    if (pageId == null) {
        return;
    }
    const pageContent = pages[pageId];
    if (pageContent == null) {
        // eslint-disable-next-line no-console
        console.error("Markdown content not found", pageId);
        return;
    }
    const mdx = await serializeMdx(pageContent.markdown, {
        ...mdxOptions,
        filename: pageId,
        frontmatterDefaults: {
            title: node.title,
            breadcrumb: [...found.breadcrumb],
            "edit-this-page-url": pageContent.editThisPageUrl,
            "force-toc": featureFlags.isTocDefaultEnabled,
        },
    });
    const frontmatter: Partial<FernDocs.Frontmatter> = typeof mdx === "string" ? {} : mdx.frontmatter;

    let apiNodes: FernNavigation.ApiReferenceNode[] = [];
    if (
        pageContent.markdown.includes("EndpointRequestSnippet") ||
        pageContent.markdown.includes("EndpointResponseSnippet")
    ) {
        apiNodes = FernNavigation.utils.collectApiReferences(found.currentVersion ?? found.root);
    }
    const resolvedApis = Object.fromEntries(
        await Promise.all(
            apiNodes.map(async (apiNode): Promise<[title: string, ResolvedRootPackage]> => {
                const definition = apis[apiNode.apiDefinitionId];
                if (definition == null) {
                    // eslint-disable-next-line no-console
                    console.error("API not found", apiNode.apiDefinitionId);
                    return [
                        apiNode.title,
                        {
                            // TODO: alert if the API is not found — this is a bug
                            type: "rootPackage",
                            api: apiNode.apiDefinitionId,
                            auth: undefined,
                            types: {},
                            items: [],
                            slug: FernNavigation.Slug(""),
                        },
                    ];
                }
                const holder = FernNavigation.ApiDefinitionHolder.create(definition);
                return [
                    apiNode.title,
                    await ApiDefinitionResolver.resolve(
                        found.collector,
                        apiNode,
                        holder,
                        pages,
                        mdxOptions,
                        featureFlags,
                        serializeMdx,
                    ),
                ];
            }),
        ),
    );
    return {
        type: "custom-markdown-page",
        slug: node.slug,
        title: frontmatter.title ?? node.title,
        mdx,
        neighbors,
        apis: resolvedApis,
    };
}
