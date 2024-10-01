import { resolveApiDefinitionDescriptions } from "@/server/resolveApiDefinitionDescriptions";
import { getXFernHostNode } from "@/server/xfernhost/node";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { provideRegistryService } from "@fern-ui/ui";
import { checkViewerAllowedNode } from "@fern-ui/ui/auth";
import { NextApiHandler, NextApiResponse } from "next";
import { getFeatureFlags } from "../../../feature-flags";

const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<ApiDefinition.ApiDefinition>) => {
    const xFernHost = getXFernHostNode(req);
    const { api, webhook } = req.query;
    if (req.method !== "GET" || typeof api !== "string" || typeof webhook !== "string") {
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
        type: "webhook",
        webhookId: ApiDefinition.WebhookId(webhook),
    });

    const transformed = await resolveApiDefinitionDescriptions(xFernHost, pruned, flags);

    return res.status(200).json(transformed);
};

export default resolveApiHandler;
