import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";
import {
    buildUrl,
    isPage,
    isUnversionedTabbedNavigationConfig,
    isVersionedNavigationConfig,
    resolveSidebarNodes,
    type SidebarNode,
} from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { jsonResponse } from "../../../utils/serverResponse";

export const runtime = "edge";

export function toValidPathname(pathname: string | string[] | undefined | null): string {
    if (typeof pathname === "string") {
        return pathname.startsWith("/") ? pathname.slice(1) : pathname;
    }
    if (Array.isArray(pathname)) {
        return pathname.join("/");
    }
    return "";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    let xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host");
    const headers: Record<string, string> = {};

    if (xFernHost != null) {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        xFernHost = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;
        headers["x-fern-host"] = xFernHost;
    } else {
        return jsonResponse(400, [], headers);
    }

    try {
        const docs = await loadWithUrl(
            buildUrl({ host: xFernHost, pathname: toValidPathname(req.nextUrl.searchParams.get("basePath")) }),
        );

        if (docs == null) {
            return jsonResponse(404, [], headers);
        }

        const urls = await getAllUrlsFromDocsConfig(
            docs.baseUrl.domain,
            docs.baseUrl.basePath,
            docs.definition.config,
            docs.definition.apis,
        );

        return jsonResponse(200, urls, headers);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return jsonResponse(500, [], headers);
    }
}

export async function getAllUrlsFromDocsConfig(
    host: string,
    basePath: string | undefined,
    docsConfig: DocsV1Read.DocsConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): Promise<string[]> {
    const flattenedNavigationConfig = flattenNavigationConfig(
        docsConfig.navigation,
        basePath != null
            ? basePath
                  .split("/")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
            : [],
    );

    const sidebarNodes = (
        await Promise.all(
            flattenedNavigationConfig.map(async ({ slug, items }) => await resolveSidebarNodes(items, apis, slug)),
        )
    ).flatMap((nodes) => nodes);

    const flattenedSidebarNodes = flattenSidebarNodeSlugs(sidebarNodes);

    return flattenedSidebarNodes.map((node) => buildUrl({ host, pathname: node.slug.join("/") }));
}

interface FlattenedNavigationConfig {
    slug: string[];
    items: DocsV1Read.NavigationItem[];
}

function flattenNavigationConfig(nav: DocsV1Read.NavigationConfig, parentSlugs: string[]): FlattenedNavigationConfig[] {
    if (isVersionedNavigationConfig(nav)) {
        return nav.versions.flatMap((version, idx) =>
            idx === 0
                ? [
                      ...flattenNavigationConfig(version.config, [...parentSlugs]), // default version
                      ...flattenNavigationConfig(version.config, [...parentSlugs, version.urlSlug]),
                  ]
                : flattenNavigationConfig(version.config, [...parentSlugs, version.urlSlug]),
        );
    }

    if (isUnversionedTabbedNavigationConfig(nav)) {
        return nav.tabs.map((tab) => ({ slug: [...parentSlugs, tab.urlSlug], items: tab.items }));
    }

    return [{ slug: parentSlugs, items: nav.items }];
}

function flattenSidebarNodeSlugs(nodes: SidebarNode[]): SidebarNode.Page[] {
    return nodes.flatMap((node) => {
        if (node.type === "pageGroup") {
            return node.pages.filter(isPage);
        } else if (node.type === "section") {
            return flattenSidebarNodeSlugs(node.items);
        } else if (node.type === "apiSection") {
            const current = [...node.endpoints, ...node.websockets, ...node.webhooks, node.changelog].filter(
                isNonNullish,
            );
            return [...current, ...flattenSidebarNodeSlugs(node.subpackages)];
        }
        return [];
    });
}
