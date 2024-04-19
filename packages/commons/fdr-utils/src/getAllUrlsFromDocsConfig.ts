import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { buildUrl } from "./buildUrl";
import { resolveSidebarNodesRoot } from "./resolver";
import { visitSidebarNodeRaw } from "./visitSidebarNodeRaw";

export function getAllUrlsFromDocsConfig(
    host: string,
    basePath: string | undefined,
    nav: DocsV1Read.NavigationConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): string[] {
    const basePathSlug = basePath != null ? basePath.split("/").filter((t) => t.length > 0) : [];
    const root = resolveSidebarNodesRoot(nav, apis, {}, basePathSlug, host);
    const visitedSlugs: string[] = [];

    visitSidebarNodeRaw(root, (node) => {
        visitedSlugs.push(node.slug.join("/"));
    });

    return Array.from(new Set(visitedSlugs.map((slug) => buildUrl({ host, pathname: slug }))));
}
