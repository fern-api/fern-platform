import { ApiDefinitionKVCache } from "@/server/ApiDefinitionCache";
import { getXFernHostNode } from "@/server/xfernhost/node";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernDocs from "@fern-api/fdr-sdk/docs";
import { provideRegistryService } from "@fern-ui/ui";
import { checkViewerAllowedNode } from "@fern-ui/ui/auth";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { NextApiHandler, NextApiResponse } from "next";
import { getFeatureFlags } from "../../../feature-flags";

const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<ApiDefinition.ApiDefinition>) => {
    const xFernHost = getXFernHostNode(req);
    const { api, endpoint } = req.query;
    if (req.method !== "GET" || typeof api !== "string" || typeof endpoint !== "string") {
        res.status(400).end();
        return;
    }

    const status = await checkViewerAllowedNode(xFernHost, req);
    if (status >= 400) {
        res.status(status).end();
        return;
    }

    const apiDefinitionId = ApiDefinition.ApiDefinitionId(api);
    const v1 = await provideRegistryService().api.v1.read.getApi(apiDefinitionId);

    if (!v1.ok) {
        // eslint-disable-next-line no-console
        console.error(v1.error);
        if (v1.error.error === "ApiDoesNotExistError") {
            res.status(404).end();
        } else {
            res.status(500).end();
        }
        return;
    }

    const flags = await getFeatureFlags(xFernHost);
    const definition = ApiDefinition.ApiDefinitionV1ToLatest.from(v1.body, flags).migrate();

    const pruned = ApiDefinition.prune(definition, {
        type: "endpoint",
        endpointId: ApiDefinition.EndpointId(endpoint),
    });

    const cache = ApiDefinitionKVCache.getInstance(xFernHost, apiDefinitionId);

    // TODO: pass in other tsx/mdx files to serializeMdx options
    const engine = flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

    // TODO: batch resolved descriptions to avoid multiple round-trip requests to KV
    const cachedTransformer = (description: FernDocs.MarkdownText, key: string) => {
        return cache.resolveDescription(description, `${engine}/${key}`, (description) => serializeMdx(description));
    };

    const transformed = await ApiDefinition.Transformer.descriptions(cachedTransformer).apiDefinition(pruned);

    return res.status(200).json(transformed);
};

export default resolveApiHandler;
