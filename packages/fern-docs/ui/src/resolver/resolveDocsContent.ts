import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DocsLoader, MarkdownLoader } from "@fern-docs/cache";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";
import { resolveApiEndpointPage } from "./resolveApiEndpointPage";
import { resolveApiReferencePage } from "./resolveApiReferencePage";
import { resolveChangelogEntryPage } from "./resolveChangelogEntryPage";
import { resolveChangelogPage } from "./resolveChangelogPage";
import { resolveMarkdownPage } from "./resolveMarkdownPage";
import { resolveSubtitle } from "./resolveSubtitle";

interface ResolveDocsContentArgs {
  loader: DocsLoader;
  node: FernNavigation.NavigationNodeWithMetadata;
  version: FernNavigation.VersionNode | FernNavigation.RootNode;
  apiReference: FernNavigation.ApiReferenceNode | undefined;
  parents: readonly FernNavigation.NavigationNodeParent[];
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  prev: FernNavigation.NavigationNodeNeighbor | undefined;
  next: FernNavigation.NavigationNodeNeighbor | undefined;
  mdxOptions?: FernSerializeMdxOptions;
  serializeMdx: MDX_SERIALIZER;
  engine: string;
}

export async function resolveDocsContent({
  loader,
  node,
  version,
  apiReference,
  parents,
  breadcrumb,
  prev,
  next,
  mdxOptions,
  serializeMdx,
  engine,
}: ResolveDocsContentArgs): Promise<DocsContent | undefined> {
  const neighbors = await getNeighbors({ prev, next }, loader, serializeMdx);

  const markdownLoader = MarkdownLoader.create(loader).withMdxBundler(
    (mdx: string, pageId: FernNavigation.PageId | undefined) =>
      serializeMdx(mdx, {
        ...mdxOptions,
        filename: pageId,
      }),
    engine
  );

  let result: DocsContent | undefined;

  if (node.type === "changelog") {
    result = await resolveChangelogPage({
      node,
      breadcrumb,
      loader,
      mdxOptions,
      serializeMdx,
    });
  } else if (node.type === "changelogEntry") {
    result = await resolveChangelogEntryPage({
      node,
      parents,
      breadcrumb,
      loader,
      serializeMdx,
      mdxOptions,
      neighbors,
    });
  } else if (apiReference?.paginated && FernNavigation.hasMarkdown(node)) {
    result = await resolveMarkdownPage({
      node,
      version,
      breadcrumb,
      getApiDefinition: (id) =>
        loader.getApiDefinitionLoader(id).then((loader) => loader?.load()),
      neighbors,
      markdownLoader,
    });
  } else if (apiReference != null) {
    const apiDefinitionLoader = await loader.getApiDefinitionLoader(
      apiReference.apiDefinitionId
    );
    if (apiDefinitionLoader == null) {
      console.error("API definition not found", apiReference.apiDefinitionId);
      return;
    }

    if (apiReference.paginated && FernNavigation.isApiLeaf(node)) {
      result = await resolveApiEndpointPage({
        node,
        parents,
        apiDefinitionLoader,
        neighbors,
        showErrors: apiReference.showErrors,
      });
    } else {
      result = await resolveApiReferencePage({
        node,
        apiDefinitionLoader,
        apiReferenceNode: apiReference,
        parents,
        markdownLoader,
      });
    }
  } else if (FernNavigation.hasMarkdown(node)) {
    result = await resolveMarkdownPage({
      node,
      version,
      breadcrumb,
      getApiDefinition: (id) =>
        loader.getApiDefinitionLoader(id).then((loader) => loader?.load()),
      neighbors,
      markdownLoader,
    });
  }

  if (result === undefined) {
    console.error(`Failed to resolve content for ${node.slug}`);
  }

  return result;
}

async function getNeighbor(
  node: FernNavigation.NavigationNodeNeighbor | undefined,
  loader: DocsLoader,
  serializeMdx: MDX_SERIALIZER
): Promise<DocsContent.Neighbor | null> {
  if (node == null) {
    return null;
  }
  const excerpt = await resolveSubtitle(node, loader, serializeMdx);
  return {
    slug: node.slug,
    title: node.title,
    excerpt,
  };
}

async function getNeighbors(
  neighbors: {
    prev: FernNavigation.NavigationNodeNeighbor | undefined;
    next: FernNavigation.NavigationNodeNeighbor | undefined;
  },
  loader: DocsLoader,
  serializeMdx: MDX_SERIALIZER
): Promise<DocsContent.Neighbors> {
  const [prev, next] = await Promise.all([
    getNeighbor(neighbors.prev, loader, serializeMdx),
    getNeighbor(neighbors.next, loader, serializeMdx),
  ]);
  return { prev, next };
}
