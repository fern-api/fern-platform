import type { DocsV1Read } from "@fern-api/fdr-sdk";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernRegistry } from "../../../../fdr-sdk/src/client/generated";
import { captureSentryErrorMessage } from "../analytics/sentry";
import type { FeatureFlags } from "../atoms";
import { type MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import { ApiEndpointResolver } from "./ApiEndpointResolver";
import { ApiTypeResolver } from "./ApiTypeResolver";
import type {
    ResolvedEndpointDefinition,
    ResolvedPackageItem,
    ResolvedRootPackage,
    ResolvedSubpackage,
    ResolvedTypeDefinition,
    ResolvedWithApiDefinition,
} from "./types";

export interface ApiDefinitionResolverCache {
    putResolvedEndpoint({
        apiDefinitionId,
        endpoint,
    }: {
        apiDefinitionId: FernRegistry.ApiDefinitionId;
        endpoint: ResolvedEndpointDefinition;
    }): Promise<void>;

    getResolvedEndpoint({
        apiDefinitionId,
        endpointId,
    }: {
        apiDefinitionId: FernRegistry.ApiDefinitionId;
        endpointId: FernNavigation.EndpointId;
    }): Promise<ResolvedEndpointDefinition | null | undefined>;
}

export class ApiDefinitionResolver {
    public static async resolve(
        collector: FernNavigation.NodeCollector,
        root: FernNavigation.ApiReferenceNode,
        holder: FernNavigation.ApiDefinitionHolder,
        typeResolver: ApiTypeResolver,
        pages: Record<string, DocsV1Read.PageContent>,
        mdxOptions: FernSerializeMdxOptions | undefined,
        featureFlags: FeatureFlags,
        serializeMdx: MDX_SERIALIZER,
        cache?: ApiDefinitionResolverCache,
    ): Promise<ResolvedRootPackage> {
        const resolver = new ApiDefinitionResolver(
            collector,
            root,
            holder,
            typeResolver,
            pages,
            featureFlags,
            mdxOptions,
            serializeMdx,
            cache,
        );
        return resolver.resolveApiDefinition();
    }

    private resolvedTypes: Record<string, ResolvedTypeDefinition> = {};

    private definitionResolver: ApiEndpointResolver;
    private constructor(
        private collector: FernNavigation.NodeCollector, // used for breadcrumb generation
        private root: FernNavigation.ApiReferenceNode,
        private holder: FernNavigation.ApiDefinitionHolder,
        private typeResolver: ApiTypeResolver,
        private pages: Record<string, DocsV1Read.PageContent>,
        private featureFlags: FeatureFlags,
        private mdxOptions: FernSerializeMdxOptions | undefined,
        private serializeMdx: MDX_SERIALIZER,
        private cache?: ApiDefinitionResolverCache,
    ) {
        this.definitionResolver = new ApiEndpointResolver(
            this.collector,
            this.holder,
            typeResolver,
            this.resolvedTypes,
            featureFlags,
            mdxOptions,
            serializeMdx,
        );
    }

    private async resolveApiDefinition(): Promise<ResolvedRootPackage> {
        this.resolvedTypes = await this.typeResolver.resolve();

        const withPackage = await this.resolveApiDefinitionPackage(this.root);

        return {
            type: "rootPackage",
            ...withPackage,
            api: this.root.apiDefinitionId,
            auth: this.holder.api.auth,
            types: this.resolvedTypes,
        };
    }

    async resolveApiDefinitionPackage(
        node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode,
    ): Promise<ResolvedWithApiDefinition> {
        const maybeItems = await Promise.all(
            node.children.map((item) =>
                visitDiscriminatedUnion(item)._visit<Promise<ResolvedPackageItem | undefined>>({
                    endpoint: async (endpoint) => {
                        const cached = await this.cache?.getResolvedEndpoint({
                            apiDefinitionId: endpoint.apiDefinitionId,
                            endpointId: endpoint.endpointId,
                        });
                        if (cached != null) {
                            return cached;
                        }
                        const resolvedEndpoint = await this.definitionResolver.resolveEndpointDefinition(endpoint);
                        await this.cache?.putResolvedEndpoint({
                            apiDefinitionId: endpoint.apiDefinitionId,
                            endpoint: resolvedEndpoint,
                        });
                        return resolvedEndpoint;
                    },
                    endpointPair: async (endpointPair) => {
                        if (this.featureFlags.isBatchStreamToggleDisabled) {
                            captureSentryErrorMessage(
                                "Batch stream toggle is disabled, but an endpoint pair was found",
                            );
                        }
                        const [nonStream, stream] = await Promise.all([
                            this.definitionResolver.resolveEndpointDefinition(endpointPair.nonStream),
                            this.definitionResolver.resolveEndpointDefinition(endpointPair.stream),
                        ]);
                        nonStream.stream = stream;
                        return nonStream;
                    },
                    link: async () => undefined,
                    webSocket: (websocket) => this.definitionResolver.resolveWebsocketChannel(websocket),
                    webhook: (webhook) => this.definitionResolver.resolveWebhookDefinition(webhook),
                    apiPackage: (section) => this.resolveSubpackage(section),
                    page: async (page) => {
                        const pageContent = this.pages[page.pageId];
                        if (pageContent == null) {
                            return undefined;
                        }
                        return {
                            type: "page",
                            id: page.pageId,
                            slug: page.slug,
                            title: page.title,
                            markdown: await this.serializeMdx(pageContent.markdown, {
                                ...this.mdxOptions,
                                filename: page.pageId,
                                frontmatterDefaults: {
                                    title: page.title,
                                    breadcrumbs: [], // TODO: implement breadcrumbs
                                    "edit-this-page-url": pageContent.editThisPageUrl,
                                    "hide-nav-links": true,
                                    layout: "reference",
                                    "force-toc": this.featureFlags.isTocDefaultEnabled,
                                },
                            }),
                        };
                    },
                }),
            ),
        );

        const items = maybeItems.filter(isNonNullish);

        if (node.overviewPageId != null && this.pages[node.overviewPageId] != null) {
            const pageContent = this.pages[node.overviewPageId];
            if (pageContent != null) {
                items.unshift({
                    type: "page",
                    id: node.overviewPageId,
                    slug: node.slug,
                    title: node.title,
                    markdown: await this.serializeMdx(pageContent.markdown, {
                        ...this.mdxOptions,
                        filename: node.overviewPageId,
                        frontmatterDefaults: {
                            title: node.title,
                            breadcrumbs: [], // TODO: implement breadcrumbs
                            "edit-this-page-url": pageContent.editThisPageUrl,
                            "hide-nav-links": true,
                            layout: "reference",
                            "force-toc": this.featureFlags.isTocDefaultEnabled,
                        },
                    }),
                });
            } else {
                // TODO: alert if the page is null
            }
        }

        return {
            items,
            slug: node.slug,
        };
    }

    async resolveSubpackage(subpackage: FernNavigation.ApiPackageNode): Promise<ResolvedSubpackage | undefined> {
        const { items } = await this.resolveApiDefinitionPackage(subpackage);

        if (subpackage == null || items.length === 0) {
            return undefined;
        }
        return {
            // description: await this.serializeMdx(subpackage.description),
            description: undefined,
            availability: undefined,
            title: subpackage.title,
            type: "subpackage",
            slug: subpackage.slug,
            items,
        };
    }
}
