import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import grayMatter from "gray-matter";
import moment from "moment";
import { SerializedMdxContent, serializeMdxContent } from "../mdx/mdx";
import { findApiSection, isApiPage, isChangelogPage, SidebarNode, visitSidebarNodes } from "../sidebar/types";
import { flattenApiDefinition } from "./flattenApiDefinition";
import type { ResolvedPath } from "./ResolvedPath";
import { resolveApiDefinition } from "./resolver";

async function getExcerpt(
    node: SidebarNode.Page,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<SerializedMdxContent | undefined> {
    try {
        const content = pages[node.id]?.markdown;
        if (content == null) {
            return;
        }
        const frontmatterMatcher: RegExp = /^---\n([\s\S]*?)\n---/;

        const frontmatter = content.match(frontmatterMatcher)?.[0];

        if (frontmatter == null) {
            return undefined;
        }
        const gm = grayMatter(frontmatter);
        if (gm.data.excerpt != null) {
            return await serializeMdxContent(gm.data.excerpt, true);
        }
        return undefined;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error occurred while parsing frontmatter", e);
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
    const traverseState = visitSidebarNodes(sidebarNodes, slug);

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

    if (isApiPage(traverseState.curr)) {
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
    } else if (isChangelogPage(traverseState.curr)) {
        const pageContent = traverseState.curr.pageId != null ? pages[traverseState.curr.pageId] : undefined;
        return {
            type: "changelog-page",
            fullSlug: traverseState.curr.slug.join("/"),
            title: traverseState.curr.title,
            sectionTitleBreadcrumbs: traverseState.sectionTitleBreadcrumbs,
            markdown: pageContent != null ? await serializeMdxContent(pageContent.markdown, true) : null,
            editThisPageUrl: pageContent?.editThisPageUrl ?? null,
            items: await Promise.all(
                traverseState.curr.items.map(async (item) => {
                    const itemPageContent = pages[item.pageId];
                    return {
                        date: item.date,
                        dateString: moment(item.date).format("MMMM D, YYYY"),
                        markdown: await serializeMdxContent(itemPageContent?.markdown ?? "", true),
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
        return {
            type: "custom-markdown-page",
            fullSlug: traverseState.curr.slug.join("/"),
            title: traverseState.curr.title,
            sectionTitleBreadcrumbs: traverseState.sectionTitleBreadcrumbs,
            serializedMdxContent: await serializeMdxContent(pageContent.markdown, true),
            editThisPageUrl: pageContent.editThisPageUrl ?? null,
            neighbors,
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
    const excerpt = await getExcerpt(sidebarNode, pages);
    return {
        fullSlug: sidebarNode.slug.join("/"),
        title: sidebarNode.title,
        excerpt,
    };
}

async function getNeighbors(
    traverseState: ReturnType<typeof visitSidebarNodes>,
    pages: Record<string, DocsV1Read.PageContent>,
): Promise<ResolvedPath.Neighbors> {
    const [prev, next] = await Promise.all([
        getNeighbor(traverseState.prev, pages),
        getNeighbor(traverseState.next, pages),
    ]);
    return { prev, next };
}
