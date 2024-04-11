import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import {
    SidebarNode,
    SidebarNodeRaw,
    findApiSection,
    flattenApiDefinition,
    traverseSidebarNodes,
} from "@fern-ui/fdr-utils";
import grayMatter from "gray-matter";
import moment from "moment";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { emitDatadogError } from "../analytics/datadogRum";
import {
    FernDocsFrontmatter,
    FernSerializeMdxOptions,
    maybeSerializeMdxContent,
    serializeMdxWithFrontmatter,
} from "../mdx/mdx";
import { ApiDefinitionResolver } from "./ApiDefinitionResolver";
import type { ResolvedPath } from "./ResolvedPath";
import { ResolvedRootPackage } from "./resolver";

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
    node: SidebarNode.Page,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<MDXRemoteSerializeResult | string | undefined> {
    try {
        const content = pages[node.id]?.markdown;
        if (content == null) {
            return;
        }

        const frontmatter = getFrontmatter(content);
        if (frontmatter.excerpt != null) {
            return await maybeSerializeMdxContent(frontmatter.excerpt);
        }
        return undefined;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error occurred while parsing frontmatter", e);
        emitDatadogError(e, {
            context: "getStaticProps",
            errorSource: "getSubtitle",
            errorDescription: "Error occurred while parsing frontmatter to get the subtitle (aka excerpt)",
            data: {
                pageTitle: node.title,
                pageId: node.id,
                route: `/${node.slug.join("/")}`,
            },
        });
        return undefined;
    }
}

export async function convertNavigatableToResolvedPath({
    rawSidebarNodes,
    sidebarNodes,
    currentNode,
    apis,
    pages,
    mdxOptions,
}: {
    rawSidebarNodes: readonly SidebarNodeRaw[];
    sidebarNodes: SidebarNode[];
    currentNode: SidebarNodeRaw.VisitableNode;
    apis: Record<string, APIV1Read.ApiDefinition>;
    pages: Record<string, DocsV1Read.PageContent>;
    mdxOptions?: FernSerializeMdxOptions;
}): Promise<ResolvedPath | undefined> {
    const traverseState = traverseSidebarNodes(sidebarNodes, currentNode);

    if (traverseState.curr == null) {
        return;
    }

    const neighbors = await getNeighbors(traverseState, pages);

    if (currentNode.slug.join("/") !== traverseState.curr.slug.join("/")) {
        return {
            type: "redirect",
            fullSlug: traverseState.curr.slug.join("/"),
        };
    }

    if (SidebarNode.isApiPage(traverseState.curr)) {
        const api = apis[traverseState.curr.api];
        const apiSection = findApiSection(traverseState.curr.api, rawSidebarNodes);
        if (api == null || apiSection == null) {
            return;
        }
        // const [prunedApiDefinition] = findAndPruneApiSection(fullSlug, flattenedApiDefinition);
        const apiDefinition = await ApiDefinitionResolver.resolve(
            traverseState.curr.title,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            apiSection.flattenedApiDefinition!,
            pages,
            mdxOptions,
        );
        return {
            type: "api-page",
            fullSlug: traverseState.curr.slug.join("/"),
            api: traverseState.curr.api,
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
                        dateString: moment(item.date).format("MMMM D, YYYY"),
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
                        const flattenedApiDefinition = flattenApiDefinition(api, ["dummy"], undefined);
                        return [
                            apiName,
                            await ApiDefinitionResolver.resolve(title, flattenedApiDefinition, pages, mdxOptions),
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
    sidebarNode: SidebarNode.Page | undefined,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<ResolvedPath.Neighbor | null> {
    if (sidebarNode == null) {
        return null;
    }
    const excerpt = await getSubtitle(sidebarNode, pages);
    return {
        fullSlug: sidebarNode.slug.join("/"),
        title: sidebarNode.title,
        excerpt,
    };
}

async function getNeighbors(
    traverseState: ReturnType<typeof traverseSidebarNodes>,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<ResolvedPath.Neighbors> {
    const [prev, next] = await Promise.all([
        getNeighbor(traverseState.prev, pages),
        getNeighbor(traverseState.next, pages),
    ]);
    return { prev, next };
}
