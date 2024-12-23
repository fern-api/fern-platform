import { DocsLoader } from "@/server/DocsLoader";
import { getMarkdownForPath } from "@/server/getMarkdownForPath";
import { getSectionRoot } from "@/server/getSectionRoot";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { getFeatureFlags } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN, addLeadingSlash } from "@fern-docs/utils";
import { uniqBy } from "es-toolkit/array";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function handleLLMSFullTxt(
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
        const markdown = await getMarkdownForPath(node, loader, featureFlags);
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
