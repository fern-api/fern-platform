import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import { ApiDefinitionResolver } from "./ApiDefinitionResolver";
import type { DocsContent } from "./DocsContent";

interface ResolveApiReferencePageOpts {
    node: FernNavigation.NavigationNodeWithMetadata;
    apiReference: FernNavigation.ApiReferenceNode;
    parents: readonly FernNavigation.NavigationNodeParent[];
    pages: Record<string, DocsV1Read.PageContent>;
    apis: Record<string, APIV1Read.ApiDefinition>;
    mdxOptions: FernSerializeMdxOptions | undefined;
    featureFlags: FeatureFlags;
    serializeMdx: MDX_SERIALIZER;
    collector: FernNavigation.NodeCollector;
}

export async function resolveApiReferencePage({
    node,
    apis,
    apiReference,
    pages,
    mdxOptions,
    featureFlags,
    serializeMdx,
    collector,
}: ResolveApiReferencePageOpts): Promise<DocsContent.ApiReferencePage | undefined> {
    const api = apis[apiReference.apiDefinitionId];
    if (api == null) {
        // eslint-disable-next-line no-console
        console.error("API not found", apiReference.apiDefinitionId);
        return;
    }
    const holder = FernNavigation.ApiDefinitionHolder.create(api);
    const apiDefinition = await ApiDefinitionResolver.resolve(
        collector,
        apiReference,
        holder,
        pages,
        mdxOptions,
        featureFlags,
        serializeMdx,
    );
    return {
        type: "api-reference-page",
        slug: node.slug,
        title: node.title,
        api: apiReference.apiDefinitionId,
        apiDefinition,
        paginated: apiReference.paginated ?? false,
        // artifacts: apiSection.artifacts ?? null, // TODO: add artifacts
        showErrors: apiReference.showErrors ?? false,
        // neighbors,
    };
}
