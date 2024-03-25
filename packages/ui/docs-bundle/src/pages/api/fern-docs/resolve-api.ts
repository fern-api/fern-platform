import { getNavigationRoot, type SidebarNode } from "@fern-ui/fdr-utils";
import {
    flattenApiDefinition,
    REGISTRY_SERVICE,
    resolveApiDefinition,
    serializeSidebarNodeDescriptionMdx,
    type ResolvedRootPackage,
} from "@fern-ui/ui";
import { NextApiHandler, NextApiResponse } from "next";

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

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url: `${hostWithoutTrailingSlash}${pathname}`,
        });

        if (!docs.ok) {
            res.status(404).json(null);
            return;
        }

        const docsDefinition = docs.body.definition;
        const basePath = docs.body.baseUrl.basePath;

        const apiDefinition = docsDefinition.apis[api];

        if (apiDefinition == null) {
            res.status(404).json(null);
            return;
        }

        const navigation = getNavigationRoot(
            pathname.slice(1).split("/"),
            basePath,
            docsDefinition.config.navigation,
            docsDefinition.apis,
        );

        if (navigation == null || navigation.type === "redirect") {
            res.status(404).json(null);
            return;
        }

        const sidebarNodes = await Promise.all(
            navigation.found.sidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)),
        );

        const apiSectionSlug = findApiSection(api, sidebarNodes)?.slug;

        res.status(200).json(await resolveApiDefinition(flattenApiDefinition(apiDefinition, apiSectionSlug ?? [])));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json(null);
    }
};

export default resolveApiHandler;

function findApiSection(api: string, sidebarNodes: SidebarNode[]): SidebarNode | undefined {
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
