import { APIV1Read, DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";
import { captureSentryError } from "../analytics/sentry";
import { FeatureFlags } from "../atoms";
import { serializeMdx } from "../mdx/bundler";
import { getFrontmatter } from "../mdx/frontmatter";
import { FernSerializeMdxOptions, type BundledMDX } from "../mdx/types";
import { ApiDefinitionResolver } from "../resolver/ApiDefinitionResolver";
import { ApiTypeResolver } from "../resolver/ApiTypeResolver";
import type { ResolvedPath } from "../resolver/ResolvedPath";
import { ResolvedRootPackage } from "../resolver/types";
import { slugToHref } from "./slugToHref";

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
                route: slugToHref(node.slug),
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

        return {
            type: "changelog",
            sectionTitleBreadcrumbs: found.breadcrumb,
            title: (page != null && typeof page !== "string" ? page.frontmatter.title : undefined) ?? found.node.title,
            node,
            pages: Object.fromEntries(pageRecords.map((record) => [record.pageId, record.markdown])),
            // items: await Promise.all(itemsPromise),
            // neighbors,
            slug: found.node.slug,
        };
    } else if (node.type === "changelogEntry") {
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

        const changelogNode = found.parents.find((n): n is FernNavigation.ChangelogNode => n.type === "changelog");
        if (changelogNode == null) {
            throw new Error("Changelog node not found");
        }

        return {
            type: "changelog-entry",
            title: (typeof page !== "string" ? page.frontmatter.title : undefined) ?? changelogNode.title,
            slug: changelogNode.slug,
            changelogSlug: node.slug,
            sectionTitleBreadcrumbs: found.breadcrumb,
            node,
            pages: { [node.pageId]: page },
            neighbors,
        };
    } else if (apiReference != null) {
        const api = apis[apiReference.apiDefinitionId];
        if (api == null) {
            // eslint-disable-next-line no-console
            console.error("API not found", apiReference.apiDefinitionId);
            return;
        }
        const holder = FernNavigation.ApiDefinitionHolder.create(api);
        const typeResolver = new ApiTypeResolver(api.types, mdxOptions);
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
            slug: found.node.slug,
            title: node.title,
            api: apiReference.apiDefinitionId,
            apiDefinition,
            // artifacts: apiSection.artifacts ?? null, // TODO: add artifacts
            showErrors: apiReference.showErrors ?? false,
            neighbors,
        };
    } else {
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
                breadcrumbs: found.breadcrumb,
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
                apiNodes.map(async (apiNode): Promise<[string, ResolvedRootPackage]> => {
                    const holder = FernNavigation.ApiDefinitionHolder.create(apis[apiNode.apiDefinitionId]);
                    const typeResolver = new ApiTypeResolver(apis[apiNode.apiDefinitionId].types, mdxOptions);
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
            slug: node.slug,
            title: frontmatter.title ?? node.title,
            mdx,
            neighbors,
            apis: resolvedApis,
        };
    }
}

async function getNeighbor(
    node: FernNavigation.NavigationNodeNeighbor | undefined,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<ResolvedPath.Neighbor | null> {
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
): Promise<ResolvedPath.Neighbors> {
    const [prev, next] = await Promise.all([getNeighbor(node.prev, pages), getNeighbor(node.next, pages)]);
    return { prev, next };
}
