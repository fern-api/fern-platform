import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
// import { resolveSidebarNodesRoot } from "./resolver";

export function getAllUrlsFromDocsConfig(
    _host: string,
    _basePath: string | undefined,
    _nav: DocsV1Read.NavigationConfig,
    _apis: Record<string, APIV1Read.ApiDefinition>,
): string[] {
    return [];
    // const basePathSlug = basePath != null ? basePath.split("/").filter((t) => t.length > 0) : [];
    // const root = resolveSidebarNodesRoot(nav, apis, {}, basePathSlug, host);
    // const visitedSlugs: string[] = [];

    // visitSidebarNodeRaw(root, (node) => {
    //     visitedSlugs.push(urljoin(...node.slug));
    // });

    // return Array.from(new Set(visitedSlugs.map((slug) => urljoin(host, slug))));
}
