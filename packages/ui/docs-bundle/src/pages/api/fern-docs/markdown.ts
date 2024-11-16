import { DocsLoader } from "@/server/DocsLoader";
import { removeLeadingSlash } from "@/server/removeLeadingSlash";
import { getDocsDomainNode, getHostNode } from "@/server/xfernhost/node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-ui/fern-docs-mdx";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextApiRequest, NextApiResponse } from "next";

export const revalidate = 60;

function getStringParam(req: NextApiRequest, param: string): string | undefined {
    const value = req.query[param];
    return typeof value === "string" ? value : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
    const path = getStringParam(req, "path");
    const format = getStringParam(req, "format");

    if (path == null || format == null) {
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
    if (!root) {
        return res.status(404).end();
    }

    const node = FernNavigation.utils.findNode(root, FernNavigation.Slug(removeLeadingSlash(path)));

    if (node.type !== "found") {
        return res.status(404).end();
    }

    if (!FernNavigation.hasMarkdown(node.node)) {
        return res.status(404).end();
    }

    const pageId = FernNavigation.getPageId(node.node);

    if (!pageId) {
        return res.status(404).end();
    }

    const extension = pageId.endsWith(".mdx") ? "mdx" : "md";

    if (format !== extension) {
        return res.status(404).end();
    }

    const pages = await loader.pages();

    const page = pages[pageId];

    if (!page) {
        return res.status(404).end();
    }

    const { data: frontmatter, content } = getFrontmatter(page.markdown);

    // TODO: parse the first h1 as the title
    const title = frontmatter.title ?? node.node.title;

    res.status(200)
        .setHeader("Content-Type", `text/${extension === "mdx" ? "mdx" : "markdown"}`)
        .setHeader("X-Robots-Tag", "noindex");

    if (node.node.canonicalSlug !== node.node.slug) {
        res.setHeader(
            "Link",
            `<${String(new URL(`/${node.node.canonicalSlug}.${extension}`, withDefaultProtocol(host)))}>; rel="canonical"`,
        );
    }

    return res.send(`# ${title}\n\n${content}`);
}
