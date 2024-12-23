import { DocsLoader } from "@/server/DocsLoader";
import {
  getMarkdownForPath,
  getPageNodeForPath,
} from "@/server/getMarkdownForPath";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { getFeatureFlags } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN, addLeadingSlash } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * This endpoint returns the markdown content of any page in the docs by adding `.md` or `.mdx` to the end of any docs page.
 */

export async function handleMarkdown(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
): Promise<NextResponse> {
  const slug = params.slug ?? [];
  const path = addLeadingSlash(slug.join("/"));
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);
  const fern_token = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const featureFlags = await getFeatureFlags(domain);
  const loader = DocsLoader.for(domain, host, fern_token).withFeatureFlags(
    featureFlags
  );

  const node = getPageNodeForPath(await loader.root(), path);
  console.log(path, node);
  if (node == null) {
    notFound();
  }

  // If the page is authed, but the user is not authed, return a 403
  if (node.authed && !(await loader.isAuthed())) {
    return new NextResponse(null, { status: 403 });
  }

  const markdown = await getMarkdownForPath(node, loader, featureFlags);
  if (markdown == null) {
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
