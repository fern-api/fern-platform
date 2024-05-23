import { resolveSidebarNodesRoot, visitSidebarNodeRaw } from "@fern-ui/fdr-utils";
import { ApiDefinitionResolver, REGISTRY_SERVICE, type ResolvedRootPackage } from "@fern-ui/ui";
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

        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            req.headers.host = xFernHost;
            res.setHeader("host", xFernHost);
        } else {
            res.status(400).json(null);
            return;
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;
        const fullUrl = req.url;

        if (fullUrl == null) {
            res.status(400).json(null);
            return;
        }

        const maybePathName = fullUrl.split("/api/fern-docs/resolve-api")[0] ?? "";
        const pathname = maybePathName.startsWith("/") ? maybePathName : `/${maybePathName}`;
        const url = `${hostWithoutTrailingSlash}${pathname}`;
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
        const docsDefinition = docs.definition;
        const docsConfig = docsDefinition.config;

        const basePathSlug =
            docs.baseUrl.basePath != null ? docs.baseUrl.basePath.split("/").filter((t) => t.length > 0) : [];

        const root = resolveSidebarNodesRoot(
            docsConfig.navigation,
            docs.definition.apis,
            docs.definition.pages,
            basePathSlug,
            docs.baseUrl.domain,
        );

        const entryPromises: Promise<[string, ResolvedRootPackage]>[] = [];

        const featureFlags = await getFeatureFlags(docs.baseUrl.domain);

        visitSidebarNodeRaw(root, (node) => {
            if (node.type === "apiSection" && node.flattenedApiDefinition != null) {
                const entry = ApiDefinitionResolver.resolve(
                    node.title,
                    node.flattenedApiDefinition,
                    docsDefinition.pages,
                    undefined,
                    featureFlags,
                    docs.baseUrl.domain,
                ).then((resolved) => [node.api, resolved] as [string, ResolvedRootPackage]);
                entryPromises.push(entry);
                return "skip";
            }
            return undefined;
        });

        res.status(200).json(Object.fromEntries(await Promise.all(entryPromises)));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json(null);
    }
};

export default resolveApiHandler;

// function findApiSection(api: string, sidebarNodes: SidebarNode[]): SidebarNode.ApiSection | undefined {
//     for (const node of sidebarNodes) {
//         if (node.type === "apiSection" && node.api === api) {
//             return node;
//         } else if (node.type === "section") {
//             const found = findApiSection(api, node.items);
//             if (found != null) {
//                 return found;
//             }
//         }
//     }
//     return undefined;
// }
