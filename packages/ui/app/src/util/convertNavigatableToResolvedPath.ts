import { APIV1Read, DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
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
    found,
    apis,
    pages,
    mdxOptions,
    domain,
    featureFlags,
}: {
    found: FernNavigation.utils.Node.Found;
    apis: Record<string, APIV1Read.ApiDefinition>;
    pages: Record<string, DocsV1Read.PageContent>;
    mdxOptions?: FernSerializeMdxOptions;
    domain: string;
    featureFlags: FeatureFlags;
}): Promise<ResolvedPath | undefined> {
    const neighbors = await getNeighbors(found, pages);
    const { node, apiReference } = found;

    if (apiReference != null) {
        const api = apis[apiReference.apiDefinitionId];
        if (api == null) {
            return;
        }
        const holder = FernNavigation.ApiDefinitionHolder.create(api);
        const typeResolver = new ApiTypeResolver(api.types);
        // const [prunedApiDefinition] = findAndPruneApiSection(fullSlug, flattenedApiDefinition);
        const apiDefinition = await ApiDefinitionResolver.resolve(
            apiReference,
            holder,
            typeResolver,
            pages,
            mdxOptions,
            featureFlags,
            domain,
        );
        return {
            type: "api-page",
            fullSlug: found.node.slug,
            api: apiReference.apiDefinitionId,
            apiDefinition,
            // artifacts: apiSection.artifacts ?? null, // TODO: add artifacts
            showErrors: apiReference.showErrors ?? false,
            neighbors,
        };
    } else if (node.type === "changelog") {
        const pageContent = node.overviewPageId != null ? pages[node.overviewPageId] : undefined;
        const serializedMdxContent =
            pageContent != null ? await serializeMdxWithFrontmatter(pageContent.markdown, mdxOptions) : null;
        const frontmatter = typeof serializedMdxContent === "string" ? {} : serializedMdxContent?.frontmatter ?? {};
        const itemsPromise: Promise<ResolvedPath.ChangelogPage["items"][0]>[] = [];
        node.children.forEach((year) => {
            year.children.forEach((month) => {
                month.children.forEach((entry) => {
                    const pageContent = pages[entry.pageId];
                    if (pageContent == null) {
                        return;
                    }
                    itemsPromise.push(
                        serializeMdxWithFrontmatter(pageContent.markdown, mdxOptions).then((markdown) => ({
                            date: entry.date,
                            dateString: Changelog.toLongDateString(entry.date),
                            markdown,
                        })),
                    );
                });
            });
        });
        return {
            type: "changelog-page",
            fullSlug: node.slug,
            title: frontmatter.title ?? node.title,
            sectionTitleBreadcrumbs: found.breadcrumb,
            markdown: serializedMdxContent,
            items: await Promise.all(itemsPromise),
            neighbors,
        };
    } else if (node.type === "page") {
        const pageContent = pages[node.pageId];
        if (pageContent == null) {
            return;
        }
        const serializedMdxContent = await serializeMdxWithFrontmatter(pageContent.markdown, {
            ...mdxOptions,
            pageHeader: {
                title: node.title,
                breadcrumbs: found.breadcrumb,
                editThisPageUrl: pageContent.editThisPageUrl,
                isTocDefaultEnabled: featureFlags.isTocDefaultEnabled,
            },
        });
        const frontmatter = typeof serializedMdxContent === "string" ? {} : serializedMdxContent.frontmatter;

        let apiNodes: FernNavigation.ApiReferenceNode[] = [];
        if (
            pageContent.markdown.includes("EndpointRequestSnippet") ||
            pageContent.markdown.includes("EndpointResponseSnippet")
        ) {
            apiNodes = FernNavigation.utils.collectApiReferences(found.currentVersion ?? found.root);
        }
        const resolvedApis = Object.fromEntries(
            await Promise.all(
                apiNodes.map(async (apiNode) => {
                    const holder = FernNavigation.ApiDefinitionHolder.create(apis[apiNode.apiDefinitionId]);
                    const typeResolver = new ApiTypeResolver(apis[apiNode.apiDefinitionId].types);
                    return [
                        apiNode.title,
                        await ApiDefinitionResolver.resolve(
                            apiNode,
                            holder,
                            typeResolver,
                            pages,
                            mdxOptions,
                            featureFlags,
                            domain,
                        ),
                    ];
                }),
            ),
        );
        return {
            type: "custom-markdown-page",
            fullSlug: node.slug,
            title: frontmatter.title ?? node.title,
            serializedMdxContent,
            neighbors,
            apis: resolvedApis,
        };
    }
    return undefined;
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
