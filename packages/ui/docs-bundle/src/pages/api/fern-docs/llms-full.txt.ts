import { DocsLoader } from "@/server/DocsLoader";
import { getSectionRoot } from "@/server/getSectionRoot";
import { getStringParam } from "@/server/getStringParam";
import { convertToLlmTxtMarkdown } from "@/server/llm-txt-md";
import { getDocsDomainNode, getHostNode } from "@/server/xfernhost/node";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { uniqWith } from "es-toolkit/array";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * This endpoint concatenates the markdown content of all pages in the docs, in the same order as it appears in the sidebar.
 * Duplicates are automatically removed.
 * - hidden and authed nodes are not included
 * - noindexed nodes are not included
 * - API reference pages are not included
 * - the output is markdown-compatible
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
    if (req.method === "OPTIONS") {
        return res.status(200).setHeader("X-Robots-Tag", "noindex").setHeader("Allow", "OPTIONS, GET").end();
    }

    if (req.method !== "GET") {
        return res.status(405).end();
    }

    const path = getStringParam(req, "path") ?? "/";
    const domain = getDocsDomainNode(req);
    const host = getHostNode(req) ?? domain;
    const fern_token = req.cookies[COOKIE_FERN_TOKEN];
    const loader = DocsLoader.for(domain, host, fern_token);

    const root = getSectionRoot(await loader.root(), path);
    const pages = await loader.pages();

    if (root == null) {
        return res.status(404).end();
    }

    const pageInfos: {
        pageId: FernNavigation.PageId;
        nodeTitle: string;
    }[] = [];

    // traverse the tree in a depth-first manner to collect all the nodes that have markdown content
    // in the order that they appear in the sidebar
    FernNavigation.traverseDF(root, (node) => {
        // if the node is hidden or authed, don't include it in the list
        // TODO: include "hidden" nodes in `llms-full.txt`
        if (FernNavigation.hasMetadata(node)) {
            if (node.hidden || node.authed) {
                return SKIP;
            }
        }

        if (FernNavigation.hasMarkdown(node)) {
            // if the node is noindexed, don't include it in the list
            // TODO: include "noindexed" nodes in `llms-full.txt`
            if (node.noindex) {
                return SKIP;
            }

            const pageId = FernNavigation.getPageId(node);
            if (pageId != null) {
                pageInfos.push({
                    pageId,
                    nodeTitle: node.title,
                });
            }
        }

        if (FernNavigation.isApiLeaf(node)) {
            // TODO: construct a markdown-compatible page for the API reference
        }

        return CONTINUE;
    });

    const markdowns = uniqWith(pageInfos, (a, b) => a.pageId === b.pageId)
        .map((pageInfo) => {
            const page = pages[pageInfo.pageId];
            if (page == null) {
                return undefined;
            }
            return convertToLlmTxtMarkdown(
                page.markdown,
                pageInfo.nodeTitle,
                pageInfo.pageId.endsWith(".mdx") ? "mdx" : "md",
            );
        })
        .filter(isNonNullish);

    if (markdowns.length === 0) {
        return res.status(404).end();
    }

    res.status(200)
        .setHeader("Content-Type", "text/plain; charset=utf-8")
        // prevent search engines from indexing this page
        .setHeader("X-Robots-Tag", "noindex")
        // cannot guarantee that the content won't change, so we only cache for 60 seconds
        .setHeader("Cache-Control", "s-maxage=60")
        .send(markdowns.join("\n\n"));

    return;
}
