import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { removeLeadingSlash } from "@fern-docs/utils";

import { createCachedDocsLoader } from "@/server/docs-loader";
import {
  getMarkdownForPath,
  getPageNodeForPath,
} from "@/server/getMarkdownForPath";
import { MARKDOWN_PATTERN } from "@/server/patterns";

/**
 * This endpoint returns the markdown content of any page in the docs by adding `.md` or `.mdx` to the end of any docs page.
 */

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const { host, domain } = await props.params;

  const path = req.nextUrl.pathname;
  const slug = path.replace(MARKDOWN_PATTERN, "");
  const cleanSlug = removeLeadingSlash(slug);

  const loader = await createCachedDocsLoader(host, domain);
  const node = getPageNodeForPath(await loader.getRoot(), cleanSlug);

  if (node == null) {
    console.error(`[${domain}] Node not found: ${path}`);
    notFound();
  }

  // If the page is authed, but the user is not authed, return a 403
  if (node.authed) {
    return new NextResponse(null, { status: 403 });
  }

  const markdown = await getMarkdownForPath(node, loader);
  if (markdown == null) {
    console.error(`[${domain}] Markdown not found: ${path}`);
    notFound();
  }

  return new NextResponse(markdown.content, {
    status: 200,
    headers: {
      "Content-Type": `text/${markdown.contentType}`,
      "X-Robots-Tag": "noindex", // prevent search engines from indexing this page
      "Cache-Control": "s-maxage=60", // cannot guarantee that the content won't change, so we only cache for 60 seconds
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Robots-Tag": "noindex",
      Allow: "OPTIONS, GET",
    },
  });
}
