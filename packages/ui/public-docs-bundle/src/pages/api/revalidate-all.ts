import { buildUrl } from "@fern-ui/ui";
import { NextApiHandler, NextApiResponse } from "next";
import { loadWithUrl } from "../../utils/loadWithUrl";
import { getAllUrlsFromDocsConfig, toValidPathname } from "./sitemap";

const revalidateAllApiHandler: NextApiHandler = async (req, res: NextApiResponse<void>) => {
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

        const docs = await loadWithUrl(
            buildUrl({
                host: hostWithoutTrailingSlash,
                pathname: toValidPathname(req.query.basePath),
            }),
        );

        if (docs == null) {
            res.status(404).send();
            return;
        }

        const urls = await getAllUrlsFromDocsConfig(
            docs.baseUrl.domain,
            docs.baseUrl.basePath,
            docs.definition.config,
            docs.definition.apis,
        );

        await Promise.all(urls.map((url) => res.revalidate(`/${url}`)));

        res.status(200).send();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).send();
    }
};

export default revalidateAllApiHandler;

export const config = {
    runtime: "edge",
};
