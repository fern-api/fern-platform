import { DocsLoaderImpl } from "@/server/DocsLoaderImpl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { assertNever, withDefaultProtocol } from "@fern-api/ui-core-utils";
import { DocsLoader } from "@fern-docs/cache";
import { getFrontmatter } from "@fern-docs/mdx";
import { addLeadingSlash, COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { Feed, Item } from "feed";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";

export const revalidate = 60 * 60 * 24;

export async function handleChangelog(
  req: NextRequest,
  { params }: { params: { slug?: string[]; format?: "rss" | "atom" | "json" } }
): Promise<NextResponse> {
  const slug = params.slug ?? [];
  const path = addLeadingSlash(slug.join("/"));
  const format = params.format ?? "rss";

  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);
  const fernToken = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const loader = DocsLoaderImpl.for(domain, host, fernToken);

  const root = await loader.root();

  if (!root) {
    return NextResponse.json(null, { status: 404 });
  }

  const collector = NodeCollector.collect(root);

  const node = collector.slugMap.get(FernNavigation.slugjoin(path));

  if (node?.type !== "changelog") {
    return NextResponse.json(null, { status: 404 });
  }

  const link = urlJoin(withDefaultProtocol(domain), node.slug);

  const feed = new Feed({
    id: link,
    link,
    title: node.title,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    generator: "buildwithfern.com",
  });

  await Promise.all(
    node.children.flatMap((year) => {
      year.children.flatMap((month) => {
        month.children.flatMap(async (entry) => {
          try {
            feed.addItem(await toFeedItem(entry, loader));
          } catch (e) {
            console.error(e);
            // TODO: sentry
          }
        });
      });
    })
  );

  if (format === "json") {
    return new NextResponse(feed.json1(), {
      headers: { "Content-Type": "application/json" },
    });
  } else if (format === "atom") {
    return new NextResponse(feed.atom1(), {
      headers: { "Content-Type": "application/atom+xml" },
    });
  } else {
    return new NextResponse(feed.rss2(), {
      headers: { "Content-Type": "application/rss+xml" },
    });
  }
}

async function toFeedItem(
  entry: FernNavigation.ChangelogEntryNode,
  loader: DocsLoader
): Promise<Item> {
  const item: Item = {
    title: entry.title,
    link: urlJoin(withDefaultProtocol(loader.domain), entry.slug),
    date: new Date(entry.date),
  };

  const markdown = await loader
    .getPage(entry.pageId)
    .then((page) => page?.markdown);
  if (markdown != null) {
    const { data: frontmatter, content } = getFrontmatter(markdown);
    item.description =
      frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt;

    // TODO: content should be converted into HTML markup
    item.content = content;

    try {
      let image: string | undefined;

      // TODO: (rohin) Clean up after safe deploy, but include for back compat
      if (frontmatter.image != null && typeof frontmatter.image === "string") {
        image = frontmatter.image;
      } else if (frontmatter["og:image"] != null) {
        image = await toUrl(frontmatter["og:image"], loader);
      }

      if (image != null) {
        validateExternalUrl(image);
        item.image = { url: image };
      }
    } catch (e) {
      console.error(e);
      // TODO: sentry
    }
  }
  return item;
}

async function toUrl(
  idOrUrl: DocsV1Read.FileIdOrUrl | undefined,
  loader: DocsLoader
): Promise<string | undefined> {
  if (idOrUrl == null) {
    return undefined;
  }
  if (idOrUrl.type === "url") {
    return idOrUrl.value;
  } else if (idOrUrl.type === "fileId") {
    return loader.getFile(idOrUrl.value).then((file) => file?.url);
  } else {
    assertNever(idOrUrl);
  }
}

function validateExternalUrl(url: string): void {
  if (!url.startsWith("https://")) {
    throw new Error(`Invalid external URL: ${url}`);
  }
}
