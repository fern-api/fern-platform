import { unstable_cacheTag as cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { Feed, Item } from "feed";
import urlJoin from "url-join";

import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { assertNever, withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-docs/mdx";
import { COOKIE_FERN_TOKEN, addLeadingSlash } from "@fern-docs/utils";

import { DocsLoader } from "@/server/DocsLoader";
import { getHostEdge } from "@/server/xfernhost/edge";

const FORMATS = ["rss", "atom", "json"] as const;
type Format = (typeof FORMATS)[number];

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ domain: string }> }
): Promise<NextResponse> {
  "use cache";

  const { domain } = await props.params;

  cacheTag(domain);

  const path = addLeadingSlash(req.nextUrl.searchParams.get("slug") ?? "");
  const format = getFormat(req);

  const host = getHostEdge(req);
  const fernToken = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
  const loader = DocsLoader.for(domain, host, fernToken);

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

  const pages = await loader.pages();
  const files = await loader.files();

  node.children.forEach((year) => {
    year.children.forEach((month) => {
      month.children.forEach((entry) => {
        try {
          feed.addItem(toFeedItem(entry, domain, pages, files));
        } catch (e) {
          console.error(e);
          // TODO: sentry
        }
      });
    });
  });

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

function isFormat(format: string): format is Format {
  return FORMATS.includes(format as Format);
}

function getFormat(req: NextRequest): Format {
  const format = req.nextUrl.searchParams.get("format");
  if (!format || !isFormat(format)) {
    return "rss";
  }
  return format;
}

function toFeedItem(
  entry: FernNavigation.ChangelogEntryNode,
  domain: string,
  pages: Record<DocsV1Read.PageId, DocsV1Read.PageContent>,
  files: Record<DocsV1Read.FileId, DocsV1Read.File_>
): Item {
  const item: Item = {
    title: entry.title,
    link: urlJoin(withDefaultProtocol(domain), entry.slug),
    date: new Date(entry.date),
  };

  const markdown = pages[entry.pageId]?.markdown;
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
        image = toUrl(frontmatter["og:image"], files);
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

function toUrl(
  idOrUrl: DocsV1Read.FileIdOrUrl | undefined,
  files: Record<DocsV1Read.FileId, DocsV1Read.File_>
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
