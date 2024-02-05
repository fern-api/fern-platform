import { FdrAPI, PathResolver } from "@fern-api/fdr-sdk";
import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../services/registry";
import { buildUrl } from "../util/buildUrl";

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

        type ApiDefinition = FdrAPI.api.v1.read.ApiDefinition;
        const resolver = new PathResolver({
            definition: {
                apis: docs.body.definition.apis as Record<ApiDefinition["id"], ApiDefinition>,
                docsConfig: docs.body.definition.config,
                basePath: docs.body.baseUrl.basePath,
            },
        });

        const urls = resolver.getAllSlugsWithBaseURL(docs.body.baseUrl.basePath ?? "/");

        res.status(200).json(
            urls.map((url) => {
                const toRet = url.replace("https://", "");
                if (toRet.length === 0) {
                    return "/";
                }
                return toRet;
            }),
        );
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json([]);
    }
};
