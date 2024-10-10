import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { kv } from "@vercel/kv";
import { MarkdownKVCache } from "./MarkdownKVCache";

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

    private markdownCache: MarkdownKVCache;
    private constructor(
        private domain: string,
        private api: string,
    ) {
        this.markdownCache = MarkdownKVCache.getInstance(domain);
    }

    private createKey(key: string): string {
        return `${PREFIX}:${this.domain}:${this.api}:${key}`;
    }

    public async getApiDefinition(additionalKey = ""): Promise<ApiDefinition.ApiDefinition | null> {
        const key = this.createKey(`api-definition/${additionalKey}`);
        try {
            return kv.get<ApiDefinition.ApiDefinition>(key);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not get ${key} from cache`, e);
            return null;
        }
    }

    public async setApiDefinition(apiDefinition: ApiDefinition.ApiDefinition, additionalKey = ""): Promise<void> {
        const key = this.createKey(`api-definition/${additionalKey}`);
        try {
            await kv.set(key, apiDefinition);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Could not set ${key} in cache`, e);
        }
    }

    private async getResolvedDescription(key: string): Promise<FernDocs.MarkdownText | null> {
        return this.markdownCache.getMarkdownText(`${this.api}:${key}`);
    }

    private async mgetResolvedDescriptions(keys: string[]): Promise<Record<string, FernDocs.MarkdownText>> {
        return this.markdownCache.mgetMarkdownText(keys.map((key) => `${this.api}:${key}`));
    }

    private async setResolvedDescription(description: FernDocs.MarkdownText, key: string): Promise<void> {
        await this.markdownCache.setMarkdownText(`${this.api}:${key}`, description);
    }

    private async msetResolvedDescriptions(records: Record<string, FernDocs.MarkdownText>): Promise<void> {
        await this.markdownCache.msetMarkdownText(
            Object.fromEntries(Object.entries(records).map(([key, value]) => [`${this.api}:${key}`, value])),
        );
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
