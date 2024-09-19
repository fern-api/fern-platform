import { buildUrlFromApiNode } from "@/server/buildUrlFromApi";
import { getXFernHostNode } from "@/server/xfernhost/node";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiDefinitionHolder } from "@fern-api/fdr-sdk/navigation";
import {
    ApiDefinitionResolver,
    ApiTypeResolver,
    provideRegistryService,
    setMdxBundler,
    type ResolvedRootPackage,
} from "@fern-ui/ui";
import { checkViewerAllowedNode } from "@fern-ui/ui/auth";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { NextApiHandler, NextApiResponse } from "next";
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

        const status = await checkViewerAllowedNode(xFernHost, req);
        if (status >= 400) {
            res.status(status).json(null);
            return;
        }

        res.setHeader("host", xFernHost);

        const url = buildUrlFromApiNode(xFernHost, req);
        // eslint-disable-next-line no-console
        console.log("[resolve-api] Loading docs for", url);
        const docsResponse = await provideRegistryService().docs.v2.read.getDocsForUrl({
            url,
        });

        if (!docsResponse.ok) {
            res.status(404).json(null);
            return;
        }

        const docs = docsResponse.body;
        const featureFlags = await getFeatureFlags(docs.baseUrl.domain);

        const root = FernNavigation.utils.convertLoadDocsForUrlResponse(
            docsResponse.body,
            featureFlags.isBatchStreamToggleDisabled,
            featureFlags.isApiScrollingDisabled,
        );

        const collector = FernNavigation.NodeCollector.collect(root);

        setMdxBundler(await getMdxBundler(featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote"));

        const packagesPromise: Promise<ResolvedRootPackage>[] = [];
        FernNavigation.utils.collectApiReferences(root).forEach((apiReference) => {
            const api = docs.definition.apis[apiReference.apiDefinitionId];
            if (api == null) {
                return;
            }
            const holder = ApiDefinitionHolder.create(api);
            const typeResolver = new ApiTypeResolver(api.types, {
                files: docs.definition.jsFiles,
            });
            const resolved = ApiDefinitionResolver.resolve(
                collector,
                apiReference,
                holder,
                typeResolver,
                docs.definition.pages,
                { files: docs.definition.jsFiles },
                featureFlags,
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
