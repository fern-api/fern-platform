import { buildUrl, flattenApiDefinition, getNavigationRoot, type SidebarNode } from "@fern-ui/fdr-utils";
import {
    ApiDefinitionResolver,
    REGISTRY_SERVICE,
    serializeSidebarNodeDescriptionMdx,
    type ResolvedRootPackage,
} from "@fern-ui/ui";
import { NextApiHandler, NextApiResponse } from "next";
import { getXFernHostNode } from "../../../utils/xFernHost";

const resolveApiHandler: NextApiHandler = async (req, res: NextApiResponse<ResolvedRootPackage | null>) => {
    try {
        if (req.method !== "GET") {
            res.status(400).json(null);
            return;
        }

        const xFernHost = getXFernHostNode(req);

        const pathname = req.query.path;
        const api = req.query.api;

        if (pathname == null || typeof pathname !== "string" || api == null || typeof api !== "string") {
            return res.status(400).json(null);
        }

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url: buildUrl({ host: xFernHost, pathname }),
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

        res.status(200).json(
            await ApiDefinitionResolver.resolve(
                apiSection?.title ?? "",
                flattenApiDefinition(apiDefinition, apiSection?.slug ?? [], undefined, docs.body.baseUrl.domain),
                pages,
                undefined,
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
