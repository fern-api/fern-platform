import { FernNavigation } from "@fern-api/fdr-sdk";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { assertNever } from "@fern-ui/core-utils";
import { getFrontmatter } from "@fern-ui/ui";
import { Feed, Item } from "feed";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { buildUrlFromApiNode } from "../../../utils/buildUrlFromApi";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { getXFernHostNode } from "../../../utils/xFernHost";

export const revalidate = 60 * 60 * 24;

export default async function responseApiHandler(req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
    if (req.method !== "GET") {
        return res.status(400).end();
    }

    let path = req.query["path"];
    const format = req.query["format"] ?? "rss";

    if (typeof path !== "string" || typeof format !== "string") {
        return res.status(400).end();
    }

    if (path.startsWith("/")) {
        path = path.slice(1);
    }

    path = decodeURIComponent(path);

    const xFernHost = getXFernHostNode(req);
    const headers = new Headers();
    headers.set("x-fern-host", xFernHost);

    const url = buildUrlFromApiNode(xFernHost, req);
    const docs = await loadWithUrl(url);

    if (docs == null) {
        return res.status(404).end();
    }

    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs);
    const collector = NodeCollector.collect(root);

    const node = collector.slugMap.get(path);

    if (node?.type !== "changelog") {
        return new NextResponse(null, { status: 404 });
    }

    const link = `https://${xFernHost}/${node.slug}`;

    const feed = new Feed({
        id: link,
        link,
        title: node.title,
        copyright: `All rights reserved ${new Date().getFullYear()}`,
        generator: "buildwithfern.com",
    });

    node.children.forEach((year) => {
        year.children.forEach((month) => {
            month.children.forEach((entry) => {
                const item: Item = {
                    title: entry.title,
                    link: `https://${xFernHost}/${entry.slug}`,
                    date: new Date(entry.date),
                };

                const markdown = docs.definition.pages[entry.pageId].markdown;
                if (markdown != null) {
                    const [frontmatter, content] = getFrontmatter(markdown);
                    item.description = frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt;
                    item.content = content;

                    if (frontmatter.image != null) {
                        item.image = { url: frontmatter.image };
                    } else if (frontmatter["og:image"] != null) {
                        if (frontmatter["og:image"].type === "url") {
                            item.image = { url: frontmatter["og:image"].value };
                        } else if (frontmatter["og:image"].type === "fileId") {
                            const fileId = frontmatter["og:image"].value;
                            const file = docs.definition.files[fileId];
                            if (file != null) {
                                item.image = { url: file };
                            }
                        } else {
                            assertNever(frontmatter["og:image"]);
                        }
                    }
                }

                feed.addItem(item);
            });
        });
    });

    if (format === "json") {
        headers.set("Content-Type", "application/json");
        return res.json(feed.json1());
    } else if (format === "atom") {
        headers.set("Content-Type", "application/atom+xml");
        return res.send(feed.atom1());
    } else {
        headers.set("Content-Type", "application/rss+xml");
        return res.send(feed.rss2());
    }
}
