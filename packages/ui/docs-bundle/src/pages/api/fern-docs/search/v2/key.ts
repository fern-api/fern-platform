import { algoliaAppId, algoliaSearchApikey } from "@/server/env-variables";
import { selectFirst } from "@/server/utils/selectFirst";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import {
    DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
    SEARCH_INDEX,
    getSearchApiKey,
} from "@fern-ui/fern-docs-search-server/algolia";
import { NextApiRequest, NextApiResponse } from "next";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).send("Method not allowed");
    }

    const domain = getDocsDomainNode(req);
    const userToken = getXUserToken(req);

    const apiKey = getSearchApiKey({
        parentApiKey: algoliaSearchApikey(),
        domain,
        roles: [],
        authed: false,
        expiresInSeconds: DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
        searchIndex: SEARCH_INDEX,
        userToken,
    });

    return res.status(200).setHeader("Cache-Control", "no-store").json({
        appId: algoliaAppId(),
        apiKey,
    });
}

function getXUserToken(req: NextApiRequest): string | undefined {
    return selectFirst(req.headers["X-User-Token"]);
}
