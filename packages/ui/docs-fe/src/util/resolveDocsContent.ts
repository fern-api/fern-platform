import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-platform/core-utils";
import GithubSlugger from "github-slugger";
import { reverse } from "lodash-es";
import { captureSentryError } from "../analytics/sentry";
import type { FeatureFlags } from "../atoms";
import { serializeMdx } from "../mdx/bundler";
import { getFrontmatter } from "../mdx/frontmatter";
import type { BundledMDX, FernSerializeMdxOptions } from "../mdx/types";
import { ApiDefinitionResolver } from "../resolver/ApiDefinitionResolver";
import { ApiEndpointResolver } from "../resolver/ApiEndpointResolver";
import { ApiTypeResolver } from "../resolver/ApiTypeResolver";
import type { DocsContent } from "../resolver/DocsContent";
import type { ResolvedApiEndpoint, ResolvedRootPackage } from "../resolver/types";

async function getSubtitle(
    node: FernNavigation.NavigationNodeNeighbor,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<BundledMDX | undefined> {
    const pageId = FernNavigation.utils.getPageId(node);
    if (pageId == null) {
        return;
    }
    const content = pages[pageId]?.markdown;
    if (content == null) {
        return;
    }

    try {
        const { data: frontmatter } = getFrontmatter(content);
        if (frontmatter.excerpt != null) {
            return await serializeMdx(frontmatter.excerpt);
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
                route: `/${node.slug}`,
            },
        });
        return undefined;
    }
}

export async function resolveDocsContent({
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
}): Promise<DocsContent | undefined> {
    const neighbors = await getNeighbors(found, pages);
    const { node, apiReference, parents } = found;

    if (node.type === "changelog") {
        const pageIds = new Set<FernNavigation.PageId>();
        FernNavigation.utils.traverseNavigation(node, (n) => {
            if (FernNavigation.hasMarkdown(n)) {
                const pageId = FernNavigation.utils.getPageId(n);
                if (pageId != null) {
                    pageIds.add(pageId);
                }
            }
        });
        const pageRecords = (
            await Promise.all(
                [...pageIds].map(async (pageId) => {
                    const pageContent = pages[pageId];
                    if (pageContent == null) {
                        return;
                    }
                    return {
                        pageId,
                        markdown: await serializeMdx(pageContent.markdown, {
                            ...mdxOptions,
                            filename: pageId,
                        }),
                        anchorTag: parseMarkdownPageToAnchorTag(pageContent.markdown),
                    };
                }),
            )
        ).filter(isNonNullish);

        const markdown = node.overviewPageId != null ? pages[node.overviewPageId]?.markdown : undefined;

        const page =
            markdown != null
                ? await serializeMdx(markdown, {
                      ...mdxOptions,
                      filename: node.overviewPageId,
                  })
                : undefined;

        /**
         * if there are duplicate anchor tags, the anchor from the first page where it appears will be used
         */
        const anchorIds: Record<string, FernNavigation.PageId> = {};
        pageRecords.forEach((record) => {
            if (record.anchorTag != null && anchorIds[record.anchorTag] == null) {
                anchorIds[record.anchorTag] = record.pageId;
            }
        });

        return {
            type: "changelog",
            breadcrumbs: found.breadcrumbs,
            title: (page != null && typeof page !== "string" ? page.frontmatter.title : undefined) ?? found.node.title,
            node,
            pages: Object.fromEntries(pageRecords.map((record) => [record.pageId, record.markdown])),
            // items: await Promise.all(itemsPromise),
            // neighbors,
            slug: found.node.slug,
            anchorIds,
        };
    } else if (node.type === "changelogEntry") {
        const changelogNode = reverse(parents).find((n): n is FernNavigation.ChangelogNode => n.type === "changelog");
        if (changelogNode == null) {
            throw new Error("Changelog node not found");
        }
        const changelogMarkdown =
            changelogNode.overviewPageId != null ? pages[changelogNode.overviewPageId]?.markdown : undefined;
        const changelogTitle =
            (changelogMarkdown != null ? getFrontmatter(changelogMarkdown).data.title : undefined) ??
            changelogNode.title;

        const markdown = pages[node.pageId]?.markdown;
        if (markdown == null) {
            // eslint-disable-next-line no-console
            console.error("Markdown content not found", node.pageId);
            return;
        }

        const page = await serializeMdx(markdown, {
            ...mdxOptions,
            filename: node.pageId,
        });

        return {
            ...node,
            type: "changelog-entry",
            changelogTitle,
            changelogSlug: changelogNode.slug,
            breadcrumbs: found.breadcrumbs,
            page,
            neighbors,
        };
    } else if (apiReference != null && apiReference.paginated && FernNavigation.hasMarkdown(node)) {
        // if long scrolling is disabled, we should render a markdown page by itself
        return resolveMarkdownPage(node, found, apis, pages, mdxOptions, featureFlags, domain, neighbors);
    } else if (apiReference != null) {
        let api = apis[apiReference.apiDefinitionId];
        if (api == null) {
            // eslint-disable-next-line no-console
            console.error("API not found", apiReference.apiDefinitionId);
            return;
        }
        if (apiReference.paginated && FernNavigation.isApiLeaf(node)) {
            const pruner = new FernNavigation.ApiDefinitionPruner(api);
            const parent = found.parents[found.parents.length - 1];
            api = pruner.prune(parent?.type === "endpointPair" ? parent : node);
            const holder = FernNavigation.ApiDefinitionHolder.create(api);
            const typeResolver = new ApiTypeResolver(api.types, mdxOptions);
            const defResolver = new ApiEndpointResolver(
                found.collector,
                holder,
                typeResolver,
                await typeResolver.resolve(),
                featureFlags,
                mdxOptions,
            );
            return {
                type: "api-endpoint-page",
                slug: found.node.slug,
                api: apiReference.apiDefinitionId,
                auth: api.auth,
                types: await typeResolver.resolve(),
                item: await visitDiscriminatedUnion(node)._visit<Promise<ResolvedApiEndpoint>>({
                    endpoint: async (endpoint) => {
                        if (parent?.type === "endpointPair") {
                            const [stream, nonStream] = await Promise.all([
                                defResolver.resolveEndpointDefinition(parent.stream),
                                defResolver.resolveEndpointDefinition(parent.nonStream),
                            ]);
                            nonStream.stream = stream;
                            return nonStream;
                        }
                        return defResolver.resolveEndpointDefinition(endpoint);
                    },
                    webSocket: (webSocket) => defResolver.resolveWebsocketChannel(webSocket),
                    webhook: (webhook) => defResolver.resolveWebhookDefinition(webhook),
                }),
                showErrors: apiReference.showErrors ?? false,
                neighbors,
            };
        }
        const holder = FernNavigation.ApiDefinitionHolder.create(api);
        const typeResolver = new ApiTypeResolver(api.types, mdxOptions);
        const apiDefinition = await ApiDefinitionResolver.resolve(
            found.collector,
            apiReference,
            holder,
            typeResolver,
            pages,
            mdxOptions,
            featureFlags,
        );
        return {
            type: "api-reference-page",
            slug: found.node.slug,
            title: node.title,
            api: apiReference.apiDefinitionId,
            apiDefinition,
            paginated: apiReference.paginated ?? false,
            // artifacts: apiSection.artifacts ?? null, // TODO: add artifacts
            showErrors: apiReference.showErrors ?? false,
            // neighbors,
        };
    } else {
        return resolveMarkdownPage(node, found, apis, pages, mdxOptions, featureFlags, domain, neighbors);
    }
}

