import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../../service";
import { getPathsToRevalidate } from "../../utils/revalidation/getPathsToRevalidate";

export interface Request {
    url: string;
}

const handler: NextApiHandler = async (req, res) => {
    try {
        const url = req.body?.url;
        const docsConfigId = req.body?.docsConfigId;

        if (url == null) {
            return res.status(400).send("Property 'url' is missing from request.");
        }
        if (typeof url !== "string") {
            return res.status(400).send("Property 'url' is not a string.");
        }

        if (docsConfigId != null && typeof docsConfigId !== "string") {
            return res.status(400).send("Property 'docsConfigId' is not a string.");
        }

        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        if (typeof req.headers["x-fern-host"] === "string") {
            req.headers.host = req.headers["x-fern-host"];
        }

        let pathsToRevalidate: string[] = [];
        if (docsConfigId != null) {
            const docsConfigResponse = await REGISTRY_SERVICE.docs.v2.read.getDocsConfigById(docsConfigId);
            if (!docsConfigResponse.ok) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch docs by config id", docsConfigResponse.error);
                return res.status(500).send("Failed to load docs for: " + docsConfigId);
            }

            // eslint-disable-next-line no-console
            console.log("Finding paths to revalidate");

            pathsToRevalidate = getPathsToRevalidate({
                navigationConfig: docsConfigResponse.body.docsConfig.navigation,
                apis: docsConfigResponse.body.apis,
            });
        } else {
            const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
                url,
            });
            if (!docs.ok) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch docs", docs.error);
                return res.status(500).send("Failed to load docs for: " + url);
            }

            // eslint-disable-next-line no-console
            console.log("Finding paths to revalidate");

            pathsToRevalidate = getPathsToRevalidate({
                navigationConfig: docs.body.definition.config.navigation,
                apis: docs.body.definition.apis,
            });
        }

        // eslint-disable-next-line no-console
        console.log(`Found ${pathsToRevalidate.length} paths to revalidate`);

        const revalidated: string[] = [];
        const failures: string[] = [];
        await Promise.all(
            pathsToRevalidate.map(async (path) => {
                const response = await tryRevalidate(res, path);
                if (response.type === "success") {
                    revalidated.push(path);
                } else {
                    failures.push(path);
                }
            })
        );

        // eslint-disable-next-line no-console
        console.log(`Revalidated all paths with ${revalidated.length} revalidated and ${failures.length} failures`);

        return res.json({ revalidated, failures });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to revalidate", err);
        return res.status(500).send("Failed to revalidate " + (err as Error)?.message);
    }
};

type RevalidateResponse = RevalidateSuccess | RevalidateFailure;

interface RevalidateSuccess {
    type: "success";
}

interface RevalidateFailure {
    type: "failure";
    error: string;
}

async function tryRevalidate(res: NextApiResponse, path: string): Promise<RevalidateResponse> {
    try {
        await res.revalidate(path);
        return {
            type: "success",
        };
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return {
            type: "failure",
            error: (err as Error)?.message ?? "No error message",
        };
    }
}

export default handler;
