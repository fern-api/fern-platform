import { DocsLoader } from "@/server/DocsLoader";
import { getMarkdownForPath, getPageNodeForPath } from "@/server/getMarkdownForPath";
import { getStringParam } from "@/server/getStringParam";
import { getDocsDomainNode, getHostNode } from "@/server/xfernhost/node";
import { getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * This endpoint returns the markdown content of a any page in the docs by adding `.md` or `.mdx` to the end of any docs page.
 */

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
    const featureFlags = await getFeatureFlags(domain);
    const loader = DocsLoader.for(domain, host, fern_token).withFeatureFlags(featureFlags);

    const node = getPageNodeForPath(await loader.root(), path);
    if (node == null) {
        return res.status(404).end();
    }

    // If the page is authed, but the user is not authed, return a 403
    if (node.authed && !(await loader.isAuthed())) {
        return res.status(403).end();
    }

    const markdown = await getMarkdownForPath(node, loader, featureFlags);
    if (markdown == null) {
        return res.status(404).end();
    }

    res.status(200)
        .setHeader("Content-Type", `text/${markdown.contentType}`)
        // prevent search engines from indexing this page
        .setHeader("X-Robots-Tag", "noindex")
        // cannot guarantee that the content won't change, so we only cache for 60 seconds
        .setHeader("Cache-Control", "s-maxage=60")
        .send(markdown.content);

    return;
}
