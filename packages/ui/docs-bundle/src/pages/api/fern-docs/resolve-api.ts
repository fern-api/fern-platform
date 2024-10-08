import { DocsKVCache } from "@/server/DocsCache";
import { getXFernHostNode } from "@/server/xfernhost/node";
import { FdrAPI } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiDefinitionHolder } from "@fern-api/fdr-sdk/navigation";
import { getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { ApiDefinitionResolver, provideRegistryService, type ResolvedRootPackage } from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { NextApiHandler, NextApiResponse } from "next";

export const dynamic = "force-dynamic";

/**
 * This is now deprecated. use /api/fern-docs/api-definition/{apiDefinitionId}/endpoint/{endpointId} instead.
 */
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

        // we're not doing any auth here because api definitions are not authed in FDR.
        const docsResponse = await provideRegistryService().docs.v2.read.getDocsForUrl({
            url: FdrAPI.Url(xFernHost),
        });

        if (!docsResponse.ok) {
            res.status(404).json(null);
            return;
        }

        const docs = docsResponse.body;
        const featureFlags = await getFeatureFlags(docs.baseUrl.domain);

        const root = FernNavigation.utils.toRootNode(
            docsResponse.body,
            featureFlags.isBatchStreamToggleDisabled,
            featureFlags.isApiScrollingDisabled,
        );

        const collector = FernNavigation.NodeCollector.collect(root);

        const serializeMdx = await getMdxBundler(featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote");

        const packagesPromise: Promise<ResolvedRootPackage>[] = [];
        FernNavigation.utils.collectApiReferences(root).forEach((apiReference) => {
            const api = docs.definition.apis[apiReference.apiDefinitionId];
            if (api == null) {
                return;
            }
            const holder = ApiDefinitionHolder.create(api);
            const resolved = ApiDefinitionResolver.resolve(
                collector,
                apiReference,
                holder,
                docs.definition.pages,
                { files: docs.definition.jsFiles },
                featureFlags,
                serializeMdx,
                DocsKVCache.getInstance(xFernHost),
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
