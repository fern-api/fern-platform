import { ApiDefinitionHolder } from "@fern-api/fdr-sdk/dist/navigation/ApiDefinitionHolder";
import { collectApiReferences } from "@fern-api/fdr-sdk/dist/navigation/utils/collectApiReferences";
import { convertLoadDocsForUrlResponse } from "@fern-api/fdr-sdk/dist/navigation/utils/convertLoadDocsForUrlResponse";
import { ApiDefinitionResolver, ApiTypeResolver, REGISTRY_SERVICE, type ResolvedRootPackage } from "@fern-ui/ui";
import { NextApiHandler, NextApiResponse } from "next";
import { buildUrlFromApiNode } from "../../../utils/buildUrlFromApi";
import { getXFernHostNode } from "../../../utils/xFernHost";
import { getFeatureFlags } from "./feature-flags";

export const dynamic = "force-dynamic";

const resolveApiHandler: NextApiHandler = async (
    req,
    res: NextApiResponse<Record<string, ResolvedRootPackage> | null>,
) => {
    try {
        if (req.method !== "GET") {
            res.status(400).json(null);
            return;
        }

        const xFernHost = getXFernHostNode(req);
        res.setHeader("host", xFernHost);

        const url = buildUrlFromApiNode(xFernHost, req);
        // eslint-disable-next-line no-console
        console.log("[resolve-api] Loading docs for", url);
        const docsResponse = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url,
        });

        if (!docsResponse.ok) {
            res.status(404).json(null);
            return;
        }

        const docs = docsResponse.body;
        const root = convertLoadDocsForUrlResponse(docsResponse.body);

        const featureFlags = await getFeatureFlags(docs.baseUrl.domain);

        const packagesPromise: Promise<ResolvedRootPackage>[] = [];
        collectApiReferences(root).forEach((apiReference) => {
            const api = docs.definition.apis[apiReference.apiDefinitionId];
            if (api == null) {
                return;
            }
            const holder = ApiDefinitionHolder.create(api);
            const typeResolver = new ApiTypeResolver(api.types);
            const resolved = ApiDefinitionResolver.resolve(
                apiReference,
                holder,
                typeResolver,
                docs.definition.pages,
                undefined,
                featureFlags,
                docs.baseUrl.domain,
            );
            packagesPromise.push(resolved);
        });

        const toRet: Record<string, ResolvedRootPackage> = {};

        const packages = await Promise.all(packagesPromise);
        packages.forEach((p) => {
            toRet[p.api] = p;
        });

        res.status(200).json(toRet);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json(null);
    }
};

export default resolveApiHandler;
