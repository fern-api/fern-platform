import { DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { assertNever } from "@fern-ui/core-utils";
import { getFrontmatter } from "@fern-ui/ui";
import { Feed, Item } from "feed";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { buildUrlFromApiNode } from "../../../utils/buildUrlFromApi";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { getXFernHostNode } from "../../../utils/xFernHost";
// eslint-disable-next-line import/no-internal-modules
import { checkViewerAllowedNode } from "@fern-ui/ui/auth";
import * as Sentry from "@sentry/nextjs";

export const revalidate = 60 * 60 * 24;

export default async function responseApiHandler(req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
    if (req.method !== "GET") {
        return res.status(405).end();
    }

    const path = req.query["path"];
    const format = req.query["format"] ?? "rss";

    if (typeof path !== "string" || typeof format !== "string") {
        return res.status(400).end();
    }

    const xFernHost = getXFernHostNode(req);

    const status = await checkViewerAllowedNode(xFernHost, req);
    if (status >= 400) {
        return res.status(status).end();
    }

    const headers = new Headers();
    headers.set("x-fern-host", xFernHost);

    const url = buildUrlFromApiNode(xFernHost, req);
    const docs = await loadWithUrl(url);

    if (docs == null) {
        return res.status(404).end();
    }

    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs);
    const collector = NodeCollector.collect(root);

    const slug = FernNavigation.utils.slugjoin(decodeURIComponent(path));
    const node = collector.slugMap.get(slug);

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
                try {
                    feed.addItem(toFeedItem(entry, xFernHost, docs.definition.pages, docs.definition.files));
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);

                    // this error is logged to Sentry because a changelog entry will be missing from the feed
                    Sentry.captureException(e, { level: "error" });
                }
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

function toFeedItem(
    entry: FernNavigation.ChangelogEntryNode,
    xFernHost: string,
    pages: Record<string, DocsV1Read.PageContent>,
    files: Record<string, DocsV1Read.FileId>,
): Item {
    const item: Item = {
        title: entry.title,
        link: `https://${xFernHost}/${entry.slug}`,
        date: new Date(entry.date),
    };

    const markdown = pages[entry.pageId].markdown;
    if (markdown != null) {
        const { data: frontmatter, content } = getFrontmatter(markdown);
        item.description = frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt;

        // TODO: content should be converted into HTML markup
        item.content = content;

        try {
            let image: string | undefined;
            if (frontmatter.image != null) {
                // item.image = { url: frontmatter.image };
                image = frontmatter.image;
            } else if (frontmatter["og:image"] != null) {
                if (frontmatter["og:image"].type === "url") {
                    // item.image = { url: frontmatter["og:image"].value };
                    image = frontmatter["og:image"].value;
                } else if (frontmatter["og:image"].type === "fileId") {
                    const fileId = frontmatter["og:image"].value;
                    const file = files[fileId];
                    if (file != null) {
                        // item.image = { url: file };
                        image = file;
                    }
                } else {
                    assertNever(frontmatter["og:image"]);
                }
            }

            if (image != null) {
                validateExternalUrl(image);
                item.image = { url: image };
            }
        } catch (e) {
            // this is not a critical issue—— just log it
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }
    return item;
}

function validateExternalUrl(url: string): void {
    if (!url.startsWith("https://")) {
        throw new Error(`Invalid external URL: ${url}`);
    }
}
