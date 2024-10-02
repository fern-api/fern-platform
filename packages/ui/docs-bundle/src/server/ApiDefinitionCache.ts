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
        try {
            return kv.get<FernDocs.MarkdownText>(this.createKey(key));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return null;
        }
    }

    private async mgetResolvedDescriptions(keys: string[]): Promise<Record<string, FernDocs.MarkdownText>> {
        const toRet: Record<string, FernDocs.MarkdownText> = {};
        try {
            const response = await kv.mget<(FernDocs.MarkdownText | null)[]>(keys);
            keys.map((key, index) => [key, response[index] ?? null] as const).forEach(([key, value]) => {
                if (value != null) {
                    toRet[key] = value;
                }
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
        return toRet;
    }

    private async setResolvedDescription(description: FernDocs.MarkdownText, key: string): Promise<void> {
        try {
            await kv.set(this.createKey(key), description);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    // TODO: validate that mset records is <1MB or else this will throw!
    private async msetResolvedDescriptions(records: Record<string, FernDocs.MarkdownText>): Promise<void> {
        try {
            await kv.mset(records);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
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

    public async batchResolveDescriptions(
        records: Record<string, FernDocs.MarkdownText>,
        resolver: (description: string) => Promise<FernDocs.MarkdownText>,
    ): Promise<Record<string, FernDocs.MarkdownText>> {
        const hits = await this.mgetResolvedDescriptions(Object.keys(records));

        const misses = Object.entries(records).filter(([key]) => !(key in hits));

        const resolved = Object.fromEntries(
            await Promise.all(
                misses.map(async ([key, description]) => {
                    if (typeof description !== "string") {
                        return [key, description] as const;
                    }
                    return [key, await resolver(description)] as const;
                }),
            ),
        );

        await this.msetResolvedDescriptions(resolved);

        return { ...hits, ...resolved };
    }
}
