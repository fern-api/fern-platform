import type { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { ApiDefinitionResolverCache, ResolvedEndpointDefinition } from "@fern-ui/ui";
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

    public async putResolvedEndpoint(endpoint: ResolvedEndpointDefinition): Promise<void> {
        await kv.sadd(this.getResovledEndpointId(endpoint.id), endpoint);
    }

    public getResolvedEndpoint(id: APIV1Read.EndpointId): Promise<ResolvedEndpointDefinition | null | undefined> {
        return kv.get(this.getResovledEndpointId(id));
    }

    private getResovledEndpointId(id: APIV1Read.EndpointId): string {
        return `${PREFIX}:${this.domain}:resolved-endpoint:${id}`;
    }
}
