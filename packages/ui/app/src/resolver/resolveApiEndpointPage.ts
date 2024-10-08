import type { APIV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import { ApiEndpointResolver } from "./ApiEndpointResolver";
import { ApiTypeResolver } from "./ApiTypeResolver";
import type { DocsContent } from "./DocsContent";
import { ResolvedApiEndpoint } from "./types";

interface ResolveApiEndpointPageOpts {
    node: FernNavigation.NavigationNodeApiLeaf;
    parents: readonly FernNavigation.NavigationNodeParent[];
    apis: Record<string, APIV1Read.ApiDefinition>;
    mdxOptions: FernSerializeMdxOptions | undefined;
    featureFlags: FeatureFlags;
    neighbors: DocsContent.Neighbors;
    serializeMdx: MDX_SERIALIZER;
    collector: FernNavigation.NodeCollector;
    showErrors: boolean | undefined;
}

export async function resolveApiEndpointPage({
    node,
    parents,
    apis,
    mdxOptions,
    featureFlags,
    neighbors,
    serializeMdx,
    collector,
    showErrors,
}: ResolveApiEndpointPageOpts): Promise<DocsContent.ApiEndpointPage | undefined> {
    let api = apis[node.apiDefinitionId];
    if (api == null) {
        return;
    }
    const pruner = new FernNavigation.ApiDefinitionPruner(api);
    const parent = parents[parents.length - 1];
    api = pruner.prune(parent?.type === "endpointPair" ? parent : node);
    const holder = FernNavigation.ApiDefinitionHolder.create(api);
    const typeResolver = new ApiTypeResolver(node.apiDefinitionId, api.types, mdxOptions, serializeMdx);
    const resolvedTypes = await typeResolver.resolve();
    const defResolver = new ApiEndpointResolver(
        collector,
        holder,
        typeResolver,
        resolvedTypes,
        featureFlags,
        mdxOptions,
        serializeMdx,
    );
    return {
        type: "api-endpoint-page",
        slug: node.slug,
        api: node.apiDefinitionId,
        auth: api.auth,
        types: resolvedTypes,
        item: await visitDiscriminatedUnion(node)._visit<Promise<ResolvedApiEndpoint>>({
            endpoint: async (endpoint) => {
                if (parent?.type === "endpointPair") {
                    const [stream, nonStream] = await Promise.all([
                        defResolver.resolveEndpointDefinition(parent.stream),
                        defResolver.resolveEndpointDefinition(parent.nonStream),
                    ]);
                    nonStream.stream = stream;
                    return nonStream;
                }
                return defResolver.resolveEndpointDefinition(endpoint);
            },
            webSocket: (webSocket) => defResolver.resolveWebsocketChannel(webSocket),
            webhook: (webhook) => defResolver.resolveWebhookDefinition(webhook),
        }),
        showErrors: showErrors ?? false,
        neighbors,
    };
}
