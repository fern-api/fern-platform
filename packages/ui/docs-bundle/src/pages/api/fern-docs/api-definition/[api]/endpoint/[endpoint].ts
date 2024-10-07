import { ApiDefinitionLoader } from "@/server/ApiDefinitionLoader";
import { getXFernHostNode } from "@/server/xfernhost/node";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { NextApiHandler, NextApiResponse } from "next";
import { getFeatureFlags } from "../../../feature-flags";

const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<ApiDefinition.ApiDefinition>) => {
    const xFernHost = getXFernHostNode(req);
    const { api, endpoint } = req.query;
    if (req.method !== "GET" || typeof api !== "string" || typeof endpoint !== "string") {
        res.status(400).end();
        return;
    }

    const flags = await getFeatureFlags(xFernHost);

    // TODO: authenticate the request in FDR
    const apiDefinition = await ApiDefinitionLoader.create(xFernHost, ApiDefinition.ApiDefinitionId(api))
        .withFlags(flags)
        .withPrune({ type: "endpoint", endpointId: ApiDefinition.EndpointId(endpoint) })
        .withResolveDescriptions()
        .load();

    if (!apiDefinition) {
        return res.status(404).end();
    }

    // Cache the response in Vercel's Data Cache for 1 hour, and allow it to be served stale for up to 24 hours
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).json(apiDefinition);
};

export default resolveApiHandler;
