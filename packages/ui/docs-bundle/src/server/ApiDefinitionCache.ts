import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { kv } from "@vercel/kv";

const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

export class ApiDefinitionKVCache {
    private static instance: Map<string, ApiDefinitionKVCache> = new Map<string, ApiDefinitionKVCache>();
    public static getInstance(domain: string, api: ApiDefinition.ApiDefinitionId): ApiDefinitionKVCache {
        const key = `${domain}:${api}`;
        const instance = ApiDefinitionKVCache.instance.get(key);
        if (!instance) {
            const newInstance = new ApiDefinitionKVCache(domain, api);
            ApiDefinitionKVCache.instance.set(key, newInstance);
            return newInstance;
        } else {
            return instance;
        }
    }

    private constructor(
        private domain: string,
        private api: string,
    ) {}

    private createKey(key: string): string {
        return `${PREFIX}:${this.domain}:${this.api}:${key}`;
    }

    private async getResolvedDescription(key: string): Promise<FernDocs.MarkdownText | null> {
        return kv.get<FernDocs.MarkdownText>(this.createKey(key));
    }

    private async setResolvedDescription(description: FernDocs.MarkdownText, key: string): Promise<void> {
        await kv.set(this.createKey(key), description);
    }

    public async resolveDescription(
        description: FernDocs.MarkdownText,
        key: string,
        resolver: (description: string) => Promise<FernDocs.MarkdownText>,
    ): Promise<FernDocs.MarkdownText> {
        if (typeof description !== "string") {
            // description is already ResolvedMdx.
            return description;
        }

        const cached = await this.getResolvedDescription(key);
        if (cached) {
            return cached;
        }

        const resolved = await resolver(description);
        await this.setResolvedDescription(resolved, key);
        return resolved;
    }
}