async function resolveMarkdownPage(
    node: FernNavigation.NavigationNodePage,
    found: FernNavigation.utils.Node.Found,
    apis: Record<string, APIV1Read.ApiDefinition>,
    pages: Record<string, DocsV1Read.PageContent>,
    mdxOptions: FernSerializeMdxOptions | undefined,
    featureFlags: FeatureFlags,
    domain: string,
    neighbors: DocsContent.Neighbors,
): Promise<DocsContent.CustomMarkdownPage | undefined> {
    const pageId = FernNavigation.utils.getPageId(node);
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
            breadcrumbs: found.breadcrumbs,
            "edit-this-page-url": pageContent.editThisPageUrl,
            "force-toc": featureFlags.isTocDefaultEnabled,
        },
    });
    const frontmatter = typeof mdx === "string" ? {} : mdx.frontmatter;

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
                const typeResolver = new ApiTypeResolver(definition.types, mdxOptions);
                return [
                    apiNode.title,
                    await ApiDefinitionResolver.resolve(
                        found.collector,
                        apiNode,
                        holder,
                        typeResolver,
                        pages,
                        mdxOptions,
                        featureFlags,
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

async function getNeighbor(
    node: FernNavigation.NavigationNodeNeighbor | undefined,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<DocsContent.Neighbor | null> {
    if (node == null) {
        return null;
    }
    const excerpt = await getSubtitle(node, pages);
    return {
        slug: node.slug,
        title: node.title,
        excerpt,
    };
}

async function getNeighbors(
    node: FernNavigation.utils.Node.Found,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<DocsContent.Neighbors> {
    const [prev, next] = await Promise.all([getNeighbor(node.prev, pages), getNeighbor(node.next, pages)]);
    return { prev, next };
}

export function parseMarkdownPageToAnchorTag(markdown: string): string | undefined {
    /**
     * new slugger instance per page to avoid conflicts between pages
     */
    const slugger = new GithubSlugger();

    // This regex match is temporary and will be replaced with a more robust solution
    const matches = markdown.match(/^(#{1,6})\s+(.+)$/gm);
    let anchorTag = undefined;
    if (matches) {
        const originalSlug = slugger.slug(matches[0]);
        anchorTag = originalSlug.match(/[^$$]+/)?.[0].slice(1);
    }

    return anchorTag;
}
