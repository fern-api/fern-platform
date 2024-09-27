import type { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import {
    ApiDefinitionResolverCache,
    ResolvedApiPageMetadata,
    ResolvedEndpointDefinition,
    ResolvedTypeDefinition,
} from "@fern-ui/ui";
import { kv } from "@vercel/kv";

const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export class DocsKVCache implements ApiDefinitionResolverCache {
    private static instance: Map<string, DocsKVCache>;

    private constructor(private domain: string) {}

    public static getInstance(domain: string): DocsKVCache {
        if (!DocsKVCache.instance) {
            DocsKVCache.instance = new Map<string, DocsKVCache>();
        }

        const instance = DocsKVCache.instance.get(domain);
        if (!instance) {
            const newInstance = new DocsKVCache(domain);
            DocsKVCache.instance.set(domain, newInstance);
            return newInstance;
        } else {
            return instance;
        }
    }

    public async addVisitedSlugs(...slug: FernNavigation.Slug[]): Promise<void> {
        await kv.sadd(`${PREFIX}:${this.domain}:visited-slugs`, ...slug);
    }

    public async getVisitedSlugs(): Promise<FernNavigation.Slug[]> {
        return kv.smembers(`${PREFIX}:${this.domain}:visited-slugs`);
    }

    public async removeVisitedSlugs(...slug: FernNavigation.Slug[]): Promise<void> {
        await kv.srem(`${PREFIX}:${this.domain}:visited-slugs`, ...slug);
    }

    async putResolvedEndpoint({
        apiDefinitionId,
        endpoint,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        endpoint: ResolvedEndpointDefinition;
    }): Promise<void> {
        await kv.set(this.getResovledEndpointId({ apiDefinitionId, endpointId: endpoint.id }), endpoint);
    }
    async getResolvedEndpoint({
        apiDefinitionId,
        endpointId,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        endpointId: APIV1Read.EndpointId;
    }): Promise<ResolvedEndpointDefinition | null | undefined> {
        return await kv.get(this.getResovledEndpointId({ apiDefinitionId, endpointId }));
    }

    private getResovledEndpointId({
        apiDefinitionId,
        endpointId,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        endpointId: APIV1Read.EndpointId;
    }): string {
        return `${PREFIX}:${this.domain}:${apiDefinitionId}:endpoint:${endpointId}`;
    }

    async putApiPageMetadata({
        apiDefinitionId,
        page,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        page: ResolvedApiPageMetadata;
    }): Promise<void> {
        await kv.set(this.getResovledApiPageId({ apiDefinitionId, pageId: page.id }), page);
    }

    async getApiPageMetadata({
        apiDefinitionId,
        pageId,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        pageId: APIV1Read.PageId;
    }): Promise<ResolvedApiPageMetadata | null | undefined> {
        return await kv.get(this.getResovledApiPageId({ apiDefinitionId, pageId }));
    }

    private getResovledApiPageId({
        apiDefinitionId,
        pageId,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        pageId: APIV1Read.PageId;
    }): string {
        return `${PREFIX}:${this.domain}:${apiDefinitionId}:api-page:${pageId}`;
    }

    async putResolvedTypeDeclaration({
        apiDefinitionId,
        typeId,
        type,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        typeId: APIV1Read.TypeId;
        type: ResolvedTypeDefinition;
    }): Promise<void> {
        await kv.set(this.getResolvedTypeId({ apiDefinitionId, typeId }), type);
    }
    async getResolvedTypeDeclaration({
        apiDefinitionId,
        typeId,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        typeId: APIV1Read.TypeId;
    }): Promise<ResolvedTypeDefinition | null | undefined> {
        return await kv.get(this.getResolvedTypeId({ apiDefinitionId, typeId }));
    }

    private getResolvedTypeId({
        apiDefinitionId,
        typeId,
    }: {
        apiDefinitionId: APIV1Read.ApiDefinitionId;
        typeId: APIV1Read.TypeId;
    }): string {
        return `${PREFIX}:${this.domain}:${apiDefinitionId}:type:${typeId}`;
    }
}
