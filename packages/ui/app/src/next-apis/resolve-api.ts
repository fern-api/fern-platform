import { PathResolver } from "@fern-api/fdr-sdk";
import { NextApiHandler, NextApiResponse } from "next";
import { getVersionAndTabSlug } from "../next-app/DocsPage";
import { REGISTRY_SERVICE } from "../services/registry";
import { flattenApiDefinition, FlattenedApiDefinition } from "../util/flattenApiDefinition";

export const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<FlattenedApiDefinition | null>) => {
    try {
        if (req.method !== "GET") {
            res.status(400).json(null);
            return;
        }

        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            req.headers.host = xFernHost;
            res.setHeader("host", xFernHost);
        } else {
            res.status(400).json(null);
            return;
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;
        const maybePathName = req.query.path;
        const api = req.query.api;
        const apiSectionSlug = req.query.slug;

        if (
            maybePathName == null ||
            typeof maybePathName !== "string" ||
            api == null ||
            typeof api !== "string" ||
            (apiSectionSlug != null && typeof apiSectionSlug !== "string")
        ) {
            return res.status(400).json(null);
        }

        const pathname = maybePathName.startsWith("/") ? maybePathName : `/${maybePathName}`;

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url: `${hostWithoutTrailingSlash}${pathname}`,
        });

        if (!docs.ok) {
            res.status(404).json(null);
            return;
        }

        const docsDefinition = docs.body.definition;
        const basePath = docs.body.baseUrl.basePath;

        const apiDefinition = docsDefinition.apis[api];

        if (apiDefinition == null) {
            res.status(404).json(null);
            return;
        }

        const { apis, config: docsConfig } = docsDefinition;
        const resolver = new PathResolver({ definition: { apis, docsConfig, basePath } });

        const versionAndTabSlug = getVersionAndTabSlug(
            pathname.slice(1).split("/"),
            basePath,
            docs.body.definition.config.navigation,
        );

        const navigatable = resolver.resolveNavigatable(pathname.slice(1));

        if (navigatable == null || versionAndTabSlug == null) {
            res.status(404).json(null);
            return;
        }

        if (apiSectionSlug != null) {
            versionAndTabSlug.push(apiSectionSlug);
        }

        res.status(200).json(flattenApiDefinition(apiDefinition, versionAndTabSlug));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json(null);
    }
};
