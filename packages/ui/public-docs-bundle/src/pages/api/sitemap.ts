import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";
import {
    buildUrl,
    isPage,
    isUnversionedTabbedNavigationConfig,
    isVersionedNavigationConfig,
    REGISTRY_SERVICE,
    resolveSidebarNodes,
    type SidebarNode,
} from "@fern-ui/ui";
import { flatten } from "lodash-es";
import { NextApiHandler, NextApiResponse } from "next";

export function toValidPathname(pathname: string | string[] | undefined): string {
    if (typeof pathname === "string") {
        return pathname.startsWith("/") ? pathname.slice(1) : pathname;
    }
    if (Array.isArray(pathname)) {
        return pathname.join("/");
    }
    return "";
}

export const sitemapApiHandler: NextApiHandler = async (req, res: NextApiResponse<string[]>) => {
    try {
        if (req.method !== "GET") {
            res.status(400).json([]);
            return;
        }

        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            req.headers.host = xFernHost;
            res.setHeader("host", xFernHost);
        } else {
            res.status(400).json([]);
            return;
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url: buildUrl({
                host: hostWithoutTrailingSlash,
                pathname: toValidPathname(req.query.basePath),
            }),
        });

        if (!docs.ok) {
            res.status(404).json([]);
            return;
        }

        const urls = await getAllUrlsFromDocsConfig(
            docs.body.baseUrl.domain,
            docs.body.baseUrl.basePath,
            docs.body.definition.config,
            docs.body.definition.apis,
        );

        res.status(200).json(urls);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json([]);
    }
};

export const config = {
    runtime: "edge",
};

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

    const sidebarNodes = flatten(
        await Promise.all(
            flattenedNavigationConfig.map(async ({ slug, items }) => await resolveSidebarNodes(items, apis, slug)),
        ),
    );

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
            return [...node.endpoints, ...node.websockets, ...node.webhooks, node.changelog].filter(isNonNullish);
        }
        return [];
    });
}
