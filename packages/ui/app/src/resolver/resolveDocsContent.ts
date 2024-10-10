import { ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiDefinitionLoader, MarkdownLoader } from "@fern-ui/fern-docs-server";
import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
import { mapValues } from "lodash-es";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";
import { resolveApiEndpointPage } from "./resolveApiEndpointPage";
import { resolveApiReferencePage } from "./resolveApiReferencePage";
import { resolveChangelogEntryPage } from "./resolveChangelogEntryPage";
import { resolveChangelogPage } from "./resolveChangelogPage";
import { resolveMarkdownPage } from "./resolveMarkdownPage";
import { resolveSubtitle } from "./resolveSubtitle";

export async function resolveDocsContent({
    host,
    found,
    apis,
    pages,
    mdxOptions,
    featureFlags,
    serializeMdx,
    engine,
}: {
    host: string;
    found: FernNavigation.utils.Node.Found;
    apis: Record<string, APIV1Read.ApiDefinition>;
    pages: Record<string, DocsV1Read.PageContent>;
    mdxOptions?: FernSerializeMdxOptions;
    featureFlags: FeatureFlags;
    serializeMdx: MDX_SERIALIZER;
    engine: string;
}): Promise<DocsContent | undefined> {
    const neighbors = await getNeighbors(found, pages, serializeMdx);
    const { node, apiReference, parents, breadcrumb } = found;

    const markdownLoader = MarkdownLoader.create(host)
        .withPages(pages)
        .withMdxBundler(
            (
                mdx: string,
                pageId: FernNavigation.PageId,
                title: string | undefined,
                breadcrumb: FernNavigation.BreadcrumbItem[],
                editThisPageUrl: FernNavigation.Url | undefined,
            ) =>
                serializeMdx(mdx, {
                    ...mdxOptions,
                    filename: pageId,
                    frontmatterDefaults: {
                        title,
                        breadcrumb,
                        "edit-this-page-url": editThisPageUrl,
                        "force-toc": featureFlags.isTocDefaultEnabled,
                    },
                }),
            engine,
        );

    const apiLoaders = mapValues(apis, (api) => {
        return ApiDefinitionLoader.create(host, api.id)
            .withMdxBundler(serializeMdx, engine)
            .withFlags(featureFlags)
            .withApiDefinition(ApiDefinitionV1ToLatest.from(api, featureFlags).migrate())
            .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
            .withResolveDescriptions();
    });

    if (node.type === "changelog") {
        return resolveChangelogPage({
            node,
            breadcrumb,
            pages,
            mdxOptions,
            serializeMdx,
        });
    } else if (node.type === "changelogEntry") {
        return resolveChangelogEntryPage({
            node,
            parents,
            breadcrumb,
            pages,
            serializeMdx,
            mdxOptions,
            neighbors,
        });
    } else if (apiReference != null && apiReference.paginated && FernNavigation.hasMarkdown(node)) {
        // if long scrolling is disabled, we should render a markdown page by itself
        return resolveMarkdownPage({
            node,
            found,
            apiLoaders,
            neighbors,
            markdownLoader,
        });
    } else if (apiReference != null) {
        const loader = apiLoaders[apiReference.apiDefinitionId];
        if (loader == null) {
            // eslint-disable-next-line no-console
            console.error("API definition not found", apiReference.apiDefinitionId);
            return;
        }

        if (apiReference.paginated && FernNavigation.isApiLeaf(node)) {
            return resolveApiEndpointPage({
                node,
                parents,
                apiDefinitionLoader: loader,
                neighbors,
                showErrors: apiReference.showErrors,
            });
        }

        return resolveApiReferencePage({
            node,
            apiDefinitionLoader: loader,
            apiReferenceNode: apiReference,
            parents,
            markdownLoader,
        });
    } else if (FernNavigation.hasMarkdown(node)) {
        return resolveMarkdownPage({
            node,
            found,
            apiLoaders,
            neighbors,
            markdownLoader,
        });
    }

    /**
     * This should never happen, but if it does, we should log it and return undefined
     */
    // eslint-disable-next-line no-console
    console.error(`Failed to resolve content for ${node.slug}`);
    return undefined;
}

async function getNeighbor(
    node: FernNavigation.NavigationNodeNeighbor | undefined,
    pages: Record<string, DocsV1Read.PageContent>,
    serializeMdx: MDX_SERIALIZER,
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
    node: FernNavigation.utils.Node.Found,
    pages: Record<string, DocsV1Read.PageContent>,
    serializeMdx: MDX_SERIALIZER,
): Promise<DocsContent.Neighbors> {
    const [prev, next] = await Promise.all([
        getNeighbor(node.prev, pages, serializeMdx),
        getNeighbor(node.next, pages, serializeMdx),
    ]);
    return { prev, next };
}
