import { DocsLoader } from "@/server/DocsLoader";
import { getXFernHostNode } from "@/server/xfernhost/node";
import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { assertNever } from "@fern-api/ui-core-utils";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { getFrontmatter } from "@fern-ui/ui";
import { Feed, Item } from "feed";
import { NextApiRequest, NextApiResponse } from "next";

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

    const fernToken = req.cookies[COOKIE_FERN_TOKEN];
    const loader = DocsLoader.for(xFernHost, fernToken);

    const root = await loader.root();

    if (!root) {
        return res.status(404).end();
    }

    const collector = NodeCollector.collect(root);

    const slug = FernNavigation.slugjoin(decodeURIComponent(path));
    const node = collector.slugMap.get(slug);

    if (node?.type !== "changelog") {
        return res.status(404).end();
    }

    const link = `https://${xFernHost}/${node.slug}`;

    const feed = new Feed({
        id: link,
        link,
        title: node.title,
        copyright: `All rights reserved ${new Date().getFullYear()}`,
        generator: "buildwithfern.com",
    });

    const pages = await loader.pages();
    const files = await loader.files();

    node.children.forEach((year) => {
        year.children.forEach((month) => {
            month.children.forEach((entry) => {
                try {
                    feed.addItem(toFeedItem(entry, xFernHost, pages, files));
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    // TODO: sentry
                }
            });
        });
    });

    const headers = new Headers();

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
    pages: Record<DocsV1Read.PageId, DocsV1Read.PageContent>,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): Item {
    const item: Item = {
        title: entry.title,
        link: `https://${xFernHost}/${entry.slug}`,
        date: new Date(entry.date),
    };

    const markdown = pages[entry.pageId]?.markdown;
    if (markdown != null) {
        const { data: frontmatter, content } = getFrontmatter(markdown);
        item.description = frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt;

        // TODO: content should be converted into HTML markup
        item.content = content;

        try {
            let image: string | undefined;

            // TODO: (rohin) Clean up after safe deploy, but include for back compat
            if (frontmatter.image != null && typeof frontmatter.image === "string") {
                image = frontmatter.image;
            } else if (frontmatter["og:image"] != null) {
                image = toUrl(frontmatter["og:image"], files);
            }

            if (image != null) {
                validateExternalUrl(image);
                item.image = { url: image };
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            // TODO: sentry
        }
    }
    return item;
}

function toUrl(
    idOrUrl: DocsV1Read.FileIdOrUrl | undefined,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): string | undefined {
    if (idOrUrl == null) {
        return undefined;
    }
    if (idOrUrl.type === "url") {
        return idOrUrl.value;
    } else if (idOrUrl.type === "fileId") {
        return files[idOrUrl.value]?.url;
    } else {
        assertNever(idOrUrl);
    }
}

function validateExternalUrl(url: string): void {
    if (!url.startsWith("https://")) {
        throw new Error(`Invalid external URL: ${url}`);
    }
}
