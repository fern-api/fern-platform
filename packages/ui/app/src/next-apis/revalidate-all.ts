import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../services/registry";
import { buildUrl } from "../util/buildUrl";
import { getAllUrlsFromDocsConfig, toValidPathname } from "./sitemap";

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

        const urls = await getAllUrlsFromDocsConfig(
            docs.body.baseUrl.domain,
            docs.body.baseUrl.basePath,
            docs.body.definition.config,
            docs.body.definition.apis,
        );

        await Promise.all(urls.map((url) => res.revalidate(`/${url}`)));

        res.status(200).send();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).send();
    }
};
