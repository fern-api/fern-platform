import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { buildUrl } from "./buildUrl";
import { resolveSidebarNodesRoot } from "./resolver";
import { visitSidebarNodeRaw } from "./visitSidebarNodeRaw";

export function getAllUrlsFromDocsConfig(
    host: string,
    basePath: string | undefined,
    docsConfig: DocsV1Read.DocsConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): string[] {
    const root = resolveSidebarNodesRoot(docsConfig.navigation, apis, basePath);
    const visitedSlugs: string[] = [];

    visitSidebarNodeRaw(root, (node) => {
        visitedSlugs.push(node.slug.join("/"));
    });

    return Array.from(new Set(visitedSlugs.map((slug) => buildUrl({ host, pathname: slug }))));
}
