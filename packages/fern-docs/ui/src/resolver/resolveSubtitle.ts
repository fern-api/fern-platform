import type { DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { getFrontmatter } from "@fern-docs/mdx";
import type { MDX_SERIALIZER } from "../mdx/bundler";

export async function resolveSubtitle(
  node: FernNavigation.NavigationNodeNeighbor,
  pages: Record<string, DocsV1Read.PageContent>,
  serializeMdx: MDX_SERIALIZER
): Promise<FernDocs.MarkdownText | undefined> {
  const pageId = FernNavigation.getPageId(node);
  if (pageId == null) {
    return;
  }
  const content = pages[pageId]?.markdown;
  if (content == null) {
    return;
  }

  try {
    const { data: frontmatter } = getFrontmatter(content);
    if (frontmatter.excerpt != null) {
      return await serializeMdx(frontmatter.excerpt);
    }
    return undefined;
  } catch (e) {
    // TODO: sentry
    // eslint-disable-next-line no-console
    console.error(
      "Error occurred while parsing frontmatter to get the subtitle (aka excerpt)",
      e
    );
    return undefined;
  }
}
