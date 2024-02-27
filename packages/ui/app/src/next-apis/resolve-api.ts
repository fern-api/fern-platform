import { PathResolver } from "@fern-api/fdr-sdk";
import { NextApiHandler, NextApiResponse } from "next";
import { getVersionAndTabSlug } from "../next-app/DocsPage";
import { REGISTRY_SERVICE } from "../services/registry";
import {
    crawlResolvedNavigationItemApiSections,
    ResolvedNavigationItemApiSection,
    resolveNavigationItems,
} from "../util/resolver";

export const resolveApiHandler: NextApiHandler = async (
    req,
    res: NextApiResponse<ResolvedNavigationItemApiSection[]>,
) => {
    try {
        if (req.method !== "GET") {
            res.status(400).json([]);
            return;
        }

        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            req.headers.host = xFernHost;
            res.setHeader("host", xFernHost);
        } else {
            res.status(400).json([]);
            return;
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;
        const maybePathName = req.query.path;

        if (maybePathName == null || typeof maybePathName !== "string") {
            return res.status(400).json([]);
        }

        const pathname = maybePathName.startsWith("/") ? maybePathName : `/${maybePathName}`;

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url: `${hostWithoutTrailingSlash}${pathname}`,
        });

        if (!docs.ok) {
            res.status(404).json([]);
            return;
        }

        const docsDefinition = docs.body.definition;
        const basePath = docs.body.baseUrl.basePath;

        const { apis, config: docsConfig } = docsDefinition;
        const resolver = new PathResolver({ definition: { apis, docsConfig, basePath } });

        const navigatable = resolver.resolveNavigatable(pathname.slice(1));

        if (navigatable == null) {
            res.status(404).json([]);
            return;
        }

        const unresolvedNavigationItems =
            navigatable.context.type === "versioned-tabbed" || navigatable.context.type === "unversioned-tabbed"
                ? navigatable.context.tab.items
                : navigatable.context.navigationConfig.items;

        const versionAndTabSlug = getVersionAndTabSlug(basePath, navigatable);
        const apiSections = crawlResolvedNavigationItemApiSections(
            await resolveNavigationItems(unresolvedNavigationItems ?? [], apis, versionAndTabSlug),
        );

        res.status(200).json(apiSections);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json([]);
    }
};
