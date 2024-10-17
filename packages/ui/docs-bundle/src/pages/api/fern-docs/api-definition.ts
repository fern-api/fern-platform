import { getDocsDomainNode } from "@/server/xfernhost/node";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { ApiDefinitionLoader } from "@fern-ui/fern-docs-server";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const schema = z.object({
    api: z.string(),
    endpoint: z.string().optional(),
    websocket: z.string().optional(),
    webhook: z.string().optional(),
});

const resolveApiHandler: NextApiHandler = async (
    req: NextApiRequest,
    res: NextApiResponse<ApiDefinition.ApiDefinition>,
) => {
    const xFernHost = getDocsDomainNode(req);
    if (req.method !== "GET") {
        res.status(400).end();
        return;
    }

    const { api, endpoint, websocket, webhook } = schema.parse(req.query);

    const flags = await getFeatureFlags(xFernHost);

    // TODO: pass in other tsx/mdx files to serializeMdx options
    const engine = flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

    // TODO: authenticate the request in FDR
    const loader = ApiDefinitionLoader.create(xFernHost, ApiDefinition.ApiDefinitionId(api))
        .withFlags(flags)
        .withMdxBundler(serializeMdx, engine)
        // .withPrune({ type: "endpoint", endpointId: ApiDefinition.EndpointId(endpoint) })
        .withResolveDescriptions()
        .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN);

    if (endpoint != null) {
        loader.withPrune({ type: "endpoint", endpointId: ApiDefinition.EndpointId(endpoint) });
    }

    if (websocket != null) {
        loader.withPrune({ type: "webSocket", webSocketId: ApiDefinition.WebSocketId(websocket) });
    }

    if (webhook != null) {
        loader.withPrune({ type: "webhook", webhookId: ApiDefinition.WebhookId(webhook) });
    }

    const apiDefinition = await loader.load();

    if (!apiDefinition) {
        return res.status(404).end();
    }

    // Cache the response in Vercel's Data Cache for 1 hour, and allow it to be served stale for up to 24 hours
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).json(apiDefinition);
};

export default resolveApiHandler;
