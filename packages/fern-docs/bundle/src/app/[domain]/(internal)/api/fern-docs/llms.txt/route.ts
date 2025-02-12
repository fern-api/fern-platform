import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { isNonNullish, withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getEdgeFlags } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN, addLeadingSlash } from "@fern-docs/utils";

import { DocsLoader } from "@/server/DocsLoader";
import { getMarkdownForPath } from "@/server/getMarkdownForPath";
import { getSectionRoot } from "@/server/getSectionRoot";
import { getLlmTxtMetadata } from "@/server/llm-txt-md";
import { getHostEdge } from "@/server/xfernhost/edge";

/**
 * This endpoint follows the https://llmstxt.org/ specification for a LLM-friendly markdown-esque page listing all the pages in the docs.
 * This page is akin to a "table of contents" page or a sitemap, and works at every level of the docs hierarchy.
 *
 * I.e.
 * - /llms.txt
 * - /docs/llms.txt
 * - /v1/llms.txt
 * - /v2/llms.txt
 * - /v1/api-reference/llms.txt
 *
 * Urls to all pages will be appended with `.md` or `.mdx` to indicate that it's a LLM-friendly markdown page.
 * Otherwise, the original urls will be used.
 *
 * Notes:
 * - API Docs do not currently have `.mdx` equivalents, so the original urls are used for those.
 * - the breadcrumb is included for all API endpoints because the endpoint title is not always unique or descriptive.
 * - hidden and noindexed nodes are not included in the list
 * - should hidden pages be included under an `## Optional` heading?
 */

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ domain: string }> }
): Promise<NextResponse> {
  const { domain } = await props.params;

  const path = addLeadingSlash(req.nextUrl.searchParams.get("slug") ?? "");
  const host = getHostEdge(req);
  const fern_token = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
  const edgeFlags = await getEdgeFlags(domain);
  const loader = DocsLoader.for(domain, host, fern_token).withEdgeFlags(
    edgeFlags
  );

  const root = getSectionRoot(await loader.root(), path);
  const pages = await loader.pages();

  if (root == null) {
    return NextResponse.json(null, { status: 404 });
  }

  const pageInfos: {
    pageId: FernNavigation.PageId;
    slug: FernNavigation.Slug;
    nodeTitle: string;
  }[] = [];

  const endpointPageInfos: {
    slug: FernNavigation.Slug;
    breadcrumb: string[];
    nodeTitle: string;
    apiDefinitionId: FernNavigation.ApiDefinitionId;
    endpointId: FernNavigation.EndpointId | undefined;
    webhookId: FernNavigation.WebhookId | undefined;
    websocketId: FernNavigation.WebSocketId | undefined;
  }[] = [];

  const landingPage = getLandingPage(root);
  const markdown =
    landingPage != null
      ? await getMarkdownForPath(landingPage, loader, edgeFlags)
      : undefined;

  // traverse the tree in a depth-first manner to collect all the nodes that have markdown content
  // in the order that they appear in the sidebar
  FernNavigation.traverseDF(root, (node, parents) => {
    // don't include the landing page in the list
    if (landingPage != null && node.id === landingPage.id) {
      return CONTINUE;
    }

    // if the node is hidden or authed, don't include it in the list
    // TODO: include "hidden" nodes in `llms-full.txt`
    if (FernNavigation.hasMetadata(node)) {
      if (node.hidden || node.authed) {
        return SKIP;
      }
    }

    if (FernNavigation.hasMarkdown(node)) {
      // if the node is noindexed, don't include it in the list
      // TODO: include "noindexed" nodes in `llms-full.txt`
      if (node.noindex) {
        return SKIP;
      }

      const pageId = FernNavigation.getPageId(node);
      if (pageId != null) {
        pageInfos.push({
          pageId,
          nodeTitle: node.title,
          slug: node.slug,
        });
      }
    }

    if (FernNavigation.isApiLeaf(node)) {
      endpointPageInfos.push({
        slug: node.slug,
        nodeTitle: node.title,
        apiDefinitionId: node.apiDefinitionId,
        endpointId: node.type === "endpoint" ? node.endpointId : undefined,
        webhookId: node.type === "webhook" ? node.webhookId : undefined,
        websocketId: node.type === "webSocket" ? node.webSocketId : undefined,
        breadcrumb: parents
          .slice(parents.findLastIndex((p) => p.type === "apiReference"))
          .map((p) => (FernNavigation.hasMetadata(p) ? p.title : undefined))
          .filter(isNonNullish),
      });
    }

    return CONTINUE;
  });

  const docs = pageInfos
    .map(
      (
        pageInfo
      ): {
        title: string;
        description: string | undefined;
        href: string;
      } => {
        if (pageInfo.pageId != null) {
          const page = pages[pageInfo.pageId];
          if (page != null) {
            const { title, description } = getLlmTxtMetadata(
              page.markdown,
              pageInfo.nodeTitle
            );
            return {
              title,
              description,
              href: String(
                new URL(
                  addLeadingSlash(
                    pageInfo.slug +
                      (pageInfo.pageId.endsWith(".mdx") ? ".mdx" : ".md")
                  ),
                  withDefaultProtocol(domain)
                )
              ),
            };
          }
        }

        return {
          title: pageInfo.nodeTitle,
          description: undefined,
          href: String(
            new URL(addLeadingSlash(pageInfo.slug), withDefaultProtocol(domain))
          ),
        };
      }
    )
    .map(
      (doc) =>
        `- [${doc.title}](${doc.href})${doc.description != null ? `: ${doc.description}` : ""}`
    );

  const endpoints = endpointPageInfos
    .map((endpointPageInfo) => {
      return {
        title: endpointPageInfo.nodeTitle,
        href: String(
          new URL(
            addLeadingSlash(endpointPageInfo.slug) +
              (endpointPageInfo.endpointId != null ? ".mdx" : ""),
            withDefaultProtocol(domain)
          )
        ),
        breadcrumb: endpointPageInfo.breadcrumb,
      };
    })
    .map(
      (endpoint) =>
        `- ${endpoint.breadcrumb.join(" > ")} [${endpoint.title}](${endpoint.href})`
    );

  return new NextResponse(
    [
      // if there's a landing page, use the llm-friendly markdown version instead of the ${root.title}
      markdown?.content ?? `# ${root.title}`,
      docs.length > 0 ? `## Docs\n\n${docs.join("\n")}` : undefined,
      endpoints.length > 0
        ? `## API Docs\n\n${endpoints.join("\n")}`
        : undefined,
    ]
      .filter(isNonNullish)
      .join("\n\n"),
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "s-maxage=60",
      },
    }
  );
}

function getLandingPage(
  root: FernNavigation.NavigationNodeWithMetadata
):
  | FernNavigation.LandingPageNode
  | FernNavigation.NavigationNodePage
  | undefined {
  if (root.type === "version") {
    return root.landingPage;
  } else if (root.type === "root") {
    if (
      root.child.type === "productgroup" ||
      root.child.type === "unversioned"
    ) {
      return root.child.landingPage;
    } else if (root.child.type === "versioned") {
      // return the default version's landing page
      return root.child.children.find((c) => c.default)?.landingPage;
    }
  }

  if (FernNavigation.isPage(root)) {
    return root;
  }

  return undefined;
}
