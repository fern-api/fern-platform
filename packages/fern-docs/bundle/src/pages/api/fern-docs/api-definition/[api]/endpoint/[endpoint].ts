import { getAuthStateNode } from "@/server/auth/getAuthStateNode";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { ApiDefinitionLoader } from "@fern-docs/cache";
import { getFeatureFlags } from "@fern-docs/edge-config";
import { getMdxBundler } from "@fern-docs/ui/bundlers";
import { NextApiHandler, NextApiResponse } from "next";

const resolveApiHandler: NextApiHandler = async (
    req,
    res: NextApiResponse<ApiDefinition.ApiDefinition>
) => {
    const { api, endpoint } = req.query;
    if (
        req.method !== "GET" ||
        typeof api !== "string" ||
        typeof endpoint !== "string"
    ) {
        res.status(400).end();
        return;
    }

    // TODO: this auth needs to be more granular: the user should only have access to this api definition if
    // - the api definition belongs to this org
    // - the user has view access to the the api definition based on their roles
    const authState = await getAuthStateNode(req);

    if (!authState.ok) {
        return res.status(authState.authed ? 403 : 401).end();
    }

    const flags = await getFeatureFlags(authState.domain);

    // TODO: pass in other tsx/mdx files to serializeMdx options
    const engine = flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

    // TODO: authenticate the request in FDR
    const apiDefinition = await ApiDefinitionLoader.create(
        authState.domain,
        ApiDefinition.ApiDefinitionId(api)
    )
        .withFlags(flags)
        .withMdxBundler(serializeMdx, engine)
        .withPrune({
            type: "endpoint",
            endpointId: ApiDefinition.EndpointId(endpoint),
        })
        .withResolveDescriptions()
        .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
        .load();

    if (!apiDefinition) {
        return res.status(404).end();
    }

    // Cache the response in Vercel's Data Cache for 1 hour, and allow it to be served stale for up to 24 hours
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).json(apiDefinition);
};

export default resolveApiHandler;
