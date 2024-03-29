import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { SidebarNode, findApiSection, flattenApiDefinition, traverseSidebarNodes } from "@fern-ui/fdr-utils";
import grayMatter from "gray-matter";
import moment from "moment";
import { emitDatadogError } from "../analytics/datadogRum";
import { FernDocsFrontmatterInternal, SerializedMdxContent, serializeMdxContent } from "../mdx/mdx";
import type { ResolvedPath } from "./ResolvedPath";
import { resolveApiDefinition } from "./resolver";

function getFrontmatter(content: string): FernDocsFrontmatterInternal {
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
): Promise<SerializedMdxContent | undefined> {
    try {
        const content = pages[node.id]?.markdown;
        if (content == null) {
            return;
        }

        const frontmatter = getFrontmatter(content);
        if (frontmatter.excerpt != null) {
            return await serializeMdxContent(frontmatter.excerpt);
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
    sidebarNodes,
    slug,
    apis,
    pages,
}: {
    sidebarNodes: SidebarNode[];
    slug: string[];
    apis: Record<string, APIV1Read.ApiDefinition>;
    pages: Record<string, DocsV1Read.PageContent>;
}): Promise<ResolvedPath | undefined> {
    const traverseState = traverseSidebarNodes(sidebarNodes, slug);

    if (traverseState.curr == null) {
        return;
    }

    const neighbors = await getNeighbors(traverseState, pages);

    if (slug.join("/") !== traverseState.curr.slug.join("/")) {
        return {
            type: "redirect",
            fullSlug: traverseState.curr.slug.join("/"),
        };
    }

    if (SidebarNode.isApiPage(traverseState.curr)) {
        const api = apis[traverseState.curr.api];
        const apiSection = findApiSection(traverseState.curr.api, sidebarNodes);
        if (api == null || apiSection == null) {
            return;
        }
        const flattenedApiDefinition = flattenApiDefinition(api, apiSection.slug);
        // const [prunedApiDefinition] = findAndPruneApiSection(fullSlug, flattenedApiDefinition);
        const apiDefinition = await resolveApiDefinition(flattenedApiDefinition);
        return {
            type: "api-page",
            fullSlug: traverseState.curr.slug.join("/"),
            api: traverseState.curr.api,
            apiDefinition,
            artifacts: apiSection.artifacts ?? null, // TODO: add artifacts
            showErrors: apiSection.showErrors,
            neighbors,
        };
    } else if (SidebarNode.isChangelogPage(traverseState.curr)) {
        const pageContent = traverseState.curr.pageId != null ? pages[traverseState.curr.pageId] : undefined;
        const serializedMdxContent = pageContent != null ? await serializeMdxContent(pageContent.markdown) : null;
        const frontmatter = typeof serializedMdxContent === "string" ? {} : serializedMdxContent?.frontmatter ?? {};
        return {
            type: "changelog-page",
            fullSlug: traverseState.curr.slug.join("/"),
            title: frontmatter.title ?? traverseState.curr.title,
            sectionTitleBreadcrumbs: traverseState.sectionTitleBreadcrumbs,
            markdown: serializedMdxContent,
            editThisPageUrl: pageContent?.editThisPageUrl ?? null,
            items: await Promise.all(
                traverseState.curr.items.map(async (item) => {
                    const itemPageContent = pages[item.pageId];
                    return {
                        date: item.date,
                        dateString: moment(item.date).format("MMMM D, YYYY"),
                        markdown: await serializeMdxContent(itemPageContent?.markdown ?? ""),
                        editThisPageUrl: itemPageContent?.editThisPageUrl ?? null,
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
        const serializedMdxContent = await serializeMdxContent(pageContent.markdown);
        const frontmatter = typeof serializedMdxContent === "string" ? {} : serializedMdxContent.frontmatter;
        if (
            pageContent.markdown.includes("EndpointRequestSnippet") ||
            pageContent.markdown.includes("EndpointResponseSnippet")
        ) {
            const resolvedApis = Object.fromEntries(
                await Promise.all(
                    Object.entries(apis).map(async ([apiName, api]) => {
                        const flattenedApiDefinition = flattenApiDefinition(api, ["dummy"]);
                        return [apiName, await resolveApiDefinition(flattenedApiDefinition)];
                    }),
                ),
            );
            return {
                type: "custom-markdown-page",
                fullSlug: traverseState.curr.slug.join("/"),
                title: frontmatter.title ?? traverseState.curr.title,
                sectionTitleBreadcrumbs: traverseState.sectionTitleBreadcrumbs,
                serializedMdxContent,
                editThisPageUrl: pageContent.editThisPageUrl ?? null,
                neighbors,
                apis: resolvedApis,
            };
        }
        return {
            type: "custom-markdown-page",
            fullSlug: traverseState.curr.slug.join("/"),
            title: frontmatter.title ?? traverseState.curr.title,
            sectionTitleBreadcrumbs: traverseState.sectionTitleBreadcrumbs,
            serializedMdxContent,
            editThisPageUrl: pageContent.editThisPageUrl ?? null,
            neighbors,
            apis: {},
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
