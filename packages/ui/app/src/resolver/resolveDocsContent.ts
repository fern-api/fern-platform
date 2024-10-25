/* eslint-disable no-console */
import { ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ApiDefinitionLoader, MarkdownLoader } from "@fern-ui/fern-docs-server";
import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
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
    console.log("Starting resolveDocsContent");
    console.time("resolveDocsContent");

    console.time("getNeighbors");
    const neighbors = await getNeighbors(found, pages, serializeMdx);
    console.timeEnd("getNeighbors");

    const { node, apiReference, parents, breadcrumb } = found;

    console.time("createMarkdownLoader");
    const markdownLoader = MarkdownLoader.create(host)
        .withPages(pages)
        .withMdxBundler(
            (mdx: string, pageId: FernNavigation.PageId | undefined) =>
                serializeMdx(mdx, {
                    ...mdxOptions,
                    filename: pageId,
                }),
            engine,
        );
    console.timeEnd("createMarkdownLoader");

    console.time("createApiLoaders");
    const apiLoaders = mapValues(apis, (api) => {
        return ApiDefinitionLoader.create(host, api.id)
            .withMdxBundler(serializeMdx, engine)
            .withFlags(featureFlags)
            .withApiDefinition(ApiDefinitionV1ToLatest.from(api, featureFlags).migrate())
            .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
            .withResolveDescriptions();
    });
    console.timeEnd("createApiLoaders");

    let result: DocsContent | undefined;

    console.time("resolveContent");
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
    } else if (apiReference != null && apiReference.paginated && FernNavigation.hasMarkdown(node)) {
        // if long scrolling is disabled, we should render a markdown page by itself
        result = await resolveMarkdownPage({
            node,
            found,
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
            found,
            apiLoaders,
            neighbors,
            markdownLoader,
        });
    }
    console.timeEnd("resolveContent");

    if (result === undefined) {
        console.error(`Failed to resolve content for ${node.slug}`);
    }

    console.timeEnd("resolveDocsContent");
    return result;
}

async function getNeighbor(
    node: FernNavigation.NavigationNodeNeighbor | undefined,
    pages: Record<string, DocsV1Read.PageContent>,
    serializeMdx: MDX_SERIALIZER,
): Promise<DocsContent.Neighbor | null> {
    if (node == null) {
        return null;
    }
    console.time(`resolveSubtitle for ${node.slug}`);
    const excerpt = await resolveSubtitle(node, pages, serializeMdx);
    console.timeEnd(`resolveSubtitle for ${node.slug}`);
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
    console.time("getNeighbors");
    const [prev, next] = await Promise.all([
        getNeighbor(node.prev, pages, serializeMdx),
        getNeighbor(node.next, pages, serializeMdx),
    ]);
    console.timeEnd("getNeighbors");
    return { prev, next };
}
