import { ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import type {
  APIV1Read,
  DocsV1Read,
  FdrAPI,
} from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiDefinitionLoader, MarkdownLoader } from "@fern-docs/cache";
import type { EdgeFlags } from "@fern-docs/utils";
import { mapValues } from "es-toolkit/object";
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
  /**
   * This is x-fern-host (NOT the host of the current request)
   */
  domain: string;
  node: FernNavigation.NavigationNodeWithMetadata;
  version: FernNavigation.VersionNode | FernNavigation.RootNode;
  apiReference: FernNavigation.ApiReferenceNode | undefined;
  parents: readonly FernNavigation.NavigationNodeParent[];
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  prev: FernNavigation.NavigationNodeNeighbor | undefined;
  next: FernNavigation.NavigationNodeNeighbor | undefined;
  apis: Record<string, APIV1Read.ApiDefinition>;
  apisV2: Record<string, FdrAPI.api.latest.ApiDefinition>;
  pages: Record<string, DocsV1Read.PageContent>;
  mdxOptions?: FernSerializeMdxOptions;
  edgeFlags: EdgeFlags;
  serializeMdx: MDX_SERIALIZER;
  engine: string;
}

export async function resolveDocsContent({
  domain,
  node,
  version,
  apiReference,
  parents,
  breadcrumb,
  prev,
  next,
  apis,
  apisV2,
  pages,
  mdxOptions,
  edgeFlags,
  serializeMdx,
  engine,
}: ResolveDocsContentArgs): Promise<DocsContent | undefined> {
  const neighbors = await getNeighbors({ prev, next }, pages, serializeMdx);

  const markdownLoader = MarkdownLoader.create(domain)
    .withPages(pages)
    .withMdxBundler(
      (mdx: string, pageId: FernNavigation.PageId | undefined) =>
        serializeMdx(mdx, {
          ...mdxOptions,
          filename: pageId,
        }),
      engine
    );

  // TODO: remove legacy when done
  const apiLoaders = {
    ...mapValues(apis, (api) => {
      return ApiDefinitionLoader.create(domain, api.id)
        .withMdxBundler(serializeMdx, engine)
        .withEdgeFlags(edgeFlags)
        .withApiDefinition(
          ApiDefinitionV1ToLatest.from(api, edgeFlags).migrate()
        )
        .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
        .withResolveDescriptions();
    }),
    ...mapValues(apisV2 ?? {}, (api) => {
      return ApiDefinitionLoader.create(domain, api.id)
        .withMdxBundler(serializeMdx, engine)
        .withEdgeFlags(edgeFlags)
        .withApiDefinition(api)
        .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
        .withResolveDescriptions();
    }),
  };

  let result: DocsContent | undefined;

  if (node.type === "changelog") {
    result = await resolveChangelogPage({
      node,
      breadcrumb,
      pages,
      mdxOptions,
      serializeMdx,
    });
  } else if (node.type === "changelogEntry") {
    result = await resolveChangelogEntryPage({
      node,
      parents,
      breadcrumb,
      pages,
      serializeMdx,
      mdxOptions,
      neighbors,
    });
  } else if (apiReference?.paginated && FernNavigation.hasMarkdown(node)) {
    result = await resolveMarkdownPage({
      node,
      version,
      breadcrumb,
      apiLoaders,
      neighbors,
      markdownLoader,
    });
  } else if (apiReference != null) {
    const loader = apiLoaders[apiReference.apiDefinitionId];
    if (loader == null) {
      console.error("API definition not found", apiReference.apiDefinitionId);
      return;
    }

    if (apiReference.paginated && FernNavigation.isApiLeaf(node)) {
      result = await resolveApiEndpointPage({
        node,
        parents,
        apiDefinitionLoader: loader,
        neighbors,
        showErrors: apiReference.showErrors,
      });
    } else {
      result = await resolveApiReferencePage({
        node,
        apiDefinitionLoader: loader,
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
      apiLoaders,
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
  pages: Record<string, DocsV1Read.PageContent>,
  serializeMdx: MDX_SERIALIZER
): Promise<DocsContent.Neighbor | null> {
  if (node == null) {
    return null;
  }
  const excerpt = await resolveSubtitle(node, pages, serializeMdx);
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
  pages: Record<string, DocsV1Read.PageContent>,
  serializeMdx: MDX_SERIALIZER
): Promise<DocsContent.Neighbors> {
  const [prev, next] = await Promise.all([
    getNeighbor(neighbors.prev, pages, serializeMdx),
    getNeighbor(neighbors.next, pages, serializeMdx),
  ]);
  return { prev, next };
}
