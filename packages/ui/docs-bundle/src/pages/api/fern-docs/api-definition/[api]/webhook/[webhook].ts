import { ApiDefinitionLoader } from "@/server/ApiDefinitionLoader";
import { checkViewerAllowedNode } from "@/server/auth/checkViewerAllowed";
import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { getXFernHostNode } from "@/server/xfernhost/node";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { NextApiHandler, NextApiResponse } from "next";
import { getFeatureFlags } from "../../../feature-flags";

const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<ApiDefinition.ApiDefinition>) => {
    const xFernHost = getXFernHostNode(req);
    const { api, webhook } = req.query;
    if (req.method !== "GET" || typeof api !== "string" || typeof webhook !== "string") {
        res.status(400).end();
        return;
    }

    const auth = await getAuthEdgeConfig(xFernHost);
    const status = await checkViewerAllowedNode(auth, req);
    if (status >= 400) {
        res.status(status).end();
        return;
    }

    const flags = await getFeatureFlags(xFernHost);
    const apiDefinition = await ApiDefinitionLoader.create(xFernHost, ApiDefinition.ApiDefinitionId(api))
        .withFlags(flags)
        .withPrune({ type: "webhook", webhookId: ApiDefinition.WebhookId(webhook) })
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
