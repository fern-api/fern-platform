import { type ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { ApiDefinitionLoader, type MarkdownLoader } from "@fern-docs/cache";
import { getFrontmatter, makeToc, toTree } from "@fern-docs/mdx";
import type { DocsContent } from "./DocsContent";

interface ResolveMarkdownPageOptions {
  version: FernNavigation.VersionNode | FernNavigation.RootNode;
  node: FernNavigation.NavigationNodeWithMarkdown;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  apiLoaders: Record<FernNavigation.ApiDefinitionId, ApiDefinitionLoader>;
  neighbors: DocsContent.Neighbors;
  markdownLoader: MarkdownLoader;
}

// TODO: this should be more robust
function shouldFetchApiRef(markdown: FernDocs.MarkdownText): boolean {
  if (typeof markdown === "string") {
    return (
      markdown.includes("EndpointRequestSnippet") ||
      markdown.includes("EndpointResponseSnippet")
    );
  } else {
    return shouldFetchApiRef(markdown.code);
  }
}

export async function resolveMarkdownPage({
  node,
  version,
  breadcrumb,
  apiLoaders,
  neighbors,
  markdownLoader,
}: ResolveMarkdownPageOptions): Promise<DocsContent.MarkdownPage | undefined> {
  const markdownPageWithoutApiRefs = await resolveMarkdownPageWithoutApiRefs({
    node,
    breadcrumb,
    neighbors,
    markdownLoader,
  });

  if (!markdownPageWithoutApiRefs) {
    console.error(`Failed to load markdown for ${node.slug}`);
    return;
  }

  const apiDefinitionIds = new Set<FernNavigation.ApiDefinitionId>();
  const endpointIdsToSlugs = new Map<
    FernNavigation.EndpointId,
    FernNavigation.Slug
  >();

  if (shouldFetchApiRef(markdownPageWithoutApiRefs.content)) {
    // note: we start from the version node because endpoint Ids can be duplicated across versions
    // if we introduce versioned sections, and versioned api references, this logic will need to change
    FernNavigation.utils.collectApiReferences(version).forEach((apiRef) => {
      apiDefinitionIds.add(apiRef.apiDefinitionId);

      FernNavigation.traverseDF(apiRef, (node) => {
        if (node.type !== "endpoint") {
          return;
        }
        // TODO: handle duplicate endpoint Ids
        endpointIdsToSlugs.set(
          node.endpointId,
          node.canonicalSlug ?? node.slug
        );
      });
    });
  }
  const resolvedApis = Object.fromEntries(
    (
      await Promise.all(
        [...apiDefinitionIds].map(
          async (
            id
          ): Promise<
            [id: FernNavigation.ApiDefinitionId, ApiDefinition] | undefined
          > => {
            const loader = apiLoaders[id];
            if (loader == null) {
              console.error("API definition not found", id);
              return;
            }
            const apiDefinition = await loader.load();

            if (apiDefinition == null) {
              console.error(`Failed to load API definition for ${id}`);
              return;
            }
            return [apiDefinition.id, apiDefinition] as const;
          }
        )
      )
    ).filter(isNonNullish)
  );

  return {
    ...markdownPageWithoutApiRefs,
    type: "markdown-page",
    apis: resolvedApis,
    endpointIdsToSlugs: Object.fromEntries(endpointIdsToSlugs.entries()),
  };
}

interface ResolveMarkdownPageWithoutApiRefsOptions {
  node: FernNavigation.NavigationNodeWithMarkdown;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  neighbors: DocsContent.Neighbors;
  markdownLoader: MarkdownLoader;
}

export async function resolveMarkdownPageWithoutApiRefs({
  node,
  breadcrumb,
  neighbors,
  markdownLoader,
}: ResolveMarkdownPageWithoutApiRefsOptions): Promise<
  | Omit<DocsContent.MarkdownPage, "type" | "apis" | "endpointIdsToSlugs">
  | undefined
> {
  const rawMarkdown = markdownLoader.getRawMarkdown(node);

  if (!rawMarkdown) {
    console.error(`Failed to load markdown for ${node.slug}`);
    return;
  }

  const { markdown, pageId } = rawMarkdown;

  const content = await markdownLoader.serializeWithCache(
    markdown,
    pageId,
    "content"
  );

  const frontmatter: FernDocs.Frontmatter =
    typeof content === "string"
      ? { ...FernDocs.EMPTY_FRONTMATTER }
      : content.frontmatter;

  let hasAside = false;
  // this is a hack to force the layout to reference for pages that contain an <Aside>

  const parsing = typeof content === "string" ? "" : content.code;
  if (parsing.includes("ReferenceLayoutAside")) {
    frontmatter.layout = "reference";
    hasAside = true;
  }

  if (frontmatter["edit-this-page-url"] == null) {
    frontmatter["edit-this-page-url"] = markdownLoader.getEditThisPageUrl(node);
  }

  const titleRaw = frontmatter?.title ?? node.title;
  const subtitleRaw = frontmatter?.subtitle ?? frontmatter?.excerpt;

  const [title, subtitle] = await Promise.all([
    markdownLoader.serializeWithCache(titleRaw, pageId, "title"),
    subtitleRaw != null
      ? markdownLoader.serializeWithCache(subtitleRaw, pageId, "subtitle")
      : undefined,
  ]);

  // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
  // or at least parallelize it.
  const { hast } = toTree(getFrontmatter(markdown).content);
  const tableOfContents = makeToc(hast, frontmatter?.["force-toc"]);

  return {
    slug: node.slug,
    title,
    subtitle,
    tableOfContents,
    content,
    breadcrumb,
    neighbors,
    hasAside,
  };
}
