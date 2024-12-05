import { algoliaAppId } from "@/server/env-variables";
import { selectFirst } from "@/server/utils/selectFirst";
import { toArray } from "@/server/utils/toArray";
import { fetchFacetValues } from "@fern-ui/fern-docs-search-server/algolia";
import { HEADER_X_ALGOLIA_API_KEY } from "@fern-ui/fern-docs-utils";
import { algoliasearch } from "algoliasearch";
import { NextApiRequest, NextApiResponse } from "next/types";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).send("Method not allowed");
    }

    const filters = toArray(req.query.filters);
    const apiKey = selectFirst(req.headers[HEADER_X_ALGOLIA_API_KEY]);

    if (!apiKey) {
        return res.status(400).send(`${HEADER_X_ALGOLIA_API_KEY} is required`);
    }

    return res.json(await fetchFacetValues({ filters, client: algoliasearch(algoliaAppId(), apiKey) }));
}
