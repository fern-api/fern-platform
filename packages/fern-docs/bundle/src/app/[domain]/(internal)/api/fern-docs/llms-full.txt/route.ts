import { unstable_cacheLife, unstable_cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { uniqBy } from "es-toolkit/array";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { getEdgeFlags } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN, addLeadingSlash } from "@fern-docs/utils";

import { DocsLoader } from "@/server/DocsLoader";
import { getMarkdownForPath } from "@/server/getMarkdownForPath";
import { getSectionRoot } from "@/server/getSectionRoot";
import { getHostEdge } from "@/server/xfernhost/edge";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ domain: string }> }
): Promise<NextResponse> {
  "use cache";

  const { domain } = await props.params;

  unstable_cacheTag(domain);
  unstable_cacheLife("days");

  const path = addLeadingSlash(req.nextUrl.searchParams.get("slug") ?? "");
  const host = getHostEdge(req);
  const fern_token = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
  const edgeFlags = await getEdgeFlags(domain);
  const loader = DocsLoader.for(domain, host, fern_token).withEdgeFlags(
    edgeFlags
  );

  const root = getSectionRoot(await loader.root(), path);

  if (root == null) {
    return NextResponse.json(null, { status: 404 });
  }

  const nodes: FernNavigation.NavigationNodePage[] = [];

  FernNavigation.traverseDF(root, (node) => {
    if (FernNavigation.hasMetadata(node)) {
      if (node.hidden || node.authed) {
        return SKIP;
      }
    }

    if (FernNavigation.isPage(node)) {
      nodes.push(node);
    }

    return CONTINUE;
  });

  const markdowns = (
    await Promise.all(
      uniqBy(
        nodes,
        (a) => FernNavigation.getPageId(a) ?? a.canonicalSlug ?? a.slug
      ).map(async (node) => {
        const markdown = await getMarkdownForPath(node, loader, edgeFlags);
        if (markdown == null) {
          return undefined;
        }
        return markdown.content;
      })
    )
  ).filter(isNonNullish);

  if (markdowns.length === 0) {
    return NextResponse.json(null, { status: 404 });
  }

  return new NextResponse(markdowns.join("\n\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "s-maxage=60",
    },
  });
}
