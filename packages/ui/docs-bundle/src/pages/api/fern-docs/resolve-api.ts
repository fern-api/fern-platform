import { flattenApiDefinition, getNavigationRoot, type SidebarNode } from "@fern-ui/fdr-utils";
import {
    ApiDefinitionResolver,
    REGISTRY_SERVICE,
    serializeSidebarNodeDescriptionMdx,
    type ResolvedRootPackage,
} from "@fern-ui/ui";
import { NextApiHandler, NextApiResponse } from "next";
import { getFeatureFlags } from "./feature-flags";

const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<ResolvedRootPackage | null>) => {
    try {
        if (req.method !== "GET") {
            res.status(400).json(null);
            return;
        }

        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            req.headers.host = xFernHost;
            res.setHeader("host", xFernHost);
        } else {
            res.status(400).json(null);
            return;
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;
        const maybePathName = req.query.path;
        const api = req.query.api;

        if (maybePathName == null || typeof maybePathName !== "string" || api == null || typeof api !== "string") {
            return res.status(400).json(null);
        }

        const pathname = maybePathName.startsWith("/") ? maybePathName : `/${maybePathName}`;
        const url = `${hostWithoutTrailingSlash}${pathname}`;
        // eslint-disable-next-line no-console
        console.log("[resolve-api] Loading docs for", url);
        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url,
        });

        if (!docs.ok) {
            res.status(404).json(null);
            return;
        }

        const docsDefinition = docs.body.definition;
        const basePath = docs.body.baseUrl.basePath;
        const pages = docs.body.definition.pages;

        const apiDefinition = docsDefinition.apis[api];

        if (apiDefinition == null) {
            res.status(404).json(null);
            return;
        }

        const navigation = getNavigationRoot(
            pathname.slice(1).split("/"),
            docs.body.baseUrl.domain,
            basePath,
            docsDefinition.config.navigation,
            docsDefinition.apis,
            pages,
        );

        if (navigation == null || navigation.type === "redirect") {
            res.status(404).json(null);
            return;
        }

        const sidebarNodes = await Promise.all(
            navigation.found.sidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)),
        );

        const apiSection = findApiSection(api, sidebarNodes);

        const featureFlags = await getFeatureFlags(docs.body.baseUrl.domain);

        res.status(200).json(
            await ApiDefinitionResolver.resolve(
                apiSection?.title ?? "",
                flattenApiDefinition(apiDefinition, apiSection?.slug ?? [], undefined, docs.body.baseUrl.domain),
                pages,
                undefined,
                featureFlags,
            ),
        );
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json(null);
    }
};

export default resolveApiHandler;

function findApiSection(api: string, sidebarNodes: SidebarNode[]): SidebarNode.ApiSection | undefined {
    for (const node of sidebarNodes) {
        if (node.type === "apiSection" && node.api === api) {
            return node;
        } else if (node.type === "section") {
            const found = findApiSection(api, node.items);
            if (found != null) {
                return found;
            }
        }
    }
    return undefined;
}
