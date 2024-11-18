import { DocsLoader } from "@/server/DocsLoader";
import { convertToLlmTxtMarkdown } from "@/server/llm-txt-md";
import { removeLeadingSlash } from "@/server/removeLeadingSlash";
import { getDocsDomainNode, getHostNode } from "@/server/xfernhost/node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextApiRequest, NextApiResponse } from "next";

function getStringParam(req: NextApiRequest, param: string): string | undefined {
    const value = req.query[param];
    return typeof value === "string" ? value : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
    const path = getStringParam(req, "path");

    if (path == null) {
        return res.status(400).end();
    }

    if (req.method === "OPTIONS") {
        return res.status(200).setHeader("X-Robots-Tag", "noindex").setHeader("Allow", "OPTIONS, GET").end();
    }

    if (req.method !== "GET") {
        return res.status(405).end();
    }

    const domain = getDocsDomainNode(req);
    const host = getHostNode(req) ?? domain;
    const fern_token = req.cookies[COOKIE_FERN_TOKEN];
    const loader = DocsLoader.for(domain, host, fern_token);

    const root = await loader.root();
    const pages = await loader.pages();

    const pageInfo = getPageInfo(root, FernNavigation.Slug(removeLeadingSlash(path)));

    if (pageInfo == null) {
        return res.status(404).end();
    }

    const page = pages[pageInfo.pageId];

    if (!page) {
        return res.status(404).end();
    }

    res.status(200)
        .setHeader("Content-Type", `text/${pageInfo.pageId.endsWith(".mdx") ? "mdx" : "markdown"}`)
        // prevent search engines from indexing this page
        .setHeader("X-Robots-Tag", "noindex")
        // cannot guarantee that the content won't change, so we only cache for 60 seconds
        .setHeader("Cache-Control", "s-maxage=60")
        .send(convertToLlmTxtMarkdown(page.markdown, pageInfo.nodeTitle));
}

function getPageInfo(
    root: FernNavigation.RootNode | undefined,
    slug: FernNavigation.Slug,
): { pageId: FernNavigation.PageId; nodeTitle: string } | undefined {
    if (root == null) {
        return undefined;
    }

    const foundNode = FernNavigation.utils.findNode(root, slug);
    if (foundNode == null || foundNode.type !== "found" || !FernNavigation.hasMarkdown(foundNode.node)) {
        return undefined;
    }

    const pageId = FernNavigation.getPageId(foundNode.node);
    if (pageId == null) {
        return undefined;
    }

    return {
        pageId,
        nodeTitle: foundNode.node.title,
    };
}
