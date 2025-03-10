import { DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { getFrontmatter } from "@fern-docs/mdx";
import {
  resolveDocsContent,
  type DocsContent,
  type ImageData,
} from "@fern-docs/ui";
import { getMdxBundler } from "@fern-docs/ui/bundlers";
import { EdgeFlags } from "@fern-docs/utils";
import { AuthState } from "./auth/getAuthState";
import { withPrunedNavigation } from "./withPrunedNavigation";

interface WithResolvedDocsContentOpts {
  domain: string;
  found: FernNavigation.utils.Node.Found;
  authState: AuthState;
  definition: DocsV1Read.DocsDefinition;
  edgeFlags: EdgeFlags;
  scope?: Record<string, unknown>;
  replaceSrc?: (src: string) => ImageData | undefined;
  replaceHref?: (href: string) => string | undefined;
}

export async function withResolvedDocsContent({
  domain,
  found,
  authState,
  definition,
  edgeFlags,
  scope,
  replaceSrc,
  replaceHref,
}: WithResolvedDocsContentOpts): Promise<DocsContent | undefined> {
  const node = withPrunedNavigation(found.node, {
    visibleNodeIds: [found.node.id],
    authed: authState.authed,
  });

  if (node == null) {
    return undefined;
  }

  // pruning is especially relevant here! If the API reference is long-scrolling, we need to guarantee that the user is authed otherwise the node should not exist.
  const apiReference = withPrunedNavigation(found.apiReference, {
    visibleNodeIds: [found.node.id],
    authed: authState.authed,
  });

  const engine = edgeFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
  const serializeMdx = await getMdxBundler(engine);

  return resolveDocsContent({
    node,
    apiReference,

    // TODO: don't pass in the version or parents
    version: found.currentVersion ?? found.root,
    parents: found.parents,

    breadcrumb: found.breadcrumb,

    // strip away authed neighbors unless they are explicitly discoverable
    prev: edgeFlags.isAuthenticatedPagesDiscoverable
      ? found.prev
      : found.prev?.authed
        ? undefined
        : found.prev,
    next: edgeFlags.isAuthenticatedPagesDiscoverable
      ? found.next
      : found.next?.authed
        ? undefined
        : found.next,

    apis: definition.apis,
    apisV2: definition.apisV2,
    pages: definition.pages,
    edgeFlags,
    mdxOptions: {
      files: definition.jsFiles,
      scope,

      // inject the file url and dimensions for images and other embeddable files
      replaceSrc,
      // resolve absolute pathed hrefs to the correct path (considers version and basepath)
      replaceHref,
    },
    serializeMdx,
    domain,
    engine,
  });
}

export function extractFrontmatterFromDocsContent(
  nodeId: FernNavigation.NodeId,
  docsContent: DocsContent | undefined
): FernDocs.Frontmatter | undefined {
  if (docsContent == null) {
    return undefined;
  }
  switch (docsContent.type) {
    case "markdown-page":
      return getFrontmatterFromMarkdownText(docsContent.content);
    case "changelog-entry":
      return getFrontmatterFromMarkdownText(docsContent.page);
    case "api-reference-page": {
      const mdx = docsContent.mdxs[nodeId];
      if (mdx == null) {
        return undefined;
      }
      return getFrontmatterFromMarkdownText(mdx.content);
    }
    default:
      // TODO: handle changelog overview page and other pages
      return undefined;
  }
}

function getFrontmatterFromMarkdownText(
  markdownText: FernDocs.MarkdownText
): FernDocs.Frontmatter | undefined {
  if (typeof markdownText === "string") {
    return getFrontmatter(markdownText).data;
  }
  return markdownText.frontmatter;
}
