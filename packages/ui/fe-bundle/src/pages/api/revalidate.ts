import { PathResolver } from "@fern-api/fdr-sdk";
import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../../service";

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
            res.setHeader("host", req.headers["x-fern-host"]);
        }

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url,
        });
        if (!docs.ok) {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch docs", docs.error);
            return res.status(500).send("Failed to load docs for: " + url);
        }

        type ApiDefinition = FdrAPI.api.v1.read.ApiDefinition;
        const resolver = new PathResolver({
            definition: {
                apis: docs.body.definition.apis as Record<ApiDefinition["id"], ApiDefinition>,
                docsConfig: docs.body.definition.config,
            },
        });

        // eslint-disable-next-line no-console
        console.log("Finding paths to revalidate");

        const pathsToRevalidate = resolver.getAllSlugsWithLeadingSlash();

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
        // Non-200 revalidations are okay because it correctly updates the page (i.e. if a page is no longer present, it should be revalidated to 404)
        return {
            type: "success",
        };
    }
}

export default handler;
