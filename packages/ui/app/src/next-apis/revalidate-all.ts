import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";
import { flatten } from "lodash-es";
import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../services/registry";
import { isPage, resolveSidebarNodes, SidebarNode } from "../sidebar/types";
import { buildUrl } from "../util/buildUrl";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../util/fern";
import { toValidPathname } from "./sitemap";

export const revalidateAllApiHandler: NextApiHandler = async (req, res: NextApiResponse<void>) => {
    try {
        if (req.method !== "POST") {
            res.status(400).send();
            return;
        }

        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            req.headers.host = xFernHost;
            res.setHeader("host", xFernHost);
        } else {
            res.status(400).send();
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
            res.status(404).send();
            return;
        }

        const docsDefinition = docs.body.definition;
        const basePath = docs.body.baseUrl.basePath;
        const docsConfig = docsDefinition.config;

        const flattenedNavigationConfig = flattenNavigationConfig(
            docsConfig.navigation,
            basePath
                ? basePath
                      .split("/")
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0)
                : [],
        );

        const sidebarNodes = flatten(
            await Promise.all(
                flattenedNavigationConfig.map(
                    async ({ slug, items }) => await resolveSidebarNodes(items, docsDefinition.apis, slug),
                ),
            ),
        );

        const flattenedSidebarNodes = flattenSidebarNodeSlugs(sidebarNodes);

        const urls = flattenedSidebarNodes.map((node) =>
            buildUrl({ host: hostWithoutTrailingSlash, pathname: node.slug.join("/") }),
        );

        await Promise.all(urls.map((url) => res.revalidate(url)));

        res.status(200).send();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).send();
    }
};

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

interface WithSlug {
    slug: string[];
}

function flattenSidebarNodeSlugs(nodes: SidebarNode[]): WithSlug[] {
    return nodes.flatMap((node): WithSlug[] => {
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
