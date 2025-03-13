import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { uniqBy } from "es-toolkit/array";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { COOKIE_FERN_TOKEN, slugToHref } from "@fern-docs/utils";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { getMarkdownForPath } from "@/server/getMarkdownForPath";
import { getSectionRoot } from "@/server/getSectionRoot";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const { host, domain } = await props.params;

  const path = slugToHref(req.nextUrl.searchParams.get("slug") ?? "");
  const fern_token = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(host, domain, fern_token);

  const root = getSectionRoot(await loader.getRoot(), path);

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
        const markdown = await getMarkdownForPath(node, loader);
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
