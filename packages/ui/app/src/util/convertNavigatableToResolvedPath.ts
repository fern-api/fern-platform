import { APIV1Read, DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { SidebarNode, flattenApiDefinition } from "@fern-ui/fdr-utils";
import grayMatter from "gray-matter";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import urljoin from "url-join";
import { captureSentryError } from "../analytics/sentry";
import { FeatureFlags } from "../contexts/FeatureFlagContext";
import {
    FernDocsFrontmatter,
    FernSerializeMdxOptions,
    maybeSerializeMdxContent,
    serializeMdxWithFrontmatter,
} from "../mdx/mdx";
import { ApiDefinitionResolver } from "../resolver/ApiDefinitionResolver";
import { ApiTypeResolver } from "../resolver/ApiTypeResolver";
import type { ResolvedPath } from "../resolver/ResolvedPath";
import { ResolvedRootPackage } from "../resolver/types";
import { Changelog } from "./dateUtils";

function getFrontmatter(content: string): FernDocsFrontmatter {
    const frontmatterMatcher: RegExp = /^---\n([\s\S]*?)\n---/;
    const frontmatter = content.match(frontmatterMatcher)?.[0];
    if (frontmatter == null) {
        return {};
    }
    const gm = grayMatter(frontmatter);
    return gm.data;
}

async function getSubtitle(
    node: FernNavigation.NavigationNodeWithContent,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<MDXRemoteSerializeResult | string | undefined> {
    const pageId = FernNavigation.utils.getPageId(node);
    if (pageId == null) {
        return;
    }
    const content = pages[pageId]?.markdown;
    if (content == null) {
        return;
    }

    try {
        const frontmatter = getFrontmatter(content);
        if (frontmatter.excerpt != null) {
            return await maybeSerializeMdxContent(frontmatter.excerpt);
        }
        return undefined;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error occurred while parsing frontmatter", e);
        captureSentryError(e, {
            context: "getStaticProps",
            errorSource: "getSubtitle",
            errorDescription: "Error occurred while parsing frontmatter to get the subtitle (aka excerpt)",
            data: {
                pageTitle: node.title,
                pageId,
                route: urljoin("/", ...node.slug),
            },
        });
        return undefined;
    }
}

export async function convertNavigatableToResolvedPath({
    node,
    apis,
    pages,
    mdxOptions,
    domain,
    featureFlags,
}: {
    node: FernNavigation.utils.Node.Found;
    apis: Record<string, APIV1Read.ApiDefinition>;
    pages: Record<string, DocsV1Read.PageContent>;
    mdxOptions?: FernSerializeMdxOptions;
    domain: string;
    featureFlags: FeatureFlags;
}): Promise<ResolvedPath | undefined> {
    const neighbors = await getNeighbors(node, pages);

    if (node.apiReference != null) {
        const api = apis[node.apiReference.apiDefinitionId];
        if (api == null) {
            return;
        }
        const holder = FernNavigation.ApiDefinitionHolder.create(api);
        const typeResolver = new ApiTypeResolver(api.types);
        // const [prunedApiDefinition] = findAndPruneApiSection(fullSlug, flattenedApiDefinition);
        const apiDefinition = await ApiDefinitionResolver.resolve(
            node.apiReference,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            holder,
            typeResolver,
            pages,
            mdxOptions,
            featureFlags,
            domain,
        );
        return {
            type: "api-page",
            fullSlug: node.node.slug.join("/"),
            api: node.apiReference.apiDefinitionId,
            apiDefinition,
            // artifacts: apiSection.artifacts ?? null, // TODO: add artifacts
            showErrors: apiSection.showErrors,
            neighbors,
        };
    } else if (SidebarNode.isChangelogPage(traverseState.curr)) {
        const pageContent = traverseState.curr.pageId != null ? pages[traverseState.curr.pageId] : undefined;
        const serializedMdxContent =
            pageContent != null ? await serializeMdxWithFrontmatter(pageContent.markdown, mdxOptions) : null;
        const frontmatter = typeof serializedMdxContent === "string" ? {} : serializedMdxContent?.frontmatter ?? {};
        return {
            type: "changelog-page",
            fullSlug: traverseState.curr.slug.join("/"),
            title: frontmatter.title ?? traverseState.curr.title,
            sectionTitleBreadcrumbs: traverseState.sectionTitleBreadcrumbs,
            markdown: serializedMdxContent,
            items: await Promise.all(
                traverseState.curr.items.map(async (item) => {
                    const itemPageContent = pages[item.pageId];
                    const markdown = await serializeMdxWithFrontmatter(itemPageContent?.markdown ?? "", {
                        ...mdxOptions,
                    });
                    return {
                        date: item.date,
                        dateString: Changelog.toLongDateString(item.date),
                        markdown,
                    };
                }),
            ),
            neighbors,
        };
    } else {
        const pageContent = pages[traverseState.curr.id];
        if (pageContent == null) {
            return;
        }
        const serializedMdxContent = await serializeMdxWithFrontmatter(pageContent.markdown, {
            ...mdxOptions,
            pageHeader: {
                title: traverseState.curr.title,
                breadcrumbs: traverseState.sectionTitleBreadcrumbs,
                editThisPageUrl: pageContent.editThisPageUrl,
                isTocDefaultEnabled: featureFlags.isTocDefaultEnabled,
            },
        });
        const frontmatter = typeof serializedMdxContent === "string" ? {} : serializedMdxContent.frontmatter;

        let resolvedApis: Record<string, ResolvedRootPackage> = {};
        if (
            pageContent.markdown.includes("EndpointRequestSnippet") ||
            pageContent.markdown.includes("EndpointResponseSnippet")
        ) {
            const title = traverseState.curr.title;
            resolvedApis = Object.fromEntries(
                await Promise.all(
                    Object.entries(apis).map(async ([apiName, api]) => {
                        const flattenedApiDefinition = flattenApiDefinition(api, ["dummy"], undefined, domain);
                        return [
                            apiName,
                            await ApiDefinitionResolver.resolve(
                                title,
                                flattenedApiDefinition,
                                pages,
                                mdxOptions,
                                featureFlags,
                                domain,
                            ),
                        ];
                    }),
                ),
            );
        }
        return {
            type: "custom-markdown-page",
            fullSlug: traverseState.curr.slug.join("/"),
            title: frontmatter.title ?? traverseState.curr.title,
            serializedMdxContent,
            neighbors,
            apis: resolvedApis,
        };
    }
}

async function getNeighbor(
    node: FernNavigation.NavigationNodeWithContent | undefined,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<ResolvedPath.Neighbor | null> {
    if (node == null) {
        return null;
    }
    const excerpt = await getSubtitle(node, pages);
    return {
        fullSlug: urljoin(node.slug),
        title: node.title,
        excerpt,
    };
}

async function getNeighbors(
    node: FernNavigation.utils.Node.Found,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<ResolvedPath.Neighbors> {
    const [prev, next] = await Promise.all([getNeighbor(node.prev, pages), getNeighbor(node.next, pages)]);
    return { prev, next };
}
