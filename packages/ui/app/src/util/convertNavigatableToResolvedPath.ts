import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import moment from "moment";
import { findApiSection, isApiPage, isChangelogPage, SidebarNode, visitSidebarNodes } from "../sidebar/types";
import { flattenApiDefinition } from "./flattenApiDefinition";
import { serializeMdxContent } from "./mdx";
import type { ResolvedPath } from "./ResolvedPath";
import { resolveApiDefinition } from "./resolver";

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

    const neighbors = {
        prev:
            traverseState.prev != null
                ? { fullSlug: traverseState.prev.slug.join("/"), title: traverseState.prev.title }
                : null,
        next:
            traverseState.next != null
                ? { fullSlug: traverseState.next.slug.join("/"), title: traverseState.next.title }
                : null,
    };

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
